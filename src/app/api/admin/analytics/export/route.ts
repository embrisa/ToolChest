import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/services/admin/analyticsService';
import type { AnalyticsFilter, ExportOptions } from '@/types/admin/analytics';

const analyticsService = AnalyticsService.getInstance();

// Rate limiting for export operations (more restrictive)
const exportCounts = new Map<string, { count: number; resetTime: number }>();
const EXPORT_RATE_LIMIT = 10; // exports per window
const EXPORT_RATE_WINDOW = 60 * 60 * 1000; // 1 hour

// Export cache (exports are expensive operations)
const exportCache = new Map<string, { data: any; timestamp: number; format: string }>();
const EXPORT_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

function getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');

    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    if (realIP) {
        return realIP;
    }
    return 'unknown';
}

function checkExportRateLimit(clientIP: string): boolean {
    const now = Date.now();
    const current = exportCounts.get(clientIP);

    if (!current || now > current.resetTime) {
        exportCounts.set(clientIP, { count: 1, resetTime: now + EXPORT_RATE_WINDOW });
        return true;
    }

    if (current.count >= EXPORT_RATE_LIMIT) {
        return false;
    }

    current.count++;
    return true;
}

function getExportCacheKey(exportOptions: ExportOptions, filter?: AnalyticsFilter): string {
    return JSON.stringify({ exportOptions, filter });
}

function isValidExportCache(entry: { data: any; timestamp: number }): boolean {
    return Date.now() - entry.timestamp < EXPORT_CACHE_DURATION;
}

