import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Usage data validation schema
const UsageDataSchema = z.object({
    fileSize: z.number().min(0),
    fileSizes: z.array(z.number()).optional(), // For batch processing
    generatedSizes: z.array(z.number()),
    backgroundColor: z.string(),
    padding: z.number().min(0).max(50),
    format: z.enum(['png', 'webp', 'jpeg']),
    processingTime: z.number().min(0),
    batchSize: z.number().min(1).default(1),
    compressionStats: z.object({
        originalSize: z.number(),
        compressedSize: z.number(),
        compressionRatio: z.number(),
        bytesSaved: z.number()
    }).optional(),
    performanceMetrics: z.object({
        imageLoadTime: z.number(),
        canvasProcessingTime: z.number(),
        compressionTime: z.number(),
        totalProcessingTime: z.number()
    }).optional(),
    successfulSizes: z.number().default(0),
    warnings: z.array(z.string()).optional(),
    userAgent: z.string().optional(),
    timestamp: z.number().default(() => Date.now())
});

// Rate limiting storage (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per hour

/**
 * Privacy-compliant usage tracking for favicon generator
 * Tracks anonymized usage statistics for analytics
 */
export async function POST(request: NextRequest) {
    try {
        // Get client IP for rate limiting (anonymized)
        const clientIP = getAnonymizedIP(request);

        // Check rate limiting
        const rateLimitResult = checkRateLimit(clientIP);
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Rate limit exceeded. Please try again later.',
                    retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
                    }
                }
            );
        }

        const body = await request.json();
        const usageData = UsageDataSchema.parse(body);

        // Process and anonymize the data
        const anonymizedData = {
            // File metrics (anonymized - no actual file content)
            fileSizeCategory: categorizeFileSize(usageData.fileSize),
            batchSizeCategory: categorizeBatchSize(usageData.batchSize),
            generatedSizesCount: usageData.generatedSizes.length,

            // Processing metrics
            processingTimeCategory: categorizeProcessingTime(usageData.processingTime),
            successRate: usageData.successfulSizes / usageData.generatedSizes.length,

            // Configuration preferences (anonymized)
            backgroundColorType: categorizeBackgroundColor(usageData.backgroundColor),
            paddingCategory: categorizePadding(usageData.padding),
            formatPreference: usageData.format,

            // Performance metrics (if provided)
            performanceCategory: usageData.performanceMetrics ?
                categorizePerformance(usageData.performanceMetrics) : undefined,

            // Compression metrics (if provided)
            compressionEfficiency: usageData.compressionStats ?
                categorizeCompressionRatio(usageData.compressionStats.compressionRatio) : undefined,

            // Usage patterns
            hasWarnings: (usageData.warnings?.length || 0) > 0,
            warningCategories: usageData.warnings?.map(categorizeWarning) || [],

            // Timestamp for analytics (rounded to hour for privacy)
            hour: new Date(usageData.timestamp).toISOString().slice(0, 13) + ':00:00.000Z',

            // Basic technical info (anonymized)
            browserType: usageData.userAgent ? categorizeBrowser(usageData.userAgent) : 'unknown'
        };

        // Log anonymized data (in production, send to analytics service)
        console.log('Favicon Generator Usage:', JSON.stringify(anonymizedData, null, 2));

        // In a real implementation, you would:
        // 1. Store in analytics database
        // 2. Send to analytics service (e.g., Google Analytics, Plausible)
        // 3. Update usage counters

        // Simulate database storage delay
        await new Promise(resolve => setTimeout(resolve, 10));

        return NextResponse.json({
            success: true,
            message: 'Usage data recorded',
            anonymized: true,
            timestamp: Date.now()
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
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to record usage data'
            },
            { status: 500 }
        );
    }
}

