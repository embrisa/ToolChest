import { useCallback, useEffect, useMemo, useRef } from "react";
import { getBudget } from "@/config/toolBudgets";
import type { ToolMetricEntry } from "@/types/api/metrics";
import {
  ToolMetricActionSchema,
  ToolMetricErrorCategorySchema,
  ToolMetricSizeBucketSchema,
} from "@/types/api/metrics";

const METRICS_ENDPOINT = "/api/tools/metrics";
const DEBUG_TOASTS_ENABLED =
  process.env.NEXT_PUBLIC_METRICS_DEBUG_TOAST === "true";

export type RecordToolMetricInput = Omit<
  ToolMetricEntry,
  "toolSlug" | "ts" | "sampleId"
> & {
  toolSlug?: string;
  ts?: string;
};

type UseToolMetricsOptions = {
  toolSlug?: string;
  bufferSize?: number;
  flushIntervalMs?: number;
  sampleRateProd?: number;
};

/**
 * Lightweight client metrics hook with buffering and sendBeacon fallback.
 * Only captures non-content metadata to preserve privacy.
 */
export function useToolMetrics({
  toolSlug,
  bufferSize = 10,
  flushIntervalMs = 5_000,
  sampleRateProd = 0.1,
}: UseToolMetricsOptions = {}) {
  const bufferRef = useRef<ToolMetricEntry[]>([]);
  const flushingRef = useRef(false);
  const sampleIdRef = useRef<string>();

  // Sample everything in dev; respect sample rate in production.
  const isSampled = useMemo(() => {
    if (typeof window === "undefined") return false;
    return process.env.NODE_ENV === "production"
      ? Math.random() < sampleRateProd
      : true;
  }, [sampleRateProd]);

  const sampleId = useMemo(() => {
    if (sampleIdRef.current) return sampleIdRef.current;
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      sampleIdRef.current = crypto.randomUUID();
    } else {
      sampleIdRef.current = `sample-${Math.random().toString(36).slice(2, 10)}`;
    }
    return sampleIdRef.current;
  }, []);

  const emitDebugEvent = useCallback((detail: unknown) => {
    if (!DEBUG_TOASTS_ENABLED || typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("tool-metrics:debug", { detail }),
    );
  }, []);

  const flushBuffer = useCallback(async () => {
    if (flushingRef.current) return;
    if (bufferRef.current.length === 0) return;

    flushingRef.current = true;
    const events = bufferRef.current.splice(0, bufferRef.current.length);
    const payload = JSON.stringify({ events });

    try {
      let sent = false;
      // Prefer sendBeacon for fire-and-forget delivery.
      if (
        typeof navigator !== "undefined" &&
        typeof navigator.sendBeacon === "function"
      ) {
        const blob = new Blob([payload], { type: "application/json" });
        sent = navigator.sendBeacon(METRICS_ENDPOINT, blob);
      }

      if (!sent && typeof fetch !== "undefined") {
        await fetch(METRICS_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          cache: "no-store",
          keepalive: true,
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[metrics] failed to flush", error);
      }
    } finally {
      flushingRef.current = false;
    }
  }, []);

  const maybeWarnOnBudget = useCallback(
    (entry: ToolMetricEntry) => {
      const budgetMs = getBudget(entry.toolSlug, entry.action);
      const overBudget =
        budgetMs !== undefined && entry.durationMs > budgetMs;

      if (overBudget) {
        emitDebugEvent({ type: "budget", entry, budgetMs });
      }

      if (!entry.success && entry.errorCategory) {
        emitDebugEvent({ type: "error", entry });
      }

      if (process.env.NODE_ENV === "production") return;

      if (budgetMs !== undefined && entry.durationMs > budgetMs) {
        console.warn(
          `[metrics] budget exceeded for ${entry.toolSlug}/${entry.action}: ${entry.durationMs}ms > ${budgetMs}ms`,
          entry,
        );
      }
      if (!entry.success && entry.errorCategory) {
        console.warn(
          `[metrics] ${entry.toolSlug}/${entry.action} failed`,
          entry.errorCategory,
        );
      }
    },
    [emitDebugEvent],
  );

  const recordMetric = useCallback(
    (input: RecordToolMetricInput) => {
      if (!isSampled) return;

      const resolvedToolSlug = input.toolSlug ?? toolSlug;
      if (!resolvedToolSlug) return;

      // Validate enums client-side to avoid sending invalid payloads.
      if (
        !ToolMetricActionSchema.safeParse(input.action).success ||
        (input.inputSizeBucket &&
          !ToolMetricSizeBucketSchema.safeParse(input.inputSizeBucket).success)
      ) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[metrics] skipped invalid action or size bucket", input);
        }
        return;
      }

      if (
        input.errorCategory &&
        !ToolMetricErrorCategorySchema.safeParse(input.errorCategory).success
      ) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[metrics] skipped invalid error category", input);
        }
        return;
      }

      const entry: ToolMetricEntry = {
        toolSlug: resolvedToolSlug,
        action: input.action,
        durationMs: Math.max(0, Math.round(input.durationMs)),
        success: input.success,
        errorCategory: input.errorCategory,
        inputSizeBucket: input.inputSizeBucket,
        workerUsed: input.workerUsed,
        offline:
          input.offline ??
          (typeof navigator !== "undefined" ? !navigator.onLine : undefined),
        sampleRate: process.env.NODE_ENV === "production" ? sampleRateProd : 1,
        sampleId,
        ts: input.ts ?? new Date().toISOString(),
      };

      bufferRef.current.push(entry);
      maybeWarnOnBudget(entry);

      if (bufferRef.current.length >= bufferSize) {
        void flushBuffer();
      }
    },
    [
      bufferSize,
      flushBuffer,
      isSampled,
      maybeWarnOnBudget,
      sampleId,
      sampleRateProd,
      toolSlug,
    ],
  );

  // Periodic flush
  useEffect(() => {
    if (!isSampled) return;
    const interval = setInterval(() => {
      void flushBuffer();
    }, flushIntervalMs);
    return () => {
      clearInterval(interval);
      void flushBuffer();
    };
  }, [flushBuffer, flushIntervalMs, isSampled]);

  // Flush on visibility change to avoid losing buffered events
  useEffect(() => {
    if (typeof document === "undefined" || !isSampled) return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        void flushBuffer();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [flushBuffer, isSampled]);

  return { recordMetric, flushMetrics: flushBuffer, isSampled };
}

