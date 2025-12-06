import type { ToolMetricEntry } from "@/types/api/metrics";
import type { MetricsDigest, MetricsDigestByTool } from "@/types/admin/metricsDigest";

type DayBucket = {
  date: string;
  total: number;
  success: number;
  errorBuckets: Record<string, number>;
};

function clampWindow(windowDays: number, maxRetentionDays: number): number {
  if (!Number.isFinite(windowDays) || windowDays <= 0) return 7;
  return Math.min(Math.max(Math.floor(windowDays), 1), maxRetentionDays);
}

function getDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function isOlderThan(dateKey: string, cutoff: Date): boolean {
  const bucketDate = new Date(`${dateKey}T00:00:00Z`);
  return bucketDate.getTime() < cutoff.getTime();
}

function mergeErrorBuckets(
  target: Record<string, number>,
  source: Record<string, number>,
) {
  for (const [key, value] of Object.entries(source)) {
    target[key] = (target[key] ?? 0) + value;
  }
}

class MetricsDigestService {
  private static instance: MetricsDigestService;
  private readonly maxRetentionDays = 30;
  private overallBuckets = new Map<string, DayBucket>();
  private toolBuckets = new Map<string, Map<string, DayBucket>>();
  private lastEventTs: string | null = null;

  static getInstance(): MetricsDigestService {
    if (!MetricsDigestService.instance) {
      MetricsDigestService.instance = new MetricsDigestService();
    }
    return MetricsDigestService.instance;
  }

  record(events: ToolMetricEntry[]): void {
    for (const event of events) {
      this.recordSingle(event);
    }
    this.pruneOldBuckets();
  }

  getDigest(windowDays: number): MetricsDigest {
    const window = clampWindow(windowDays, this.maxRetentionDays);
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    start.setUTCDate(start.getUTCDate() - (window - 1));

    const aggregateMap = (map: Map<string, DayBucket>) => {
      let total = 0;
      let success = 0;
      const errorBuckets: Record<string, number> = {};

      for (const [key, bucket] of map.entries()) {
        if (isOlderThan(key, start)) continue;
        total += bucket.total;
        success += bucket.success;
        mergeErrorBuckets(errorBuckets, bucket.errorBuckets);
      }

      return { total, success, errorBuckets };
    };

    const overall = aggregateMap(this.overallBuckets);

    const byTool: MetricsDigestByTool[] = [];
    for (const [toolSlug, buckets] of this.toolBuckets.entries()) {
      const agg = aggregateMap(buckets);
      if (agg.total === 0) continue;
      byTool.push({
        toolSlug,
        total: agg.total,
        success: agg.success,
        error: Math.max(0, agg.total - agg.success),
        errorBuckets: agg.errorBuckets,
      });
    }

    const totalEvents = overall.total;
    const successCount = overall.success;
    const errorCount = Math.max(0, totalEvents - successCount);
    const successRate = totalEvents > 0 ? successCount / totalEvents : 0;

    return {
      windowDays: window,
      totalEvents,
      successCount,
      errorCount,
      successRate,
      errorBuckets: overall.errorBuckets,
      byTool: byTool.sort((a, b) => b.total - a.total),
      lastEventTs: this.lastEventTs,
    };
  }

  private recordSingle(event: ToolMetricEntry) {
    const ts = event.ts ? new Date(event.ts) : new Date();
    const dayKey = getDayKey(ts);
    this.lastEventTs = ts.toISOString();

    this.bumpBucket(this.overallBuckets, dayKey, event);

    const toolMap =
      this.toolBuckets.get(event.toolSlug) || new Map<string, DayBucket>();
    this.toolBuckets.set(event.toolSlug, toolMap);
    this.bumpBucket(toolMap, dayKey, event);
  }

  private bumpBucket(
    buckets: Map<string, DayBucket>,
    dayKey: string,
    event: ToolMetricEntry,
  ) {
    const bucket =
      buckets.get(dayKey) ||
      ({
        date: dayKey,
        total: 0,
        success: 0,
        errorBuckets: {},
      } satisfies DayBucket);

    bucket.total += 1;
    if (event.success) {
      bucket.success += 1;
    } else {
      const category = event.errorCategory ?? "unknown";
      bucket.errorBuckets[category] = (bucket.errorBuckets[category] ?? 0) + 1;
    }

    buckets.set(dayKey, bucket);
  }

  private pruneOldBuckets() {
    const cutoff = new Date();
    cutoff.setUTCHours(0, 0, 0, 0);
    cutoff.setUTCDate(cutoff.getUTCDate() - this.maxRetentionDays);

    const pruneMap = (map: Map<string, DayBucket>) => {
      for (const key of map.keys()) {
        if (isOlderThan(key, cutoff)) {
          map.delete(key);
        }
      }
    };

    pruneMap(this.overallBuckets);
    for (const bucketMap of this.toolBuckets.values()) {
      pruneMap(bucketMap);
    }
  }
}

export const metricsDigestService = MetricsDigestService.getInstance();

