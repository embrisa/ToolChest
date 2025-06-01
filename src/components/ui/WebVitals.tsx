"use client";

import { useEffect } from "react";
import { usePerformanceOptimization } from "@/hooks/usePerformanceOptimization";

export interface WebVitalsProps {
  debug?: boolean;
}

export function WebVitals({ debug = false }: WebVitalsProps) {
  const { reportWebVitals } = usePerformanceOptimization();

  useEffect(() => {
    // Import web-vitals dynamically to avoid SSR issues
    import("web-vitals")
      .then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
        onCLS(reportWebVitals);
        onINP(reportWebVitals); // INP replaced FID in web-vitals v3
        onFCP(reportWebVitals);
        onLCP(reportWebVitals);
        onTTFB(reportWebVitals);
      })
      .catch((error) => {
        if (debug) {
          console.warn("Failed to load web-vitals:", error);
        }
      });
  }, [reportWebVitals, debug]);

  // This component doesn't render anything
  return null;
}
