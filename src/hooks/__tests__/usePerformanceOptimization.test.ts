import { renderHook, act } from "@testing-library/react";
import { usePerformanceOptimization } from "../usePerformanceOptimization";

describe("usePerformanceOptimization", () => {
  it("tracks cache hits and misses", () => {
    const { result } = renderHook(() => usePerformanceOptimization());
    const cache = result.current.optimizeCache({ key: "tools" });

    act(() => {
      cache.trackCacheHit();
      cache.trackCacheMiss();
      cache.trackCacheHit();
    });

    const stats = result.current.getCacheStats();
    const byKey = stats.byKey.find((s) => s.key === "tools");
    expect(stats.overall.cacheHits).toBe(2);
    expect(stats.overall.cacheMisses).toBe(1);
    expect(byKey?.hits).toBe(2);
    expect(byKey?.misses).toBe(1);
  });

  it("measures render performance", () => {
    const { result } = renderHook(() => usePerformanceOptimization());
    const measure = result.current.measureRenderPerformance("Test");
    const time = measure.end();
    expect(typeof time).toBe("number");
  });
});
