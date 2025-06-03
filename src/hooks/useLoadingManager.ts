"use client";

import { useState, useCallback, useRef } from "react";
import {
  LoadingManager,
  LoadingStateConfig,
  LoadingAccessibility,
} from "@/types/ui/loading";

export function useLoadingManager(): LoadingManager & LoadingAccessibility {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {},
  );

  const announcementRef = useRef<HTMLDivElement | null>(null);

  const register = useCallback((_key: string, _config: LoadingStateConfig) => {
    // Registration logic could be implemented here if needed
  }, []);

  const unregister = useCallback((key: string) => {
    setLoadingStates((prev) => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  }, []);

  const setLoading = useCallback(
    (key: string, loading: boolean, message?: string) => {
      setLoadingStates((prev) => ({ ...prev, [key]: loading }));

      // Announce loading state changes
      if (loading && message) {
        announceLoading(message);
      } else if (!loading) {
        announceComplete(`${key} loaded successfully`);
      }
    },
    // Functions are defined in same scope, safe to omit from dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const isLoading = useCallback(
    (key?: string) => {
      if (key) {
        return Boolean(loadingStates[key]);
      }
      return Object.values(loadingStates).some(Boolean);
    },
    [loadingStates],
  );

  const getLoadingStates = useCallback(() => {
    return { ...loadingStates };
  }, [loadingStates]);

  const clearAll = useCallback(() => {
    setLoadingStates({});
  }, []);

  // Accessibility functions
  const announceToScreenReader = useCallback(
    (message: string, priority: "polite" | "assertive" = "polite") => {
      if (announcementRef.current) {
        announcementRef.current.setAttribute("aria-live", priority);
        announcementRef.current.textContent = message;

        // Clear after announcement
        setTimeout(() => {
          if (announcementRef.current) {
            announcementRef.current.textContent = "";
          }
        }, 1000);
      }
    },
    [],
  );

  const announceLoading = useCallback(
    (message: string) => {
      announceToScreenReader(`Loading: ${message}`, "polite");
    },
    [announceToScreenReader],
  );

  const announceComplete = useCallback(
    (message: string) => {
      announceToScreenReader(`Completed: ${message}`, "polite");
    },
    [announceToScreenReader],
  );

  const announceError = useCallback(
    (message: string) => {
      announceToScreenReader(`Error: ${message}`, "assertive");
    },
    [announceToScreenReader],
  );

  const setProgressAnnouncement = useCallback(
    (progress: number, total?: number) => {
      const percentage = total
        ? Math.round((progress / total) * 100)
        : progress;
      announceToScreenReader(`Progress: ${percentage}% complete`, "polite");
    },
    [announceToScreenReader],
  );



  return {
    register,
    unregister,
    setLoading,
    isLoading,
    getLoadingStates,
    clearAll,
    announceLoading,
    announceComplete,
    announceError,
    setProgressAnnouncement,
  };
}

// Hook for managing global loading state
export function useGlobalLoading() {
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [globalMessage, setGlobalMessage] = useState("Loading...");
  const [globalProgress, setGlobalProgress] = useState(0);

  const startGlobalLoading = useCallback((message = "Loading...") => {
    setIsGlobalLoading(true);
    setGlobalMessage(message);
    setGlobalProgress(0);
  }, []);

  const updateGlobalProgress = useCallback(
    (progress: number, message?: string) => {
      setGlobalProgress(progress);
      if (message) {
        setGlobalMessage(message);
      }
    },
    [],
  );

  const stopGlobalLoading = useCallback(() => {
    setGlobalProgress(100);
    setTimeout(() => {
      setIsGlobalLoading(false);
      setGlobalProgress(0);
      setGlobalMessage("Loading...");
    }, 200);
  }, []);

  return {
    isGlobalLoading,
    globalMessage,
    globalProgress,
    startGlobalLoading,
    updateGlobalProgress,
    stopGlobalLoading,
  };
}

// Utility function for creating announcement elements
export function createAnnouncementElement(): HTMLDivElement {
  const element = document.createElement("div");
  element.className = "sr-only";
  element.setAttribute("role", "status");
  element.setAttribute("aria-live", "polite");
  element.setAttribute("aria-atomic", "true");
  return element;
}
