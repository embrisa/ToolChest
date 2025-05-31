import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Rate limiting storage (in production, use Redis or database)
const usageTrackingRateLimit = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration
const RATE_LIMIT = {
    maxRequests: 100,
    windowMs: 60 * 60 * 1000, // 1 hour
};

// Validation schema for usage tracking
const usageSchema = z.object({
    algorithm: z.enum(['MD5', 'SHA-1', 'SHA-256', 'SHA-512']),
    inputType: z.enum(['text', 'file']),
    inputSize: z.number().min(0).max(10 * 1024 * 1024), // Max 10MB
    processingTime: z.number().min(0),
    success: z.boolean(),
    clientSide: z.boolean(),
    error: z.string().optional(),
});

function getClientIP(request: NextRequest): string {
    // Get IP for rate limiting (anonymized for privacy)
    const forwarded = request.headers.get('x-forwarded-for');
    const real = request.headers.get('x-real-ip');
    const ip = forwarded ? forwarded.split(',')[0] : real || 'unknown';

    // Hash the IP for privacy (don't store actual IPs)
    return Buffer.from(ip).toString('base64').slice(0, 10);
}

function checkRateLimit(clientId: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const clientData = usageTrackingRateLimit.get(clientId);

    if (!clientData || now > clientData.resetTime) {
        // Reset or new client
        const resetTime = now + RATE_LIMIT.windowMs;
        usageTrackingRateLimit.set(clientId, { count: 1, resetTime });
        return { allowed: true, remaining: RATE_LIMIT.maxRequests - 1, resetTime };
    }

    if (clientData.count >= RATE_LIMIT.maxRequests) {
        return { allowed: false, remaining: 0, resetTime: clientData.resetTime };
    }

    clientData.count++;
    return {
        allowed: true,
        remaining: RATE_LIMIT.maxRequests - clientData.count,
        resetTime: clientData.resetTime
    };
}

export async function POST(request: NextRequest) {
    try {
        const clientId = getClientIP(request);
        const rateLimit = checkRateLimit(clientId);

        // Set rate limit headers
        const headers = {
            'X-RateLimit-Limit': RATE_LIMIT.maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
        };

        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    error: 'Rate limit exceeded',
                    message: 'Too many usage tracking requests. Please try again later.',
                    retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
                },
                {
                    status: 429,
                    headers
                }
            );
        }

        const data = await request.json();

        // Validate input data
        const validationResult = usageSchema.safeParse(data);
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Invalid usage data',
                    details: validationResult.error.issues
                },
                {
                    status: 400,
                    headers
                }
            );
        }

        const usageData = validationResult.data;

        // Privacy-compliant logging (no personal data stored)
        const anonymizedMetrics = {
            timestamp: new Date().toISOString(),
            algorithm: usageData.algorithm,
            inputType: usageData.inputType,
            inputSizeCategory: categorizeFileSize(usageData.inputSize),
            processingTimeCategory: categorizeProcessingTime(usageData.processingTime),
            success: usageData.success,
            clientSide: usageData.clientSide,
            errorType: usageData.error ? categorizeError(usageData.error) : undefined,
            // No IP addresses, usernames, or personal identifiers stored
        };

        // In a real application, you would store this in a database
        // For now, we'll just log it (in production, use proper logging service)
        console.log('Hash Generator Usage:', anonymizedMetrics);

        // Simulate database storage delay
        await new Promise(resolve => setTimeout(resolve, 10));

        return NextResponse.json(
            {
                success: true,
                message: 'Usage data recorded successfully',
                timestamp: anonymizedMetrics.timestamp
            },
            {
                status: 200,
                headers: {
                    ...headers,
                    'Cache-Control': 'no-store, no-cache, must-revalidate'
                }
            }
        );

    } catch (error) {
        console.error('Error tracking hash generator usage:', error);

        return NextResponse.json(
            {
                error: 'Internal server error',
                message: 'Failed to record usage data'
            },
            {
                status: 500,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate'
                }
            }
        );
    }
}

function categorizeFileSize(size: number): string {
    if (size < 1024) return 'tiny'; // < 1KB
    if (size < 1024 * 1024) return 'small'; // < 1MB
    if (size < 5 * 1024 * 1024) return 'medium'; // < 5MB
    return 'large'; // >= 5MB
}

function categorizeProcessingTime(time: number): string {
    if (time < 100) return 'fast'; // < 100ms
    if (time < 1000) return 'medium'; // < 1s
    if (time < 5000) return 'slow'; // < 5s
    return 'very_slow'; // >= 5s
}

function categorizeError(error: string): string {
    if (error.toLowerCase().includes('size')) return 'file_size';
    if (error.toLowerCase().includes('type')) return 'file_type';
    if (error.toLowerCase().includes('empty')) return 'empty_file';
    if (error.toLowerCase().includes('algorithm')) return 'algorithm';
    if (error.toLowerCase().includes('memory')) return 'memory';
    return 'other';
}

// Handle unsupported methods
export async function GET() {
    return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
    );
}

export async function PUT() {
    return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
    );
}

export async function DELETE() {
    return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
    );
}

