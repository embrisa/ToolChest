"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  ClientError,
  ClientErrorState,
  ClientErrorHandlerOptions,
  ErrorRecoveryConfig,
  ErrorRecoveryStrategy,
  ErrorNotification,
  EnhancedErrorContext,
  NetworkErrorContext,
} from "@/types/errors";
import {
  createClientError,
  categorizeError,
  getUserFriendlyMessage,
  isRecoverableError,
  logError,
} from "@/utils/errors";
import {
  createErrorToast,
  createCriticalToast,
  createWarningToast,
} from "@/components/ui/Toast";

// Action types for error state reducer
type ErrorAction =
  | { type: "ADD_ERROR"; payload: ClientError }
  | { type: "REMOVE_ERROR"; payload: string }
  | { type: "CLEAR_ERRORS" }
  | { type: "ADD_NOTIFICATION"; payload: ErrorNotification }
  | { type: "REMOVE_NOTIFICATION"; payload: string }
  | { type: "CLEAR_NOTIFICATIONS" }
  | { type: "SET_RECOVERING"; payload: boolean }
  | { type: "INCREMENT_RECOVERY_ATTEMPTS" }
  | { type: "RESET_RECOVERY_ATTEMPTS" };

// Initial state
const initialState: ClientErrorState = {
  errors: [],
  notifications: [],
  isRecovering: false,
  recoveryAttempts: 0,
};

// State reducer
function errorStateReducer(
  state: ClientErrorState,
  action: ErrorAction,
): ClientErrorState {
  switch (action.type) {
    case "ADD_ERROR":
      return {
        ...state,
        errors: [...state.errors, action.payload],
        lastError: action.payload,
      };
    case "REMOVE_ERROR":
      return {
        ...state,
        errors: state.errors.filter(
          (error) => error.requestId !== action.payload,
        ),
      };
    case "CLEAR_ERRORS":
      return {
        ...state,
        errors: [],
        lastError: undefined,
      };
    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };
    case "REMOVE_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.filter(
          (n) => n.id !== action.payload,
        ),
      };
    case "CLEAR_NOTIFICATIONS":
      return {
        ...state,
        notifications: [],
      };
    case "SET_RECOVERING":
      return {
        ...state,
        isRecovering: action.payload,
      };
    case "INCREMENT_RECOVERY_ATTEMPTS":
      return {
        ...state,
        recoveryAttempts: state.recoveryAttempts + 1,
      };
    case "RESET_RECOVERY_ATTEMPTS":
      return {
        ...state,
        recoveryAttempts: 0,
      };
    default:
      return state;
  }
}

// Default recovery configuration
const defaultRecoveryConfig: ErrorRecoveryConfig = {
  strategy: "retry",
  maxRetries: 3,
  retryDelay: 1000,
  fallbackStrategy: "report",
  showUserNotification: true,
  logError: true,
};

