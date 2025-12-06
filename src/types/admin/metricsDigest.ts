export type MetricsDigest = {
  windowDays: number;
  totalEvents: number;
  successCount: number;
  errorCount: number;
  successRate: number; // 0-1
  errorBuckets: Record<string, number>;
  byTool: MetricsDigestByTool[];
  lastEventTs: string | null;
};

export type MetricsDigestByTool = {
  toolSlug: string;
  total: number;
  success: number;
  error: number;
  errorBuckets: Record<string, number>;
};

