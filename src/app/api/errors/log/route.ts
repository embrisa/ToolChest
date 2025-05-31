import { NextRequest, NextResponse } from 'next/server';

interface ErrorLogData {
    errorId: string;
    message: string;
    stack?: string;
    componentStack?: string;
    timestamp: string;
    url: string;
    userAgent: string;
    context?: any;
    viewport?: {
        width: number;
        height: number;
    };
}

// Rate limiting map (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

function getClientIP(request: NextRequest): string {
    // Get IP from various headers (considering proxies)
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip');

    const ip = forwarded?.split(',')[0] || realIP || cfConnectingIP || '127.0.0.1';

    // Anonymize IP for privacy (keep first 3 octets for IPv4, first 4 groups for IPv6)
    if (ip.includes('.')) {
        // IPv4
        const parts = ip.split('.');
        return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
    } else if (ip.includes(':')) {
        // IPv6
        const parts = ip.split(':');
        return `${parts.slice(0, 4).join(':')}:xxxx:xxxx:xxxx:xxxx`;
    }

    return 'unknown';
}

function checkRateLimit(clientId: string): boolean {
    const now = Date.now();
    const clientData = rateLimitMap.get(clientId);

    if (!clientData || now > clientData.resetTime) {
        rateLimitMap.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return true;
    }

    if (clientData.count >= RATE_LIMIT) {
        return false;
    }

    clientData.count++;
    return true;
}

function sanitizeErrorData(data: ErrorLogData): Partial<ErrorLogData> {
    return {
        errorId: data.errorId,
        message: data.message.substring(0, 500), // Limit message length
        stack: data.stack?.substring(0, 2000), // Limit stack trace length
        componentStack: data.componentStack?.substring(0, 1000),
        timestamp: data.timestamp,
        url: data.url ? new URL(data.url).pathname : undefined, // Remove query params and domain
        userAgent: data.userAgent?.substring(0, 200), // Limit user agent length
        viewport: data.viewport,
        // Exclude potentially sensitive context data
    };
}

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const clientIP = getClientIP(request);
        if (!checkRateLimit(clientIP)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Rate limit exceeded',
                    message: 'Too many error reports. Please try again later.'
                },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': RATE_LIMIT.toString(),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': Math.ceil(Date.now() / 1000 + RATE_LIMIT_WINDOW / 1000).toString(),
                    }
                }
            );
        }

        const errorData: ErrorLogData = await request.json();

        // Validate required fields
        if (!errorData.errorId || !errorData.message || !errorData.timestamp) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing required fields',
                    message: 'errorId, message, and timestamp are required'
                },
                { status: 400 }
            );
        }

        // Sanitize the error data
        const sanitizedData = sanitizeErrorData(errorData);

        // Log error for debugging (in production, send to logging service)
        console.error('Client Error Logged:', {
            ...sanitizedData,
            clientIP,
            timestamp: new Date().toISOString(),
        });

        // In production, you might want to:
        // - Send to external error tracking service (Sentry, LogRocket, etc.)
        // - Store in database for analysis
        // - Send alerts for critical errors

        // Example: Save to database (uncomment when needed)
        /*
        if (process.env.NODE_ENV === 'production') {
          const prisma = new PrismaClient();
          await prisma.errorLog.create({
            data: {
              errorId: sanitizedData.errorId!,
              message: sanitizedData.message!,
              stack: sanitizedData.stack,
              timestamp: new Date(sanitizedData.timestamp!),
              url: sanitizedData.url,
              userAgent: sanitizedData.userAgent,
              viewport: sanitizedData.viewport ? JSON.stringify(sanitizedData.viewport) : null,
              clientIP,
            },
          });
        }
        */

        return NextResponse.json({
            success: true,
            message: 'Error logged successfully',
            errorId: sanitizedData.errorId,
        });

    } catch (error) {
        console.error('Failed to log client error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
                message: 'Failed to log error'
            },
            { status: 500 }
        );
    }
}

// Health check endpoint
export async function GET() {
    return NextResponse.json({
        success: true,
        message: 'Error logging endpoint is healthy',
        timestamp: new Date().toISOString(),
    });
} 