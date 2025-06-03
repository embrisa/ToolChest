"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/utils";
import { PageTransitionProps } from "@/types/ui/loading";

interface ExtendedPageTransitionProps extends PageTransitionProps {
  variant?: "bar" | "circle" | "dots" | "fade";
  position?: "top" | "bottom" | "fixed";
  color?: "brand" | "success" | "warning" | "error";
  speed?: "slow" | "normal" | "fast";
  size?: "sm" | "md" | "lg";
}

// Light mode optimized color classes
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

const colorBorderClasses = {
  brand: "border-brand-500",
  success: "border-success-500",
  warning: "border-warning-500",
  error: "border-error-500",
};

const speedClasses = {
  slow: "duration-700",
  normal: "duration-500",
  fast: "duration-300",
};

const sizeClasses = {
  sm: {
    bar: "h-0.5",
    circle: "w-12 h-12",
    dots: "w-2 h-2",
    spinner: "w-6 h-6",
  },
  md: {
    bar: "h-1",
    circle: "w-20 h-20",
    dots: "w-3 h-3",
    spinner: "w-8 h-8",
  },
  lg: {
    bar: "h-1.5",
    circle: "w-28 h-28",
    dots: "w-4 h-4",
    spinner: "w-10 h-10",
  },
};

// Enhanced announcement component with better semantics
function TransitionAnnouncement({
  message,
  isComplete,
}: {
  message: string;
  isComplete?: boolean;
}) {
  return (
    <div
      className="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-busy={!isComplete}
    >
      {message}
    </div>
  );
}

