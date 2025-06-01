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
  const [loadingConfigs, setLoadingConfigs] = useState<
    Record<string, LoadingStateConfig>
  >({});
  const [loadingMessages, setLoadingMessages] = useState<
    Record<string, string>
  >({});
  const announcementRef = useRef<HTMLDivElement | null>(null);

  const register = useCallback((key: string, config: LoadingStateConfig) => {
    setLoadingConfigs((prev) => ({ ...prev, [key]: config }));
  }, []);

  const unregister = useCallback((key: string) => {
    setLoadingStates((prev) => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
    setLoadingConfigs((prev) => {
      const newConfigs = { ...prev };
      delete newConfigs[key];
      return newConfigs;
    });
    setLoadingMessages((prev) => {
      const newMessages = { ...prev };
      delete newMessages[key];
      return newMessages;
    });
  }, []);

  const setLoading = useCallback(
    (key: string, loading: boolean, message?: string) => {
      setLoadingStates((prev) => ({ ...prev, [key]: loading }));
      if (message) {
        setLoadingMessages((prev) => ({ ...prev, [key]: message }));
      }

      // Announce loading state changes
      if (loading && message) {
        announceLoading(message);
      } else if (!loading) {
        announceComplete(`${key} loaded successfully`);
      }
    },
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
    setLoadingMessages({});
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

  // Create announcement element ref setter
  const setAnnouncementRef = useCallback((element: HTMLDivElement | null) => {
    announcementRef.current = element;
  }, []);

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
