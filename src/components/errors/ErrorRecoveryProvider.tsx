"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useClientErrorHandler } from "@/hooks/useClientErrorHandler";
import { ToastContainer } from "@/components/ui/Toast";
import {
  ClientError,
  ErrorRecoveryStrategy,
  ErrorRecoveryConfig,
  ClientErrorHandlerOptions,
} from "@/types/errors";

interface ErrorRecoveryContextType {
  handleError: (
    error: Error,
    options?: ClientErrorHandlerOptions,
  ) => Promise<void>;
  handleAsyncOperation: <T>(
    operation: () => Promise<T>,
    options?: ClientErrorHandlerOptions,
  ) => Promise<T | null>;
  clearErrors: () => void;
  clearNotifications: () => void;
  isRecovering: boolean;
  recoveryAttempts: number;
  lastError?: ClientError;
  executeRecoveryStrategy: (
    strategy: ErrorRecoveryStrategy,
    error: ClientError,
    config?: Partial<ErrorRecoveryConfig>,
  ) => Promise<boolean>;
}

const ErrorRecoveryContext = createContext<ErrorRecoveryContextType | null>(
  null,
);

interface ErrorRecoveryProviderProps {
  children: React.ReactNode;
  toastPosition?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
  maxToasts?: number;
  enableGlobalErrorHandler?: boolean;
  onError?: (error: Error, errorInfo?: any) => void;
}

export function ErrorRecoveryProvider({
  children,
  toastPosition = "top-right",
  maxToasts = 5,
  enableGlobalErrorHandler = true,
  onError,
}: ErrorRecoveryProviderProps) {
  const {
    notifications,
    isRecovering,
    lastError,
    recoveryAttempts,
    handleError,
    handleAsyncOperation,
    dismissNotification,
    clearErrors,
    clearNotifications,
    executeRecoveryStrategy,
  } = useClientErrorHandler();

  // Set up global error handlers
  useEffect(() => {
    if (!enableGlobalErrorHandler) return;

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);

      const error =
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason));

      handleError(error, {
        component: "GlobalErrorHandler",
        context: {
          type: "unhandledRejection",
          promise: event.promise,
        },
      });

      // Prevent the default browser handling
      event.preventDefault();
    };

    // Handle global JavaScript errors
    const handleGlobalError = (event: ErrorEvent) => {
      console.error("Global error:", event.error);

      const error =
        event.error instanceof Error
          ? event.error
          : new Error(event.message || "Unknown error");

      handleError(error, {
        component: "GlobalErrorHandler",
        context: {
          type: "globalError",
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    };

    // Handle resource loading errors
    const handleResourceError = (event: Event) => {
      const target = event.target as HTMLElement;
      if (
        target &&
        (target.tagName === "SCRIPT" ||
          target.tagName === "LINK" ||
          target.tagName === "IMG")
      ) {
        const error = new Error(
          `Failed to load resource: ${target.getAttribute("src") || target.getAttribute("href")}`,
        );
        error.name = "ResourceLoadError";

        handleError(error, {
          component: "ResourceLoader",
          context: {
            type: "resourceError",
            tagName: target.tagName,
            src: target.getAttribute("src"),
            href: target.getAttribute("href"),
          },
        });
      }
    };

    // Add event listeners
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleGlobalError);
    window.addEventListener("error", handleResourceError, true); // Capture phase for resource errors

    // Add listener for network status changes
    const handleOnline = () => {
      // Clear network-related errors when coming back online
      console.log("Network reconnected");
    };

    const handleOffline = () => {
      const networkError = new Error("Network connection lost");
      networkError.name = "NetworkError";

      handleError(networkError, {
        component: "NetworkMonitor",
        context: {
          type: "networkOffline",
        },
        recoveryConfig: {
          strategy: "report",
          showUserNotification: true,
          logError: false, // Don't log network errors
        },
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener("error", handleResourceError, true);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [enableGlobalErrorHandler, handleError]);

  // Call onError callback when errors occur
  useEffect(() => {
    if (onError && lastError) {
      onError(new Error(lastError.message), lastError);
    }
  }, [onError, lastError]);

  const contextValue: ErrorRecoveryContextType = {
    handleError,
    handleAsyncOperation,
    clearErrors,
    clearNotifications,
    isRecovering,
    recoveryAttempts,
    lastError,
    executeRecoveryStrategy,
  };

  return (
    <ErrorRecoveryContext.Provider value={contextValue}>
      {children}
      <ToastContainer
        notifications={notifications}
        onDismiss={dismissNotification}
        position={toastPosition}
        maxToasts={maxToasts}
      />
    </ErrorRecoveryContext.Provider>
  );
}

// Hook to use error recovery context
export function useErrorRecovery(): ErrorRecoveryContextType {
  const context = useContext(ErrorRecoveryContext);

  if (!context) {
    throw new Error(
      "useErrorRecovery must be used within an ErrorRecoveryProvider",
    );
  }

  return context;
}

// HOC for wrapping components with error recovery
export function withErrorRecovery<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: {
    fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
    onError?: (error: Error, errorInfo: any) => void;
    enableRetry?: boolean;
  } = {},
) {
  const { fallback: FallbackComponent, onError, enableRetry = true } = options;

  const WithErrorRecoveryComponent = (props: P) => {
    const { handleError } = useErrorRecovery();

    const handleComponentError = (error: Error, errorInfo: any) => {
      handleError(error, {
        component:
          WrappedComponent.displayName || WrappedComponent.name || "Component",
        context: {
          props,
          errorInfo,
        },
      });

      onError?.(error, errorInfo);
    };

    const retryRender = () => {
      // Force re-render by updating component key
      return <WrappedComponent key={Date.now()} {...props} />;
    };

    return (
      <ErrorBoundary
        fallback={
          FallbackComponent ? (
            <FallbackComponent
              error={new Error("Component error")}
              retry={retryRender}
            />
          ) : undefined
        }
        onError={handleComponentError}
        canRecover={enableRetry}
      >
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };

  WithErrorRecoveryComponent.displayName = `withErrorRecovery(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return WithErrorRecoveryComponent;
}

// Simple error boundary for the HOC
class ErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    onError?: (error: Error, errorInfo: any) => void;
    canRecover?: boolean;
  },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <h3 className="text-lg font-medium text-red-900 mb-2">
            Something went wrong
          </h3>
          <p className="text-sm text-red-700 mb-4">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          {this.props.canRecover && (
            <button
              onClick={() =>
                this.setState({ hasError: false, error: undefined })
              }
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Try Again
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
