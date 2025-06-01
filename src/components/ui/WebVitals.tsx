"use client";

import { useEffect, useCallback, useState } from "react";
import { usePerformanceOptimization } from "@/hooks/usePerformanceOptimization";

export interface WebVitalsProps {
  debug?: boolean;
  enableConsoleReporting?: boolean;
  enableAnalytics?: boolean;
  performanceThresholds?: {
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay (legacy)
    inp: number; // Interaction to Next Paint
    cls: number; // Cumulative Layout Shift
    fcp: number; // First Contentful Paint
    ttfb: number; // Time to First Byte
  };
  onMetricReport?: (metric: WebVitalMetric) => void;
}

export interface WebVitalMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
  entries: PerformanceEntry[];
  timestamp: number;
}

// Performance thresholds following Core Web Vitals standards
const DEFAULT_THRESHOLDS = {
  lcp: 2500, // Good: ≤2.5s, Poor: >4.0s
  fid: 100, // Good: ≤100ms, Poor: >300ms
  inp: 200, // Good: ≤200ms, Poor: >500ms
  cls: 0.1, // Good: ≤0.1, Poor: >0.25
  fcp: 1800, // Good: ≤1.8s, Poor: >3.0s
  ttfb: 800, // Good: ≤800ms, Poor: >1800ms
};