export function PageTransition({
  isLoading,
  progress = 0,
  message = "Loading page content...",
  variant = "bar",
  position = "top",
  color = "brand",
  speed = "normal",
  size = "md",
  className,
}: ExtendedPageTransitionProps) {
  const [mounted, setMounted] = useState(false);
  const [announceMessage, setAnnounceMessage] = useState<string>("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isLoading) {
      setAnnounceMessage(`Loading: ${message}`);
      setIsComplete(false);
    } else {
      setAnnounceMessage("Page loaded successfully");
      setIsComplete(true);
    }
  }, [isLoading, message]);

  if (!mounted || !isLoading) {
    return isComplete ? (
      <TransitionAnnouncement message={announceMessage} isComplete={true} />
    ) : null;
  }

  const progressValue = Math.min(Math.max(progress, 0), 100);

  if (variant === "bar") {
    return (
      <>
        <div
          className={cn(
            "fixed z-50 transition-all ease-out shadow-soft",
            sizeClasses[size].bar,
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
          aria-label={`Loading progress: ${progressValue}%`}
        />
        <TransitionAnnouncement message={announceMessage} />
      </>
    );
  }

  if (variant === "circle") {
    const circleRadius = 28;
    const circumference = 2 * Math.PI * circleRadius;
    const strokeDasharray = circumference;
    const strokeDashoffset =
      circumference - (progressValue / 100) * circumference;

    return (
      <>
        <div
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center",
            "bg-neutral-50/95 backdrop-blur-sm",
            className,
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby="loading-title"
          aria-describedby="loading-description"
        >
          <div className="text-center p-8">
            <div className="relative mb-6">
              <svg
                className={cn("transform -rotate-90", sizeClasses[size].circle)}
                viewBox="0 0 64 64"
                aria-hidden="true"
              >
                {/* Background circle */}
                <circle
                  cx="32"
                  cy="32"
                  r={circleRadius}
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  className="text-neutral-200"
                />
                {/* Progress circle with enhanced contrast */}
                <circle
                  cx="32"
                  cy="32"
                  r={circleRadius}
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  className={cn(
                    "transition-all duration-300",
                    colorTextClasses[color],
                  )}
                  style={{
                    strokeDasharray,
                    strokeDashoffset,
                  }}
                />
              </svg>
              {/* Percentage display with enhanced contrast */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="text-sm font-semibold text-neutral-700"
                  aria-live="polite"
                >
                  {Math.round(progressValue)}%
                </span>
              </div>
            </div>
            <div className="max-w-xs mx-auto">
              <h2
                id="loading-title"
                className="text-body font-medium text-neutral-700 mb-2"
              >
                {message}
              </h2>
              <p id="loading-description" className="text-sm text-neutral-500">
                Please wait while we load your content
              </p>
            </div>
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
            "fixed inset-0 z-50 flex flex-col items-center justify-center",
            "bg-neutral-50/95 backdrop-blur-sm",
            className,
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby="loading-title"
          aria-describedby="loading-description"
        >
          <div className="text-center p-8">
            {/* Animated dots with proper spacing */}
            <div className="flex space-x-3 mb-8" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-full animate-pulse-gentle",
                    sizeClasses[size].dots,
                    colorClasses[color],
                  )}
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: "1.2s",
                  }}
                />
              ))}
            </div>
            <div className="max-w-xs mx-auto">
              <h2
                id="loading-title"
                className="text-body font-medium text-neutral-700 mb-3"
              >
                {message}
              </h2>
              {progress > 0 && (
                <div className="mb-3">
                  <div className="w-64 bg-neutral-200 rounded-full h-2 mx-auto overflow-hidden">
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        colorClasses[color],
                      )}
                      style={{ width: `${progressValue}%` }}
                      role="progressbar"
                      aria-valuenow={progressValue}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Loading progress: ${progressValue}%`}
                    />
                  </div>
                  <p
                    className="text-xs text-neutral-500 mt-2"
                    aria-live="polite"
                  >
                    {Math.round(progressValue)}% complete
                  </p>
                </div>
              )}
              <p id="loading-description" className="text-sm text-neutral-500">
                This should only take a moment
              </p>
            </div>
          </div>
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
            "fixed inset-0 z-50 transition-opacity duration-300",
            "bg-neutral-50/95 backdrop-blur-sm",
            isLoading ? "opacity-100" : "opacity-0 pointer-events-none",
            className,
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby="loading-title"
          aria-describedby="loading-description"
        >
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center max-w-md">
              {/* Spinner with brand colors and proper contrast */}
              <div
                className={cn(
                  "border-4 border-t-transparent rounded-full animate-spin mx-auto mb-8",
                  colorBorderClasses[color],
                  sizeClasses[size].spinner,
                )}
                aria-hidden="true"
              />

              <div className="space-y-4">
                <h2
                  id="loading-title"
                  className="text-body font-medium text-neutral-700"
                >
                  {message}
                </h2>

                {progress > 0 && (
                  <div className="space-y-2">
                    <div className="w-80 bg-neutral-200 rounded-full h-2 mx-auto overflow-hidden">
                      <div
                        className={cn(
                          "h-2 rounded-full transition-all duration-300",
                          colorClasses[color],
                        )}
                        style={{ width: `${progressValue}%` }}
                        role="progressbar"
                        aria-valuenow={progressValue}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Loading progress: ${progressValue}%`}
                      />
                    </div>
                    <p className="text-xs text-neutral-500" aria-live="polite">
                      {Math.round(progressValue)}% complete
                    </p>
                  </div>
                )}

                <p
                  id="loading-description"
                  className="text-sm text-neutral-500"
                >
                  Please wait while we prepare your content
                </p>
              </div>
            </div>
          </div>
        </div>
        <TransitionAnnouncement message={announceMessage} isComplete={false} />
      </>
    );
  }

  return null;
}

export function usePageTransition() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Loading...");

  const startTransition = (initialMessage?: string) => {
    setIsLoading(true);
    setProgress(0);
    if (initialMessage) {
      setMessage(initialMessage);
    }
  };

  const updateProgress = (newProgress: number, progressMessage?: string) => {
    const clampedProgress = Math.min(Math.max(newProgress, 0), 100);
    setProgress(clampedProgress);
    if (progressMessage) {
      setMessage(progressMessage);
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
    // Enhanced router integration would go here
    // This provides a clean interface for Next.js router events
    // when they become available in App Router

    // Enhanced router integration would go here
    // This provides a clean interface for Next.js router events
    // when they become available in App Router

    return () => {
      // Cleanup listeners when component unmounts
    };
  }, [startTransition, completeTransition, cancelTransition]);

  return state;
}
