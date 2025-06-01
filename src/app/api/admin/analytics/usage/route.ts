import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Simple caching for usage data
const usageCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

// Rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // requests per window
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  return "unknown";
}

function checkRateLimit(clientIP: string): boolean {
  const now = Date.now();
  const current = requestCounts.get(clientIP);

  if (!current || now > current.resetTime) {
    requestCounts.set(clientIP, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (current.count >= RATE_LIMIT) {
    return false;
  }

  current.count++;
  return true;
}

function getCacheKey(params: any): string {
  return JSON.stringify(params);
}

function isValidCacheEntry(entry: { data: any; timestamp: number }): boolean {
  return Date.now() - entry.timestamp < CACHE_DURATION;
}

export async function GET(request: NextRequest) {
  try {
    // Check rate limit
    const clientIP = getClientIP(request);
    if (!checkRateLimit(clientIP)) {
      const current = requestCounts.get(clientIP);
      const retryAfter = current
        ? Math.ceil((current.resetTime - Date.now()) / 1000)
        : 3600;

      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded",
          message: `Maximum ${RATE_LIMIT} requests per hour allowed`,
          retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Limit": RATE_LIMIT.toString(),
            "X-RateLimit-Remaining": "0",
          },
        },
      );
    }

    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const toolId = searchParams.get("toolId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const aggregation = searchParams.get("aggregation") || "day"; // day, week, month
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");
    const orderBy = searchParams.get("orderBy") || "timestamp";
    const orderDirection = searchParams.get("orderDirection") || "desc";

    // Create cache key from parameters
    const cacheParams = {
      toolId,
      startDate,
      endDate,
      aggregation,
      limit,
      offset,
      orderBy,
      orderDirection,
    };
    const cacheKey = getCacheKey(cacheParams);

    // Check cache
    const cached = usageCache.get(cacheKey);
    if (cached && isValidCacheEntry(cached)) {
      const current = requestCounts.get(clientIP);
      const remaining = current
        ? Math.max(0, RATE_LIMIT - current.count)
        : RATE_LIMIT - 1;

      return NextResponse.json(
        {
          success: true,
          data: cached.data,
          cached: true,
          cacheTime: new Date(cached.timestamp).toISOString(),
        },
        {
          headers: {
            "Cache-Control": "public, max-age=120", // 2 minutes
            "X-Cache": "HIT",
            "X-RateLimit-Limit": RATE_LIMIT.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
          },
        },
      );
    }

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    // Build where clause
    const whereClause: any = {};
    if (toolId) {
      whereClause.toolId = toolId;
    }
    if (Object.keys(dateFilter).length > 0) {
      whereClause.timestamp = dateFilter;
    }

    // Get usage data
    const usageData = await prisma.toolUsage.findMany({
      where: whereClause,
      include: {
        tool: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        [orderBy]: orderDirection as "asc" | "desc",
      },
      skip: offset,
      take: Math.min(limit, 1000), // Max 1000 records
    });

    // Get total count for pagination
    const totalCount = await prisma.toolUsage.count({
      where: whereClause,
    });

    // Aggregate data based on aggregation period
    const aggregatedData = aggregateUsageData(usageData, aggregation);

    // Calculate summary statistics
    const summary = {
      totalUsage: usageData.length,
      totalCount,
      uniqueTools: new Set(usageData.map((u) => u.toolId)).size,
      dateRange: {
        start:
          usageData.length > 0
            ? usageData[usageData.length - 1].timestamp
            : null,
        end: usageData.length > 0 ? usageData[0].timestamp : null,
      },
      pagination: {
        limit,
        offset,
        total: totalCount,
        hasMore: offset + limit < totalCount,
      },
    };

    // Prepare response data
    const responseData = {
      usage: usageData.map((u) => {
        const metadata = u.metadata as any;
        return {
          id: u.id,
          toolId: u.toolId,
          toolName: u.tool?.name,
          toolSlug: u.tool?.slug,
          timestamp: u.timestamp,
          operationType: metadata?.operationType || "unknown",
          inputSize: metadata?.inputSize || 0,
          outputSize: metadata?.outputSize || 0,
          processingTime: metadata?.processingTime || 0,
          success: metadata?.success !== false, // Default to true if not specified
          errorMessage: metadata?.errorMessage || null,
        };
      }),
      aggregated: aggregatedData,
      summary,
    };

    // Cache the result
    usageCache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now(),
    });

    // Clean up old cache entries
    for (const [key, entry] of usageCache.entries()) {
      if (!isValidCacheEntry(entry)) {
        usageCache.delete(key);
      }
    }

    const current = requestCounts.get(clientIP);
    const remaining = current
      ? Math.max(0, RATE_LIMIT - current.count)
      : RATE_LIMIT - 1;

    return NextResponse.json(
      {
        success: true,
        data: responseData,
        cached: false,
        generatedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, max-age=120", // 2 minutes
          "X-Cache": "MISS",
          "X-RateLimit-Limit": RATE_LIMIT.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
        },
      },
    );
  } catch (error) {
    console.error("Usage aggregation API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve usage data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

function aggregateUsageData(usageData: any[], aggregation: string): any[] {
  if (usageData.length === 0) return [];

  const aggregated = new Map<string, any>();

  for (const usage of usageData) {
    const date = new Date(usage.timestamp);
    let key: string;

    switch (aggregation) {
      case "week":
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split("T")[0];
        break;
      case "month":
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        break;
      case "day":
      default:
        key = date.toISOString().split("T")[0];
        break;
    }

    if (!aggregated.has(key)) {
      aggregated.set(key, {
        period: key,
        totalUsage: 0,
        successfulUsage: 0,
        errorCount: 0,
        totalProcessingTime: 0,
        averageInputSize: 0,
        averageOutputSize: 0,
        uniqueTools: new Set(),
      });
    }

    const agg = aggregated.get(key)!;
    const metadata = usage.metadata as any;

    agg.totalUsage++;
    if (metadata?.success !== false) {
      agg.successfulUsage++;
    } else {
      agg.errorCount++;
    }
    agg.totalProcessingTime += metadata?.processingTime || 0;
    agg.averageInputSize += metadata?.inputSize || 0;
    agg.averageOutputSize += metadata?.outputSize || 0;
    agg.uniqueTools.add(usage.toolId);
  }

  // Calculate averages and convert Set to count
  return Array.from(aggregated.values())
    .map((agg) => ({
      ...agg,
      averageProcessingTime:
        agg.totalUsage > 0 ? agg.totalProcessingTime / agg.totalUsage : 0,
      averageInputSize:
        agg.totalUsage > 0 ? agg.averageInputSize / agg.totalUsage : 0,
      averageOutputSize:
        agg.totalUsage > 0 ? agg.averageOutputSize / agg.totalUsage : 0,
      uniqueToolsCount: agg.uniqueTools.size,
      successRate:
        agg.totalUsage > 0 ? (agg.successfulUsage / agg.totalUsage) * 100 : 0,
      uniqueTools: undefined, // Remove the Set object
    }))
    .sort((a, b) => a.period.localeCompare(b.period));
}
