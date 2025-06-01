"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/utils";
import { PageTransitionProps } from "@/types/ui/loading";

interface ExtendedPageTransitionProps extends PageTransitionProps {
  variant?: "bar" | "circle" | "dots" | "fade";
  position?: "top" | "bottom" | "fixed";
  color?: "brand" | "success" | "warning" | "error";
  speed?: "slow" | "normal" | "fast";
}

const colorClasses = {
  brand: "bg-brand-500",
  success: "bg-success-500",
  warning: "bg-warning-500",
  error: "bg-error-500",
};

const colorTextClasses = {
  brand: "text-brand-500",
  success: "text-success-500",
  warning: "text-warning-500",
  error: "text-error-500",
};

const speedClasses = {
  slow: "duration-700",
  normal: "duration-500",
  fast: "duration-300",
};

// Simple announcement component for page transitions
function TransitionAnnouncement({ message }: { message: string }) {
  return (
    <div
      className="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {message}
    </div>
  );
}

export function PageTransition({
  isLoading,
  progress = 0,
  message = "Loading...",
  variant = "bar",
  position = "top",
  color = "brand",
  speed = "normal",
  className,
}: ExtendedPageTransitionProps) {
  const [mounted, setMounted] = useState(false);
  const [announceMessage, setAnnounceMessage] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isLoading) {
      setAnnounceMessage(`Loading: ${message}`);
    } else {
      setAnnounceMessage("Page loaded");
    }
  }, [isLoading, message]);

  if (!mounted || !isLoading) {
    return null;
  }

  const progressValue = Math.min(Math.max(progress, 0), 100);

  if (variant === "bar") {
    return (
      <>
        <div
          className={cn(
            "fixed z-50 h-1 transition-all ease-out shadow-sm",
            colorClasses[color],
            speedClasses[speed],
            position === "top"
              ? "top-0 left-0 right-0"
              : "bottom-0 left-0 right-0",
            className,
          )}
          style={{ width: `${progressValue}%` }}
          role="progressbar"
          aria-valuenow={progressValue}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Page loading: ${progressValue}%`}
        />
        <TransitionAnnouncement message={announceMessage} />
      </>
    );
  }

  if (variant === "circle") {
    return (
      <>
        <div
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center surface-glass backdrop-blur-xl",
            className,
          )}
        >
          <div className="relative">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                className="text-neutral-200 dark:text-neutral-700"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                className={cn(
                  "transition-all duration-300",
                  colorTextClasses[color],
                )}
                strokeDasharray={`${progressValue * 1.76} 176`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {Math.round(progressValue)}%
              </span>
            </div>
          </div>
          <div className="absolute bottom-12 text-center">
            <p className="text-body text-neutral-700 dark:text-neutral-300 max-w-xs">
              {message}
            </p>
          </div>
        </div>
        <TransitionAnnouncement message={announceMessage} />
      </>
    );
  }

  if (variant === "dots") {
    return (
      <>
        <div
          className={cn(
            "fixed inset-0 z-50 flex flex-col items-center justify-center surface-glass backdrop-blur-xl",
            className,
          )}
        >
          <div className="flex space-x-2 mb-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "w-3 h-3 rounded-full animate-pulse-gentle",
                  colorClasses[color],
                )}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: "1.2s",
                }}
              />
            ))}
          </div>
          <p className="text-body text-neutral-700 dark:text-neutral-300 mb-3">
            {message}
          </p>
          {progress > 0 && (
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              {Math.round(progressValue)}% complete
            </p>
          )}
        </div>
        <TransitionAnnouncement message={announceMessage} />
      </>
    );
  }

  if (variant === "fade") {
    return (
      <>
        <div
          className={cn(
            "fixed inset-0 z-50 surface-glass backdrop-blur-xl transition-opacity duration-300",
            isLoading ? "opacity-100" : "opacity-0 pointer-events-none",
            className,
          )}
        >
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div
                className={cn(
                  "w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-6",
                  `border-${color}-500`,
                )}
              />
              <p className="text-body text-neutral-700 dark:text-neutral-300 mb-4">
                {message}
              </p>
              {progress > 0 && (
                <div className="w-80 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mx-auto overflow-hidden">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      colorClasses[color],
                    )}
                    style={{ width: `${progressValue}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <TransitionAnnouncement message={announceMessage} />
      </>
    );
  }

  return null;
}

export function usePageTransition() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Loading...");

  const startTransition = (message?: string) => {
    setIsLoading(true);
    setProgress(0);
    if (message) {
      setMessage(message);
    }
  };

  const updateProgress = (progress: number, message?: string) => {
    setProgress(Math.min(Math.max(progress, 0), 100));
    if (message) {
      setMessage(message);
    }
  };

  const completeTransition = () => {
    setProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
      setMessage("Loading...");
    }, 200);
  };

  const cancelTransition = () => {
    setIsLoading(false);
    setProgress(0);
    setMessage("Loading...");
  };

  return {
    isLoading,
    progress,
    message,
    startTransition,
    updateProgress,
    completeTransition,
    cancelTransition,
  };
}

export function useRouterTransition() {
  const { startTransition, completeTransition, cancelTransition, ...state } =
    usePageTransition();

  useEffect(() => {
    const handleStart = () => {
      startTransition("Navigating...");
    };

    const handleComplete = () => {
      completeTransition();
    };

    const handleError = () => {
      cancelTransition();
    };

    // Add router event listeners here if using Next.js router
    // This is a placeholder for the actual implementation

    return () => {
      // Cleanup listeners
    };
  }, [startTransition, completeTransition, cancelTransition]);

  return state;
}