/**
 * Get usage statistics (anonymized aggregated data)
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'stats') {
        // Return anonymized aggregate statistics
        return NextResponse.json({
            message: 'Usage statistics would be aggregated from anonymized data',
            categories: {
                fileSizes: ['small', 'medium', 'large', 'very-large'],
                processingTimes: ['fast', 'medium', 'slow'],
                formats: ['png', 'webp', 'jpeg'],
                backgroundColors: ['transparent', 'white', 'black', 'custom'],
                compressionRatios: ['low', 'medium', 'high', 'very-high']
            },
            privacy: 'All data is anonymized and aggregated'
        });
    }

    return NextResponse.json({
        status: 'healthy',
        service: 'favicon-usage-tracking',
        endpoints: ['POST /usage', 'GET /usage?action=stats'],
        privacy: 'Anonymized data collection only',
        rateLimit: `${RATE_LIMIT_MAX_REQUESTS} requests per hour`
    });
}

// Helper functions for data categorization and anonymization

function getAnonymizedIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const ip = forwarded ? forwarded.split(',')[0] : realIP || 'unknown';

    // Anonymize IP by removing last octet
    if (ip === 'unknown' || !ip.includes('.')) {
        return 'unknown';
    }
    return ip.split('.').slice(0, 3).join('.') + '.0';
}

function checkRateLimit(clientIP: string): { allowed: boolean; resetTime: number } {
    const now = Date.now();
    const key = clientIP;

    let limit = rateLimitStore.get(key);

    if (!limit || now > limit.resetTime) {
        // Reset or initialize
        limit = { count: 1, resetTime: now + RATE_LIMIT_WINDOW };
        rateLimitStore.set(key, limit);
        return { allowed: true, resetTime: limit.resetTime };
    }

    if (limit.count >= RATE_LIMIT_MAX_REQUESTS) {
        return { allowed: false, resetTime: limit.resetTime };
    }

    limit.count++;
    return { allowed: true, resetTime: limit.resetTime };
}

function categorizeFileSize(size: number): string {
    if (size < 100 * 1024) return 'small'; // < 100KB
    if (size < 1024 * 1024) return 'medium'; // < 1MB
    if (size < 5 * 1024 * 1024) return 'large'; // < 5MB
    return 'very-large'; // >= 5MB
}

function categorizeBatchSize(size: number): string {
    if (size === 1) return 'single';
    if (size <= 3) return 'small-batch';
    if (size <= 10) return 'medium-batch';
    return 'large-batch';
}

function categorizeProcessingTime(time: number): string {
    if (time < 1000) return 'fast'; // < 1s
    if (time < 5000) return 'medium'; // < 5s
    if (time < 15000) return 'slow'; // < 15s
    return 'very-slow'; // >= 15s
}

function categorizeBackgroundColor(color: string): string {
    if (color === 'transparent') return 'transparent';
    if (color === 'white' || color === '#ffffff') return 'white';
    if (color === 'black' || color === '#000000') return 'black';
    return 'custom';
}

function categorizePadding(padding: number): string {
    if (padding === 0) return 'none';
    if (padding <= 10) return 'small';
    if (padding <= 25) return 'medium';
    return 'large';
}

function categorizePerformance(metrics: { totalProcessingTime: number }): string {
    const total = metrics.totalProcessingTime;
    if (total < 2000) return 'excellent';
    if (total < 5000) return 'good';
    if (total < 10000) return 'acceptable';
    return 'slow';
}

function categorizeCompressionRatio(ratio: number): string {
    if (ratio < 0.5) return 'very-high'; // > 50% compression
    if (ratio < 0.7) return 'high'; // 30-50% compression
    if (ratio < 0.9) return 'medium'; // 10-30% compression
    return 'low'; // < 10% compression
}

function categorizeWarning(warning: string): string {
    if (warning.includes('large') || warning.includes('size')) return 'size-warning';
    if (warning.includes('quality') || warning.includes('resolution')) return 'quality-warning';
    if (warning.includes('format') || warning.includes('type')) return 'format-warning';
    if (warning.includes('memory') || warning.includes('performance')) return 'performance-warning';
    return 'other-warning';
}

function categorizeBrowser(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    if (ua.includes('chrome')) return 'chrome';
    if (ua.includes('firefox')) return 'firefox';
    if (ua.includes('safari')) return 'safari';
    if (ua.includes('edge')) return 'edge';
    return 'other';
} 