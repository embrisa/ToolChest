/**
 * Lightweight client-side helper for recording tool usage.
 * Falls back gracefully when the browser doesn't support newer APIs.
 */
const USAGE_ENDPOINT = (slug: string) => `/api/tools/${slug}/usage`;

interface RecordUsageOptions {
  /**
   * Optional metadata placeholder for future analytics expansions.
   * Currently unused by the API but retained for forward compatibility.
   */
  metadata?: Record<string, unknown>;
}

/**
 * Record tool usage via fetch, with navigator.sendBeacon fallback support.
 */
export async function recordToolUsage(
  slug: string,
  options: RecordUsageOptions = {},
): Promise<void> {
  if (!slug) {
    return;
  }

  // Ensure we only execute in a browser environment.
  if (typeof window === "undefined") {
    return;
  }

  const url = USAGE_ENDPOINT(slug);
  const { metadata } = options;

  // Prefer sendBeacon for fire-and-forget tracking when available.
  if (
    typeof navigator !== "undefined" &&
    typeof navigator.sendBeacon === "function"
  ) {
    const payload =
      metadata !== undefined
        ? new Blob([JSON.stringify(metadata)], {
            type: "application/json",
          })
        : undefined;

    if (navigator.sendBeacon(url, payload)) {
      return;
    }
  }

  if (typeof fetch === "undefined") {
    return;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      keepalive: true,
      headers:
        metadata !== undefined
          ? {
              "Content-Type": "application/json",
            }
          : undefined,
      body: metadata !== undefined ? JSON.stringify(metadata) : undefined,
    });

    if (!response.ok && process.env.NODE_ENV !== "production") {
      console.warn(
        `[ToolUsageTracker] Request failed for ${slug}: ${response.status}`,
      );
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[ToolUsageTracker] Failed to record usage for ${slug}`,
        error,
      );
    }
  }
}
