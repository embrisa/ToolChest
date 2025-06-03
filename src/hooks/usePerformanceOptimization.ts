import { useCallback, useEffect, useRef, useState } from "react";
import { mutate } from "swr";

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime?: number;
  cacheHits: number;
  cacheMisses: number;
}

export interface PreloadOptions {
  priority?: "high" | "normal" | "low";
  timeout?: number;
  retries?: number;
}

export interface CacheStrategy {
  key: string;
  ttl?: number; // Time to live in seconds
  staleWhileRevalidate?: number;
  strategy?: "cache-first" | "network-first" | "cache-only" | "network-only";
}

export function usePerformanceOptimization() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    cacheHits: 0,
    cacheMisses: 0,
  });

  const performanceObserver = useRef<PerformanceObserver | null>(null);
  const cacheStats = useRef<Map<string, { hits: number; misses: number }>>(
    new Map(),
  );

  // Initialize performance monitoring
  useEffect(() => {
    if (typeof window !== "undefined" && "PerformanceObserver" in window) {
      performanceObserver.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === "navigation") {
            const navEntry = entry as PerformanceNavigationTiming;
            setMetrics((prev) => ({
              ...prev,
              loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
            }));
          }

          if (entry.entryType === "paint") {
            const paintEntry = entry as PerformancePaintTiming;
            if (paintEntry.name === "first-contentful-paint") {
              setMetrics((prev) => ({
                ...prev,
                renderTime: paintEntry.startTime,
              }));
            }
          }

          if (entry.entryType === "event") {
            const eventEntry = entry as PerformanceEventTiming;
            if (eventEntry.name === "click") {
              setMetrics((prev) => ({
                ...prev,
                interactionTime:
                  eventEntry.processingStart - eventEntry.startTime,
              }));
            }
          }
        });
      });

      performanceObserver.current.observe({
        entryTypes: ["navigation", "paint", "event"],
      });
    }

    return () => {
      if (performanceObserver.current) {
        performanceObserver.current.disconnect();
      }
    };
  }, []);

  // Preload resources with priority hints
  const preloadResource = useCallback(
    async (
      url: string,
      type: "image" | "script" | "style" | "fetch" = "fetch",
      options: PreloadOptions = {},
    ) => {
      const { priority = "normal", timeout = 5000, retries = 1 } = options;

      if (typeof window === "undefined") return;

      const attemptPreload = async (attempt: number): Promise<void> => {
        try {
          if (type === "image") {
            return new Promise((resolve, reject) => {
              const img = new Image();
              img.onload = () => resolve();
              img.onerror = () => reject(new Error("Image load failed"));
              img.src = url;

              // Add timeout
              setTimeout(() => reject(new Error("Preload timeout")), timeout);
            });
          }

          if (type === "fetch") {
            const controller = new AbortController();
            setTimeout(() => controller.abort(), timeout);

            await fetch(url, {
              signal: controller.signal,
              priority: priority as RequestPriority,
            });
          }

          if (type === "script" || type === "style") {
            const link = document.createElement("link");
            link.rel = "preload";
            link.href = url;
            link.as = type === "script" ? "script" : "style";
            if (priority === "high") {
              link.setAttribute("importance", "high");
            }
            document.head.appendChild(link);
          }
        } catch (error) {
          if (attempt < retries) {
            // Exponential backoff for retries
            await new Promise((resolve) =>
              setTimeout(resolve, Math.pow(2, attempt) * 1000),
            );
            return attemptPreload(attempt + 1);
          }
          console.warn(
            `Failed to preload ${url} after ${retries} attempts:`,
            error,
          );
        }
      };

      return attemptPreload(0);
    },
    [],
  );

  // Intelligent caching with SWR integration
  const optimizeCache = useCallback((strategy: CacheStrategy) => {
    const { key, ttl = 300 } = strategy;

    // Track cache performance
    const trackCacheHit = () => {
      const stats = cacheStats.current.get(key) || { hits: 0, misses: 0 };
      stats.hits++;
      cacheStats.current.set(key, stats);
      setMetrics((prev) => ({ ...prev, cacheHits: prev.cacheHits + 1 }));
    };

    const trackCacheMiss = () => {
      const stats = cacheStats.current.get(key) || { hits: 0, misses: 0 };
      stats.misses++;
      cacheStats.current.set(key, stats);
      setMetrics((prev) => ({ ...prev, cacheMisses: prev.cacheMisses + 1 }));
    };

    return {
      revalidate: () => mutate(key),
      invalidate: () => mutate(key, undefined, { revalidate: false }),
      trackCacheHit,
      trackCacheMiss,
      getCacheConfig: () => ({
        refreshInterval: 0,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: ttl * 1000,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        onSuccess: trackCacheHit,
        onError: trackCacheMiss,
      }),
    };
  }, []);

  // Preload critical resources
  const preloadCriticalResources = useCallback(async () => {
    const criticalResources = [
      { url: "/api/tools", type: "fetch" as const, priority: "high" as const },
      { url: "/api/tags", type: "fetch" as const, priority: "high" as const },
    ];

    const preloadPromises = criticalResources.map((resource) =>
      preloadResource(resource.url, resource.type, {
        priority: resource.priority,
      }),
    );

    try {
      await Promise.allSettled(preloadPromises);
    } catch (error) {
      console.warn("Some critical resources failed to preload:", error);
    }
  }, [preloadResource]);

  // Measure component render performance
  const measureRenderPerformance = useCallback((componentName: string) => {
    const startTime = performance.now();

    return {
      end: () => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;

        // Mark performance for debugging
        if (typeof window !== "undefined" && "mark" in window.performance) {
          performance.mark(`${componentName}-render-end`);
          performance.measure(
            `${componentName}-render`,
            `${componentName}-render-start`,
            `${componentName}-render-end`,
          );
        }

        return renderTime;
      },
      mark: (label: string) => {
        if (typeof window !== "undefined" && "mark" in window.performance) {
          performance.mark(`${componentName}-${label}`);
        }
      },
    };
  }, []);

  // Get cache statistics
  const getCacheStats = useCallback(() => {
    const stats = Array.from(cacheStats.current.entries()).map(
      ([key, data]) => ({
        key,
        hits: data.hits,
        misses: data.misses,
        hitRate: data.hits / (data.hits + data.misses) || 0,
      }),
    );

    return {
      overall: metrics,
      byKey: stats,
      totalRequests: metrics.cacheHits + metrics.cacheMisses,
      overallHitRate:
        metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses) || 0,
    };
  }, [metrics]);

  // Report Core Web Vitals
  const reportWebVitals = useCallback((metric: any) => {
    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[Performance] ${metric.name}:`, metric.value, metric);
    }

    // In production, you might want to send to analytics
    if (process.env.NODE_ENV === "production") {
      // Example: Send to analytics service
      // analytics.track('web-vital', metric);
    }
  }, []);

  return {
    metrics,
    preloadResource,
    optimizeCache,
    preloadCriticalResources,
    measureRenderPerformance,
    getCacheStats,
    reportWebVitals,
  };
}
