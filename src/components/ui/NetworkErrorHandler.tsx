"use client";

import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/utils";
import { NetworkErrorProps, RetryConfig, RetryState } from "@/types/ui/loading";
import { Button } from "./Button";
import { Loading } from "./Loading";

const defaultRetryConfig: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryCondition: (error: any) => {
    // Retry on network errors, timeouts, and 5xx status codes
    return (
      error.name === "NetworkError" ||
      error.name === "TimeoutError" ||
      (error.status && error.status >= 500) ||
      !navigator.onLine
    );
  },
};

export function NetworkErrorHandler({
  error,
  onRetry,
  retryCount = 0,
  maxRetries = 3,
  isRetrying = false,
  className,
}: NetworkErrorProps) {
  const [countdown, setCountdown] = useState<number>(0);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const getErrorMessage = (error: Error | string): string => {
    if (typeof error === "string") return error;

    if (!isOnline) {
      return "You appear to be offline. Please check your internet connection.";
    }

    switch (error.name) {
      case "NetworkError":
        return "Network error occurred. Please check your connection and try again.";
      case "TimeoutError":
        return "Request timed out. Please try again.";
      default:
        return error.message || "An unexpected error occurred.";
    }
  };

  const getErrorIcon = () => {
    if (!isOnline) {
      return (
        <svg
          className="w-12 h-12 text-error-500 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M18.364 5.636l-12.728 12.728m0 0L5.636 5.636m12.728 12.728L5.636 18.364"
          />
        </svg>
      );
    }

    return (
      <svg
        className="w-12 h-12 text-error-500 mx-auto"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
        />
      </svg>
    );
  };

  const canRetry = retryCount < maxRetries && onRetry && !isRetrying;
  const showOfflineMessage = !isOnline;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center",
        "card",
        className,
      )}
    >
      <div role="alert" aria-live="assertive">
        {getErrorIcon()}

        <h3 className="mt-4 text-title text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          {showOfflineMessage ? "Connection Lost" : "Something went wrong"}
        </h3>

        <p className="mt-2 text-body text-sm text-neutral-600 dark:text-neutral-400 max-w-md">
          {getErrorMessage(error)}
        </p>

        {retryCount > 0 && (
          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            Failed attempts: {retryCount}/{maxRetries}
          </p>
        )}

        {countdown > 0 && (
          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            Retrying in {countdown} seconds...
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        {canRetry && (
          <Button
            onClick={onRetry}
            disabled={isRetrying || countdown > 0}
            variant="primary"
            size="sm"
            className="min-w-[120px]"
          >
            {isRetrying ? (
              <>
                <Loading size="sm" variant="spinner" className="mr-2" />
                Retrying...
              </>
            ) : (
              "Try Again"
            )}
          </Button>
        )}

        <Button
          onClick={() => window.location.reload()}
          variant="secondary"
          size="sm"
          className="min-w-[120px]"
        >
          Refresh Page
        </Button>
      </div>

      {showOfflineMessage && (
        <div className="mt-4 p-3 bg-warning-50 dark:bg-warning-950/50 border border-warning-200 dark:border-warning-800 rounded-xl">
          <p className="text-sm text-warning-800 dark:text-warning-200">
            The page will automatically retry when your connection is restored.
          </p>
        </div>
      )}
    </div>
  );
}

// Hook for advanced retry logic with exponential backoff
export function useRetryWithBackoff(
  asyncFunction: () => Promise<any>,
  config: Partial<RetryConfig> = {},
) {
  const [state, setState] = useState<RetryState>({
    attempt: 0,
    isRetrying: false,
    lastError: undefined,
    nextRetryIn: undefined,
  });

  const fullConfig = { ...defaultRetryConfig, ...config };

  const calculateDelay = (attempt: number): number => {
    const delay = Math.min(
      fullConfig.baseDelay * Math.pow(fullConfig.backoffFactor, attempt),
      fullConfig.maxDelay,
    );
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 0.1 * delay;
  };

  const executeWithRetry = useCallback(async (): Promise<any> => {
    let lastError: Error;

    for (let attempt = 0; attempt <= fullConfig.maxAttempts; attempt++) {
      setState((prev) => ({ ...prev, attempt, isRetrying: true }));

      try {
        const result = await asyncFunction();
        setState({ attempt: 0, isRetrying: false });
        return result;
      } catch (error) {
        lastError = error as Error;
        setState((prev) => ({ ...prev, lastError }));

        // Check if we should retry
        const shouldRetry =
          attempt < fullConfig.maxAttempts && fullConfig.retryCondition!(error);

        if (!shouldRetry) {
          setState((prev) => ({ ...prev, isRetrying: false }));
          throw error;
        }

        // Wait before retrying
        if (attempt < fullConfig.maxAttempts) {
          const delay = calculateDelay(attempt);
          setState((prev) => ({ ...prev, nextRetryIn: delay }));

          await new Promise((resolve) => setTimeout(resolve, delay));

          setState((prev) => ({ ...prev, nextRetryIn: undefined }));
        }
      }
    }

    setState((prev) => ({ ...prev, isRetrying: false }));
    throw lastError!;
  }, [asyncFunction, fullConfig]);

  const reset = useCallback(() => {
    setState({ attempt: 0, isRetrying: false });
  }, []);

  return {
    ...state,
    executeWithRetry,
    reset,
  };
}

// Hook for managing network status and auto-retry
export function useNetworkRetry(
  onRetry?: () => void,
  autoRetryOnReconnect = true,
) {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [hasTriedAutoRetry, setHasTriedAutoRetry] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);

      if (autoRetryOnReconnect && onRetry && !hasTriedAutoRetry) {
        // Small delay to ensure connection is stable
        setTimeout(() => {
          onRetry();
          setHasTriedAutoRetry(true);
        }, 1000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setHasTriedAutoRetry(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [onRetry, autoRetryOnReconnect, hasTriedAutoRetry]);

  const manualRetry = useCallback(() => {
    setHasTriedAutoRetry(true);
    onRetry?.();
  }, [onRetry]);

  return {
    isOnline,
    hasTriedAutoRetry,
    manualRetry,
    resetAutoRetry: () => setHasTriedAutoRetry(false),
  };
}

// Specialized error handlers for common scenarios
export function ToolLoadingError({
  error,
  onRetry,
  toolName,
}: {
  error: Error | string;
  onRetry?: () => void;
  toolName?: string;
}) {
  const customError =
    typeof error === "string"
      ? `Failed to load ${toolName || "tool"}: ${error}`
      : new Error(`Failed to load ${toolName || "tool"}: ${error.message}`);

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <NetworkErrorHandler
        error={customError}
        onRetry={onRetry}
        className="max-w-md"
      />
    </div>
  );
}

export function AdminDataError({
  error,
  onRetry,
  dataType = "data",
}: {
  error: Error | string;
  onRetry?: () => void;
  dataType?: string;
}) {
  const customError =
    typeof error === "string"
      ? `Failed to load ${dataType}: ${error}`
      : new Error(`Failed to load ${dataType}: ${error.message}`);

  return (
    <div className="p-6">
      <NetworkErrorHandler
        error={customError}
        onRetry={onRetry}
        className="max-w-lg mx-auto"
      />
    </div>
  );
}