export function WebVitals({
  debug = false,
  enableConsoleReporting = false,
  enableAnalytics = true,
  performanceThresholds = DEFAULT_THRESHOLDS,
  onMetricReport,
}: WebVitalsProps) {
  const { reportWebVitals } = usePerformanceOptimization();
  const [metrics, setMetrics] = useState<WebVitalMetric[]>([]);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);

  // Enhanced metric handler with rating calculation
  const handleMetric = useCallback(
    (metric: any) => {
      const enhancedMetric: WebVitalMetric = {
        name: metric.name,
        value: metric.value,
        delta: metric.delta,
        id: metric.id,
        entries: metric.entries || [],
        timestamp: Date.now(),
        rating: calculateRating(
          metric.name,
          metric.value,
          performanceThresholds,
        ),
      };

      // Update local state for debugging
      setMetrics((prev) => {
        const existing = prev.findIndex((m) => m.name === metric.name);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = enhancedMetric;
          return updated;
        }
        return [...prev, enhancedMetric];
      });

      // Report to performance optimization hook
      reportWebVitals(metric);

      // Custom callback
      onMetricReport?.(enhancedMetric);

      // Console reporting for development
      if (enableConsoleReporting || debug) {
        console.group(`📊 Web Vital: ${metric.name}`);
        console.log(`Value: ${metric.value.toFixed(2)}${getUnit(metric.name)}`);
        console.log(`Rating: ${enhancedMetric.rating.toUpperCase()}`);
        console.log(`Delta: ${metric.delta?.toFixed(2) || "N/A"}`);
        console.log(`ID: ${metric.id}`);
        if (metric.entries?.length) {
          console.log("Entries:", metric.entries);
        }
        console.groupEnd();
      }

      // Accessibility announcements for screen readers in debug mode
      if (debug && enhancedMetric.rating === "poor") {
        announcePerformanceIssue(enhancedMetric);
      }
    },
    [
      reportWebVitals,
      onMetricReport,
      enableConsoleReporting,
      debug,
      performanceThresholds,
    ],
  );

  // Calculate performance rating based on Core Web Vitals thresholds
  const calculateRating = (
    name: string,
    value: number,
    thresholds: typeof DEFAULT_THRESHOLDS,
  ): "good" | "needs-improvement" | "poor" => {
    const threshold = thresholds[name.toLowerCase() as keyof typeof thresholds];
    if (!threshold) return "good";

    // Special handling for CLS (smaller is better)
    if (name.toLowerCase() === "cls") {
      if (value <= 0.1) return "good";
      if (value <= 0.25) return "needs-improvement";
      return "poor";
    }

    // Standard handling for time-based metrics
    if (value <= threshold) return "good";
    if (value <= threshold * 2) return "needs-improvement";
    return "poor";
  };

  // Get appropriate unit for metric display
  const getUnit = (metricName: string): string => {
    const name = metricName.toLowerCase();
    if (name === "cls") return "";
    if (
      name.includes("time") ||
      ["lcp", "fid", "inp", "fcp", "ttfb"].includes(name)
    )
      return "ms";
    return "";
  };

  // Announce performance issues to screen readers
  const announcePerformanceIssue = (metric: WebVitalMetric) => {
    const announcement = document.createElement("div");
    announcement.setAttribute("role", "status");
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = `Performance alert: ${metric.name} has poor rating with value ${metric.value.toFixed(2)}${getUnit(metric.name)}`;

    document.body.appendChild(announcement);

    // Clean up after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  useEffect(() => {
    let mounted = true;

    // Check for web-vitals support
    const checkSupport = async () => {
      try {
        await import("web-vitals");
        if (mounted) {
          setIsSupported(true);
        }
      } catch (error) {
        if (mounted) {
          setIsSupported(false);
          if (debug) {
            console.warn("Web Vitals library not available:", error);
          }
        }
      }
    };

    checkSupport();

    return () => {
      mounted = false;
    };
  }, [debug]);

  useEffect(() => {
    if (!isSupported) return;

    let cleanup: (() => void) | undefined;

    // Import and initialize web-vitals with error handling
    import("web-vitals")
      .then((webVitals) => {
        if (!isSupported) return;

        try {
          const { onCLS, onINP, onFCP, onLCP, onTTFB } = webVitals;

          // Core Web Vitals (required)
          onCLS(handleMetric);
          onINP(handleMetric); // INP replaced FID in web-vitals v3
          onLCP(handleMetric);

          // Additional performance metrics
          onFCP(handleMetric);
          onTTFB(handleMetric);

          // Legacy FID support (if available in older versions)
          if ("onFID" in webVitals && typeof webVitals.onFID === "function") {
            webVitals.onFID(handleMetric);
          }

          if (debug) {
            console.log("✅ Web Vitals monitoring initialized");
            console.log("📈 Tracking metrics:", [
              "CLS",
              "INP",
              "LCP",
              "FCP",
              "TTFB",
              ...("onFID" in webVitals ? ["FID"] : []),
            ]);
          }
        } catch (error) {
          if (debug) {
            console.error("Failed to initialize Web Vitals monitoring:", error);
          }
        }
      })
      .catch((error) => {
        if (debug) {
          console.warn("Failed to load web-vitals library:", error);
        }
      });

    return cleanup;
  }, [handleMetric, debug, isSupported]);

  // Performance summary for debugging
  useEffect(() => {
    if (debug && metrics.length > 0) {
      const summary = metrics.reduce(
        (acc, metric) => {
          acc[metric.rating] = (acc[metric.rating] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      console.log("📊 Web Vitals Summary:", summary);
    }
  }, [metrics, debug]);

  // Screen reader status for accessibility
  if (debug && isSupported === false) {
    return (
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-label="Performance monitoring unavailable"
      >
        Web Vitals monitoring is not available in this environment
      </div>
    );
  }

  if (debug && isSupported === true) {
    return (
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-label="Performance monitoring active"
      >
        Web Vitals monitoring is active. {metrics.length} metrics collected.
      </div>
    );
  }

  // This component doesn't render anything by default (non-visual performance monitoring)
  return null;
}

// Export utility functions for advanced usage
export { DEFAULT_THRESHOLDS };

export const getWebVitalsSupport = async (): Promise<boolean> => {
  try {
    await import("web-vitals");
    return true;
  } catch {
    return false;
  }
};

export const formatMetricValue = (name: string, value: number): string => {
  const unit = name.toLowerCase() === "cls" ? "" : "ms";
  return `${value.toFixed(2)}${unit}`;
};