export function useClientErrorHandler() {
  const [state, dispatch] = useReducer(errorStateReducer, initialState);
  const retryTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const recoveryAttemptsRef = useRef<Map<string, number>>(new Map());

  type PerformanceWithMemory = Performance & {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  };

  interface NetworkInformation {
    type?: string;
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
  }

  // Get network context information
  const getNetworkContext = useCallback((): NetworkErrorContext => {
    type NavWithConnection = Navigator & {
      connection?: Partial<NetworkInformation>;
      mozConnection?: Partial<NetworkInformation>;
      webkitConnection?: Partial<NetworkInformation>;
    };

    const nav = navigator as NavWithConnection;
    const connection =
      nav.connection || nav.mozConnection || nav.webkitConnection;

    return {
      isOnline: navigator.onLine,
      connectionType: connection?.type,
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt,
    };
  }, []);

  // Get enhanced error context
  const getEnhancedContext = useCallback(
    (context?: Record<string, unknown>): EnhancedErrorContext => {
      const performanceInfo =
        typeof window !== "undefined" && "performance" in window
          ? {
            memory: (window.performance as PerformanceWithMemory).memory
              ? (() => {
                const perf = window.performance as PerformanceWithMemory;
                return {
                  usedJSHeapSize: perf.memory!.usedJSHeapSize || 0,
                  totalJSHeapSize: perf.memory!.totalJSHeapSize || 0,
                  jsHeapSizeLimit: perf.memory!.jsHeapSizeLimit || 0,
                };
              })()
              : undefined,
            timing: (() => {
              try {
                const navEntries = window.performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
                const navTiming = navEntries[0];
                return navTiming ? {
                  navigationStart: navTiming.startTime || 0,
                  unloadEventStart: navTiming.unloadEventStart || 0,
                  unloadEventEnd: navTiming.unloadEventEnd || 0,
                  redirectStart: navTiming.redirectStart || 0,
                  redirectEnd: navTiming.redirectEnd || 0,
                  fetchStart: navTiming.fetchStart || 0,
                  domainLookupStart: navTiming.domainLookupStart || 0,
                  domainLookupEnd: navTiming.domainLookupEnd || 0,
                  connectStart: navTiming.connectStart || 0,
                  connectEnd: navTiming.connectEnd || 0,
                  secureConnectionStart: navTiming.secureConnectionStart || 0,
                  requestStart: navTiming.requestStart || 0,
                  responseStart: navTiming.responseStart || 0,
                  responseEnd: navTiming.responseEnd || 0,
                  domInteractive: navTiming.domInteractive || 0,
                  domContentLoadedEventStart: navTiming.domContentLoadedEventStart || 0,
                  domContentLoadedEventEnd: navTiming.domContentLoadedEventEnd || 0,
                  domComplete: navTiming.domComplete || 0,
                  loadEventStart: navTiming.loadEventStart || 0,
                  loadEventEnd: navTiming.loadEventEnd || 0,
                } : undefined;
              } catch {
                return undefined;
              }
            })(),
          }
          : undefined;

      return {
        ...context,
        networkContext: getNetworkContext(),
        userAgent:
          typeof window !== "undefined" ? navigator.userAgent : undefined,
        viewport:
          typeof window !== "undefined"
            ? {
              width: window.innerWidth,
              height: window.innerHeight,
            }
            : undefined,
        performance: performanceInfo,
      };
    },
    [getNetworkContext],
  );

  // Retry with exponential backoff
  const retryWithBackoff = useCallback(
    async <T>(
      operation: () => Promise<T>,
      errorId: string,
      attempt: number = 0,
      maxRetries: number = 3,
      baseDelay: number = 1000,
    ): Promise<T> => {
      if (attempt >= maxRetries) {
        throw new Error(`Max retry attempts (${maxRetries}) exceeded`);
      }

      try {
        return await operation();
      } catch {
        const delay = Math.min(baseDelay * Math.pow(2, attempt), 10000); // Cap at 10 seconds

        return new Promise((resolve, reject) => {
          const timeoutId = setTimeout(async () => {
            try {
              const result = await retryWithBackoff(
                operation,
                errorId,
                attempt + 1,
                maxRetries,
                baseDelay,
              );
              resolve(result);
            } catch (retryError) {
              reject(retryError);
            }
          }, delay);

          retryTimeoutsRef.current.set(errorId, timeoutId);
        });
      }
    },
    [],
  );

  // Execute recovery strategy
  const executeRecoveryStrategy = useCallback(
    async <T>(
      strategy: ErrorRecoveryStrategy,
      error: ClientError,
      config: ErrorRecoveryConfig,
      operation?: () => Promise<T>,
    ): Promise<boolean> => {
      dispatch({ type: "SET_RECOVERING", payload: true });

      try {
        switch (strategy) {
          case "retry":
            if (operation) {
              await operation();
              return true;
            }
            break;

          case "retry_with_backoff":
            if (operation) {
              const attempts =
                recoveryAttemptsRef.current.get(error.requestId || "") || 0;
              await retryWithBackoff(
                operation,
                error.requestId || "",
                attempts,
                config.maxRetries || 3,
                config.retryDelay || 1000,
              );
              return true;
            }
            break;

          case "reload":
            if (typeof window !== "undefined") {
              window.location.reload();
              return true;
            }
            break;

          case "navigate_back":
            if (typeof window !== "undefined" && window.history.length > 1) {
              window.history.back();
              return true;
            }
            break;

          case "navigate_home":
            if (typeof window !== "undefined") {
              window.location.href = "/";
              return true;
            }
            break;

          case "clear_cache":
            if (typeof window !== "undefined" && "caches" in window) {
              await caches
                .keys()
                .then((names) =>
                  Promise.all(names.map((name) => caches.delete(name))),
                );
              window.location.reload();
              return true;
            }
            break;

          case "report":
            // Create notification to report error
            const reportNotification = createCriticalToast(
              "Error Reported",
              "The error has been logged and our team has been notified.",
              [
                {
                  label: "Contact Support",
                  action: () => {
                    const subject = encodeURIComponent(
                      `Error Report - ${error.requestId || "Unknown"}`,
                    );
                    const body = encodeURIComponent(
                      `Error ID: ${error.requestId || "Unknown"}\n` +
                      `Time: ${error.timestamp}\n` +
                      `Component: ${error.component || "Unknown"}\n` +
                      `Message: ${error.message}\n\n` +
                      `Please describe what you were doing when this error occurred:\n\n`,
                    );
                    window.location.href = `mailto:support@tool-chest.com?subject=${subject}&body=${body}`;
                  },
                  variant: "primary",
                },
              ],
            );
            dispatch({ type: "ADD_NOTIFICATION", payload: reportNotification });
            return true;

          case "ignore":
            return true;

          default:
            return false;
        }
      } catch (recoveryError) {
        console.error("Recovery strategy failed:", recoveryError);

        // Try fallback strategy if available
        if (config.fallbackStrategy && config.fallbackStrategy !== strategy) {
          return await executeRecoveryStrategy(
            config.fallbackStrategy,
            error,
            config,
            operation,
          );
        }

        return false;
      } finally {
        dispatch({ type: "SET_RECOVERING", payload: false });
      }

      return false;
    },
    [retryWithBackoff],
  );

  // Handle client-side errors
  const handleError = useCallback(
    async (
      error: Error,
      options: ClientErrorHandlerOptions = {},
    ): Promise<void> => {
      const {
        component,
        context,
        recoveryConfig = defaultRecoveryConfig,
        silent = false,
        rethrow = false,
      } = options;

      // Create client error with enhanced context
      const enhancedContext = getEnhancedContext(context);
      const clientError = createClientError(error, component);

      // Add enhanced context
      clientError.browserInfo = {
        userAgent: enhancedContext.userAgent || "",
        url: typeof window !== "undefined" ? window.location.href : "",
        viewport: enhancedContext.viewport || { width: 0, height: 0 },
      };

      // Add to error state
      dispatch({ type: "ADD_ERROR", payload: clientError });

      // Log error if configured
      if (recoveryConfig.logError) {
        try {
          // Convert ClientError back to Error for logging
          const originalError = new Error(clientError.message);
          originalError.name = error.name;
          originalError.stack = clientError.stack;
          logError(originalError, enhancedContext);
        } catch (loggingError) {
          console.error("Failed to log error:", loggingError);
        }
      }

      // Create user notification if not silent
      if (!silent && recoveryConfig.showUserNotification) {
        const category = categorizeError(error);
        const friendlyMessage = getUserFriendlyMessage(error);

        let notification: ErrorNotification;

        if (category === "authentication" || category === "authorization") {
          notification = createWarningToast(
            "Authentication Required",
            friendlyMessage,
          );
        } else if (category === "network") {
          notification = createErrorToast(
            "Connection Problem",
            friendlyMessage,
            [
              {
                label: "Retry",
                action: async () => {
                  // Implement retry logic here if operation is available
                  window.location.reload();
                },
                variant: "primary",
              },
            ],
            true, // Persistent for network errors
          );
        } else if (
          category === "server" ||
          clientError.severity === "critical"
        ) {
          notification = createCriticalToast(
            "Critical Error",
            friendlyMessage,
            [
              {
                label: "Report Error",
                action: () =>
                  executeRecoveryStrategy(
                    "report",
                    clientError,
                    recoveryConfig,
                  ),
                variant: "primary",
              },
              {
                label: "Refresh Page",
                action: () =>
                  executeRecoveryStrategy(
                    "reload",
                    clientError,
                    recoveryConfig,
                  ),
                variant: "secondary",
              },
            ],
          );
        } else {
          notification = createErrorToast("Error Occurred", friendlyMessage, [
            {
              label: "Dismiss",
              action: () => {
                dispatch({
                  type: "REMOVE_NOTIFICATION",
                  payload: notification.id,
                });
              },
              variant: "secondary",
            },
          ]);
        }

        dispatch({ type: "ADD_NOTIFICATION", payload: notification });
      }

      // Execute recovery strategy for recoverable errors
      if (isRecoverableError(error)) {
        dispatch({ type: "INCREMENT_RECOVERY_ATTEMPTS" });

        try {
          await executeRecoveryStrategy(
            recoveryConfig.strategy,
            clientError,
            recoveryConfig,
          );
        } catch (recoveryError) {
          console.error("Error recovery failed:", recoveryError);
        }
      }

      // Re-throw if configured
      if (rethrow) {
        throw error;
      }
    },
    [getEnhancedContext, executeRecoveryStrategy],
  );

  // Handle async operations with error handling
  const handleAsyncOperation = useCallback(
    async <T>(
      operation: () => Promise<T>,
      options: ClientErrorHandlerOptions = {},
    ): Promise<T | null> => {
      try {
        return await operation();
      } catch (error) {
        await handleError(error as Error, options);
        return null;
      }
    },
    [handleError],
  );

  // Dismiss notification
  const dismissNotification = useCallback((id: string) => {
    dispatch({ type: "REMOVE_NOTIFICATION", payload: id });
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    dispatch({ type: "CLEAR_NOTIFICATIONS" });
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    dispatch({ type: "CLEAR_ERRORS" });
    dispatch({ type: "RESET_RECOVERY_ATTEMPTS" });

    // Clear any pending retry timeouts
    retryTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    retryTimeoutsRef.current.clear();
    recoveryAttemptsRef.current.clear();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    const timeouts = retryTimeoutsRef.current;
    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
      timeouts.clear();
    };
  }, []);

  return {
    // State
    errors: state.errors,
    notifications: state.notifications,
    isRecovering: state.isRecovering,
    lastError: state.lastError,
    recoveryAttempts: state.recoveryAttempts,

    // Actions
    handleError,
    handleAsyncOperation,
    dismissNotification,
    clearNotifications,
    clearErrors,
    executeRecoveryStrategy: (
      strategy: ErrorRecoveryStrategy,
      error: ClientError,
      config?: Partial<ErrorRecoveryConfig>,
    ) =>
      executeRecoveryStrategy(strategy, error, {
        ...defaultRecoveryConfig,
        ...config,
      }),
  };
}