export async function POST(request: NextRequest) {
    try {
        // Check rate limit
        const clientIP = getClientIP(request);
        if (!checkExportRateLimit(clientIP)) {
            const current = exportCounts.get(clientIP);
            const retryAfter = current ? Math.ceil((current.resetTime - Date.now()) / 1000) : 3600;

            return NextResponse.json(
                {
                    success: false,
                    error: 'Export rate limit exceeded',
                    message: `Maximum ${EXPORT_RATE_LIMIT} exports per hour allowed`,
                    retryAfter,
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': retryAfter.toString(),
                        'X-RateLimit-Limit': EXPORT_RATE_LIMIT.toString(),
                        'X-RateLimit-Remaining': '0',
                    },
                }
            );
        }

        const body = await request.json();
        const { exportOptions, filter }: { exportOptions: ExportOptions; filter?: AnalyticsFilter } = body;

        // Validate export options
        if (!exportOptions.format || !['csv', 'pdf', 'json'].includes(exportOptions.format)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid export format. Must be csv, pdf, or json.',
                },
                { status: 400 }
            );
        }

        // Determine what to include in export based on ExportOptions properties
        const includeCharts = exportOptions.includeCharts !== false; // Default to true
        const includeRawData = exportOptions.includeRawData !== false; // Default to true

        // Check cache first
        const cacheKey = getExportCacheKey(exportOptions, filter);
        const cached = exportCache.get(cacheKey);

        if (cached && isValidExportCache(cached)) {
            const current = exportCounts.get(clientIP);
            const remaining = current ? Math.max(0, EXPORT_RATE_LIMIT - current.count) : EXPORT_RATE_LIMIT - 1;

            if (exportOptions.format === 'csv') {
                return new NextResponse(cached.data, {
                    headers: {
                        'Content-Type': 'text/csv',
                        'Content-Disposition': `attachment; filename="${exportOptions.filename || 'analytics_export'}.csv"`,
                        'X-Cache': 'HIT',
                        'X-RateLimit-Limit': EXPORT_RATE_LIMIT.toString(),
                        'X-RateLimit-Remaining': remaining.toString(),
                    },
                });
            }

            return NextResponse.json({
                success: true,
                data: cached.data,
                cached: true,
                format: exportOptions.format,
                filename: `${exportOptions.filename || 'analytics_export'}.${exportOptions.format}`,
            }, {
                headers: {
                    'X-Cache': 'HIT',
                    'X-RateLimit-Limit': EXPORT_RATE_LIMIT.toString(),
                    'X-RateLimit-Remaining': remaining.toString(),
                },
            });
        }

        // Generate export data
        const startTime = Date.now();
        const exportData = await analyticsService.exportAnalytics(exportOptions, filter);
        const processingTime = Date.now() - startTime;

        const filename = exportOptions.filename || `analytics_export_${Date.now()}`;
        const current = exportCounts.get(clientIP);
        const remaining = current ? Math.max(0, EXPORT_RATE_LIMIT - current.count) : EXPORT_RATE_LIMIT - 1;

        if (exportOptions.format === 'csv') {
            const csvData = convertToEnhancedCSV(exportData, includeCharts, includeRawData);

            // Cache the CSV data
            exportCache.set(cacheKey, {
                data: csvData,
                timestamp: Date.now(),
                format: 'csv',
            });

            return new NextResponse(csvData, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="${filename}.csv"`,
                    'X-Cache': 'MISS',
                    'X-Processing-Time': `${processingTime}ms`,
                    'X-RateLimit-Limit': EXPORT_RATE_LIMIT.toString(),
                    'X-RateLimit-Remaining': remaining.toString(),
                },
            });
        }

        if (exportOptions.format === 'json') {
            // Enhanced JSON export with metadata
            const jsonData = {
                metadata: {
                    exportedAt: new Date().toISOString(),
                    includeCharts,
                    includeRawData,
                    filter: filter || null,
                    processingTime: `${processingTime}ms`,
                    totalRecords: getTotalRecordsCount(exportData),
                },
                data: exportData,
            };

            // Cache the JSON data
            exportCache.set(cacheKey, {
                data: jsonData,
                timestamp: Date.now(),
                format: 'json',
            });

            return NextResponse.json({
                success: true,
                data: jsonData,
                cached: false,
                filename: `${filename}.json`,
                processingTime: `${processingTime}ms`,
            }, {
                headers: {
                    'X-Cache': 'MISS',
                    'X-Processing-Time': `${processingTime}ms`,
                    'X-RateLimit-Limit': EXPORT_RATE_LIMIT.toString(),
                    'X-RateLimit-Remaining': remaining.toString(),
                },
            });
        }

        if (exportOptions.format === 'pdf') {
            // For PDF, return structured data for client-side PDF generation
            const pdfData = {
                title: 'ToolChest Analytics Report',
                generatedAt: new Date().toISOString(),
                filter: filter || null,
                includeCharts,
                includeRawData,
                data: exportData,
                summary: generateExportSummary(exportData),
            };

            // Cache the PDF data
            exportCache.set(cacheKey, {
                data: pdfData,
                timestamp: Date.now(),
                format: 'pdf',
            });

            return NextResponse.json({
                success: true,
                data: pdfData,
                cached: false,
                message: 'PDF data ready for client-side generation',
                filename: `${filename}.pdf`,
                processingTime: `${processingTime}ms`,
            }, {
                headers: {
                    'X-Cache': 'MISS',
                    'X-Processing-Time': `${processingTime}ms`,
                    'X-RateLimit-Limit': EXPORT_RATE_LIMIT.toString(),
                    'X-RateLimit-Remaining': remaining.toString(),
                },
            });
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Unsupported export format',
            },
            { status: 400 }
        );

    } catch (error) {
        console.error('Export API error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to export analytics data',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

function convertToEnhancedCSV(exportData: any, includeCharts: boolean, includeRawData: boolean): string {
    const sections: string[] = [];

    // Always include dashboard summary
    if (exportData.summary) {
        sections.push('# Dashboard Summary');
        sections.push('Metric,Value');
        sections.push(`Total Tools,${exportData.summary.totalTools}`);
        sections.push(`Total Tags,${exportData.summary.totalTags}`);
        sections.push(`Total Usage,${exportData.summary.totalUsage}`);
        sections.push(`Active Users,${exportData.summary.activeUsers}`);
        sections.push('');
    }

    // Include tool usage if raw data is requested
    if (includeRawData && exportData.toolUsage) {
        sections.push('# Tool Usage Statistics');
        sections.push('Tool Name,Usage Count,Unique Users,Last Used,Daily Growth %,Weekly Growth %');
        exportData.toolUsage.forEach((tool: any) => {
            sections.push([
                tool.toolName,
                tool.usageCount,
                tool.uniqueUsers,
                tool.lastUsed,
                tool.growth?.dailyGrowth?.toFixed(2) || '0.00',
                tool.growth?.weeklyGrowth?.toFixed(2) || '0.00',
            ].map((field: any) => `"${field}"`).join(','));
        });
        sections.push('');
    }

    // Include system metrics if available
    if (exportData.systemMetrics) {
        sections.push('# System Metrics');
        sections.push('Metric,Current Value,Status');
        const metrics = exportData.systemMetrics;
        if (metrics.memoryUsage) {
            const memUsage = (metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal) * 100;
            sections.push(`Memory Usage,"${memUsage.toFixed(1)}%","${memUsage > 80 ? 'Warning' : 'Normal'}"`);
        }
        if (metrics.apiResponseTimes) {
            sections.push(`API Response Time,"${metrics.apiResponseTimes.average}ms","${metrics.apiResponseTimes.average > 1000 ? 'Slow' : 'Normal'}"`);
        }
        if (metrics.errorRates) {
            sections.push(`Error Rate,"${metrics.errorRates.overall}%","${metrics.errorRates.overall > 5 ? 'High' : 'Normal'}"`);
        }
        sections.push('');
    }

    // Include charts data if requested
    if (includeCharts && exportData.charts) {
        sections.push('# Charts Data');
        exportData.charts.forEach((chart: any) => {
            sections.push(`## ${chart.title}`);
            sections.push('Label,Value');
            chart.data.forEach((point: any) => {
                sections.push(`"${point.label}","${point.value}"`);
            });
            sections.push('');
        });
    }

    return sections.join('\n');
}

function getTotalRecordsCount(exportData: any): number {
    let total = 0;
    if (exportData.toolUsage) total += exportData.toolUsage.length;
    if (exportData.summary) total += 1; // Summary counts as 1 record
    if (exportData.charts) total += exportData.charts.length;
    return total;
}

function generateExportSummary(exportData: any): any {
    return {
        totalTools: exportData.toolUsage?.length || 0,
        totalCharts: exportData.charts?.length || 0,
        hasSummary: !!exportData.summary,
        hasSystemMetrics: !!exportData.systemMetrics,
        exportedSections: Object.keys(exportData).length,
        dataIntegrity: 'verified',
    };
} 