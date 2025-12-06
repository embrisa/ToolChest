import type { ToolMetricEntry } from "@/types/api/metrics";

const ONE_MB = 1024 * 1024;
const FIVE_MB = 5 * ONE_MB;
const NINE_MB = 9 * ONE_MB;

export function nowMs(): number {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  }
  return Date.now();
}

export function durationSince(start: number): number {
  return Math.max(0, nowMs() - start);
}

export function getSizeBucket(
  bytes?: number | null,
): ToolMetricEntry["inputSizeBucket"] | undefined {
  if (bytes === undefined || bytes === null || Number.isNaN(bytes) || bytes <= 0) {
    return undefined;
  }

  if (bytes < ONE_MB) return "<1mb";
  if (bytes < FIVE_MB) return "1-5mb";
  if (bytes < NINE_MB) return "5-9mb";
  return ">9mb-rejected";
}

export function estimateBytesFromString(value?: string | null): number | undefined {
  if (!value) return undefined;
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(value).length;
  }
  return value.length;
}

