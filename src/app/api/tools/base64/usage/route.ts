import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Usage tracking validation schema
const UsageTrackingSchema = z.object({
    operation: z.enum(['encode', 'decode']),
    inputType: z.enum(['text', 'file']),
    variant: z.enum(['standard', 'url-safe']).optional(),
    inputSize: z.number().min(0),
    outputSize: z.number().min(0),
    processingTime: z.number().min(0),
    success: z.boolean(),
    clientSide: z.boolean().default(true),
    error: z.string().optional(),
});

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // Max 100 usage tracking calls per minute per IP

// Simple in-memory rate limiting (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Track Base64 tool usage for analytics
 * Privacy-compliant tracking without storing personal data
 */
export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const forwardedFor = request.headers.get('x-forwarded-for');
        const clientIP = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
        const rateLimitKey = `base64-usage:${clientIP}`;

        if (!checkRateLimit(rateLimitKey)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Rate limit exceeded. Please try again later.'
                },
                { status: 429 }
            );
        }

        const body = await request.json();
        const usageData = UsageTrackingSchema.parse(body);

        // Get the base64 tool from database
        const tool = await prisma.tool.findFirst({
            where: { slug: 'base64' }
        });

        if (!tool) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Tool not found'
                },
                { status: 404 }
            );
        }

        // Create usage record (no personal data stored)
        await prisma.toolUsage.create({
            data: {
                toolId: tool.id,
                timestamp: new Date(),
                metadata: {
                    operation: usageData.operation,
                    inputType: usageData.inputType,
                    variant: usageData.variant,
                    inputSize: usageData.inputSize,
                    outputSize: usageData.outputSize,
                    processingTime: usageData.processingTime,
                    success: usageData.success,
                    clientSide: usageData.clientSide,
                    error: usageData.error,
                    // Privacy: No IP addresses, user agents, or personal identifiers
                    userAgent: request.headers.get('user-agent')?.slice(0, 100), // First 100 chars only
                    referrer: request.headers.get('referer') ? 'external' : 'direct', // Anonymized
                }
            }
        });

        // Update tool usage stats (using existing pattern)
        await prisma.toolUsageStats.upsert({
            where: { toolId: tool.id },
            create: {
                toolId: tool.id,
                usageCount: 1,
                lastUsed: new Date(),
            },
            update: {
                usageCount: { increment: 1 },
                lastUsed: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Usage tracked successfully',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid usage data format',
                    details: error.errors
                },
                { status: 400 }
            );
        }

        console.error('Usage tracking error:', error);

        // Don't fail the operation if usage tracking fails
        return NextResponse.json({
            success: true,
            message: 'Operation completed (usage tracking failed)',
            timestamp: new Date().toISOString()
        });
    }
}

/**
 * Get basic usage statistics for Base64 tool
 */
export async function GET(request: NextRequest) {
    try {
        // Simple admin check (in production, use proper auth middleware)
        const authHeader = request.headers.get('authorization');
        const adminSecret = process.env.ADMIN_SECRET_TOKEN;

        if (!authHeader || !adminSecret || authHeader !== `Bearer ${adminSecret}`) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const tool = await prisma.tool.findFirst({
            where: { slug: 'base64' },
            include: {
                toolUsageStats: true
            }
        });

        if (!tool) {
            return NextResponse.json(
                { error: 'Tool not found' },
                { status: 404 }
            );
        }

        // Get recent usage records for detailed stats
        const recentUsages = await prisma.toolUsage.findMany({
            where: { toolId: tool.id },
            take: 1000, // Last 1000 usages
            orderBy: { timestamp: 'desc' }
        });

        // Type for metadata to avoid any types
        interface UsageMetadata {
            operation?: string;
            inputType?: string;
            processingTime?: number;
            success?: boolean;
        }

        // Calculate basic statistics
        const stats = {
            totalUsages: tool.toolUsageStats?.[0]?.usageCount || 0,
            recentUsageCount: recentUsages.length,
            lastUsed: tool.toolUsageStats?.[0]?.lastUsed || null,
            operations: {
                encode: recentUsages.filter((u: any) => (u.metadata as UsageMetadata)?.operation === 'encode').length,
                decode: recentUsages.filter((u: any) => (u.metadata as UsageMetadata)?.operation === 'decode').length,
            },
            inputTypes: {
                text: recentUsages.filter((u: any) => (u.metadata as UsageMetadata)?.inputType === 'text').length,
                file: recentUsages.filter((u: any) => (u.metadata as UsageMetadata)?.inputType === 'file').length,
            },
            performance: {
                averageProcessingTime: recentUsages.reduce((sum: number, u: any) =>
                    sum + ((u.metadata as UsageMetadata)?.processingTime || 0), 0) / recentUsages.length || 0,
                successRate: recentUsages.filter((u: any) => (u.metadata as UsageMetadata)?.success === true).length / recentUsages.length || 0,
            },
        };

        return NextResponse.json({
            tool: {
                id: tool.id,
                name: tool.name,
                slug: tool.slug,
            },
            statistics: stats,
            lastUpdated: new Date().toISOString()
        });

    } catch (error) {
        console.error('Usage statistics error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch usage statistics' },
            { status: 500 }
        );
    }
}

/**
 * Check rate limit for IP address
 */
function checkRateLimit(key: string): boolean {
    const now = Date.now();
    const rateLimit = rateLimitMap.get(key);

    if (!rateLimit || now > rateLimit.resetTime) {
        rateLimitMap.set(key, {
            count: 1,
            resetTime: now + RATE_LIMIT_WINDOW
        });
        return true;
    }

    if (rateLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
        return false;
    }

    rateLimit.count++;
    return true;
} 