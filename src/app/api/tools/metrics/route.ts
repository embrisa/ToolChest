import { NextRequest, NextResponse } from "next/server";
import { ToolMetricsPayloadSchema } from "@/types/api/metrics";
import type { ToolMetricEntry } from "@/types/api/metrics";
import { metricsDigestService } from "@/services/admin/metricsDigestService";

const METRICS_WEBHOOK_URL = process.env.TOOL_METRICS_WEBHOOK_URL;
const SHOULD_LOG = process.env.TOOL_METRICS_LOG === "true";
const DEFAULT_SAMPLE_RATE_PROD = 0.1;
const DEFAULT_SAMPLE_RATE_DEV = 1;

function getServerSampleRate(): number {
  const raw = process.env.TOOL_METRICS_SAMPLE_RATE;
  const parsed = raw !== undefined ? Number(raw) : Number.NaN;
  const base =
    process.env.NODE_ENV === "production"
      ? DEFAULT_SAMPLE_RATE_PROD
      : DEFAULT_SAMPLE_RATE_DEV;

  if (!Number.isFinite(parsed)) return base;
  return Math.min(Math.max(parsed, 0), 1);
}

function hashSampleId(sampleId: string): number {
  let hash = 0;
  for (let i = 0; i < sampleId.length; i++) {
    hash = (hash * 31 + sampleId.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function applySampling(
  events: ToolMetricEntry[],
  sampleRate: number,
): ToolMetricEntry[] {
  const rate = Math.min(Math.max(sampleRate, 0), 1);

  return events
    .filter((event) => {
      // Deterministic sampling to prevent client-side tampering.
      const normalized = (hashSampleId(event.sampleId) % 10_000) / 10_000;
      return normalized <= rate;
    })
    .map((event) => ({
      ...event,
      // Normalize to the server-enforced rate to prevent client tampering.
      sampleRate: rate,
    }));
}

async function forwardMetrics(events: ToolMetricEntry[]) {
  if (!METRICS_WEBHOOK_URL) return;

  try {
    await fetch(METRICS_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events }),
      cache: "no-store",
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[metrics] forward failed", error);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = ToolMetricsPayloadSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid metrics payload",
          issues: parsed.error.flatten(),
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      );
    }

    const { events } = parsed.data;
    if (events.some((event) => !event.sampleId?.trim())) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid metrics payload",
          message: "sampleId is required for all events",
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      );
    }
    const sampleRate = getServerSampleRate();
    const sampledEvents = applySampling(events, sampleRate);
    const dropped = events.length - sampledEvents.length;

    if (process.env.NODE_ENV !== "production" || SHOULD_LOG) {
      console.debug("[metrics] received", events.length, "event(s)", {
        forwarded: sampledEvents.length,
        dropped,
        sampleRate,
      });
    }

    // Optional forwarding sink (e.g., to external analytics or log pipeline)
    if (sampledEvents.length > 0) {
      void forwardMetrics(sampledEvents);
      // Update admin digest (counts only; no payloads).
      metricsDigestService.record(sampledEvents);
    }

    return NextResponse.json({
      success: true,
      received: events.length,
      forwarded: sampledEvents.length,
      dropped,
      sampleRate,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to record metrics",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

