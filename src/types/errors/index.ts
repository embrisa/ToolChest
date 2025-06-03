/**
 * Error severity levels
 */
export type ErrorSeverity = "low" | "medium" | "high" | "critical";

/**
 * Error categories for classification
 */
export type ErrorCategory =
  | "authentication"
  | "authorization"
  | "validation"
  | "network"
  | "server"
  | "client"
  | "rate_limit"
  | "not_found"
  | "file_processing"
  | "unknown";

/**
 * Base error information
 */
export interface BaseError {
  code: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: string;
  requestId?: string;
  userId?: string;
  path?: string;
  userAgent?: string;
}

/**
 * Client-side error with component context
 */
export interface ClientError extends BaseError {
  component?: string;
  stack?: string;
  browserInfo?: {
    userAgent: string;
    url: string;
    viewport: {
      width: number;
      height: number;
    };
  };
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  statusCode: number;
  timestamp: string;
  path?: string;
  requestId?: string;
}

/**
 * Error boundary state
 */
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: {
    componentStack: string;
  };
  errorId?: string;
  canRecover?: boolean;
}

/**
 * Error recovery actions
 */
export type ErrorRecoveryAction =
  | "retry"
  | "refresh"
  | "navigate_home"
  | "navigate_back"
  | "contact_support"
  | "clear_cache";

/**
 * Error page props
 */
export interface ErrorPageProps {
  statusCode: number;
  title: string;
  message: string;
  description?: string;
  suggestions?: string[];
  recoveryActions?: Array<{
    type: ErrorRecoveryAction;
    label: string;
    href?: string;
    onClick?: () => void;
  }>;
  showContactSupport?: boolean;
  showTechnicalDetails?: boolean;
  technicalDetails?: {
    errorId?: string;
    timestamp?: string;
    userAgent?: string;
    path?: string;
  };
}

/**
 * Common HTTP error codes with user-friendly information
 */
export const HTTP_ERROR_CONFIGS: Record<
  number,
  Omit<ErrorPageProps, "statusCode">
> = {
  400: {
    title: "Bad Request",
    message: "The request could not be understood",
    description:
      "There was an issue with the data you submitted. Please check your input and try again.",
    suggestions: [
      "Check that all required fields are filled out correctly",
      "Ensure file uploads meet the size and format requirements",
      "Try refreshing the page and submitting again",
    ],
    recoveryActions: [
      { type: "navigate_back", label: "Go Back" },
      { type: "refresh", label: "Refresh Page" },
      { type: "navigate_home", label: "Go to Home" },
    ],
  },
  401: {
    title: "Authentication Required",
    message: "You need to sign in to access this page",
    description:
      "This page requires authentication. Please sign in to continue.",
    suggestions: [
      "Sign in with your admin credentials",
      "Check that your session hasn't expired",
      "Ensure you have the correct permissions",
    ],
    recoveryActions: [{ type: "navigate_home", label: "Go to Home" }],
  },
  403: {
    title: "Access Forbidden",
    message: "You don't have permission to access this page",
    description:
      "You don't have the necessary permissions to view this content.",
    suggestions: [
      "Contact an administrator if you believe you should have access",
      "Sign in with an account that has the required permissions",
      "Return to the home page",
    ],
    recoveryActions: [
      { type: "navigate_home", label: "Go to Home" },
      { type: "contact_support", label: "Contact Support" },
    ],
  },
  404: {
    title: "Page Not Found",
    message: "The page you're looking for doesn't exist",
    description:
      "The page you requested could not be found. It may have been moved, deleted, or you may have typed the URL incorrectly.",
    suggestions: [
      "Check the URL for typos",
      "Use the navigation menu to find what you're looking for",
      "Return to the home page",
      "Search for tools using the search feature",
    ],
    recoveryActions: [
      { type: "navigate_home", label: "Go to Home" },
      { type: "navigate_back", label: "Go Back" },
    ],
  },
  429: {
    title: "Too Many Requests",
    message: "You're making requests too quickly",
    description:
      "You've exceeded the rate limit. Please wait a moment before trying again.",
    suggestions: [
      "Wait a few minutes before making another request",
      "Avoid rapid, repeated submissions",
      "Contact support if you need higher rate limits",
    ],
    recoveryActions: [
      { type: "retry", label: "Try Again" },
      { type: "navigate_home", label: "Go to Home" },
    ],
  },
  500: {
    title: "Internal Server Error",
    message: "Something went wrong on our end",
    description:
      "We're experiencing technical difficulties. Our team has been notified and is working to resolve the issue.",
    suggestions: [
      "Try refreshing the page",
      "Wait a few minutes and try again",
      "Contact support if the problem persists",
    ],
    recoveryActions: [
      { type: "refresh", label: "Refresh Page" },
      { type: "navigate_home", label: "Go to Home" },
      { type: "contact_support", label: "Contact Support" },
    ],
    showContactSupport: true,
    showTechnicalDetails: true,
  },
  502: {
    title: "Bad Gateway",
    message: "Service temporarily unavailable",
    description:
      "We're experiencing connectivity issues. Please try again in a few moments.",
    suggestions: [
      "Wait a few minutes and try again",
      "Check your internet connection",
      "Contact support if the problem persists",
    ],
    recoveryActions: [
      { type: "retry", label: "Try Again" },
      { type: "navigate_home", label: "Go to Home" },
    ],
  },
  503: {
    title: "Service Unavailable",
    message: "The service is temporarily down for maintenance",
    description:
      "We're performing scheduled maintenance. The service will be back online shortly.",
    suggestions: [
      "Wait a few minutes and try again",
      "Check our status page for updates",
      "Contact support if maintenance is taking longer than expected",
    ],
    recoveryActions: [
      { type: "retry", label: "Try Again" },
      { type: "navigate_home", label: "Go to Home" },
    ],
  },
};

/**
 * Error logging configuration
 */
export interface ErrorLoggingConfig {
  enabled: boolean;
  logLevel: ErrorSeverity;
  includeStack: boolean;
  includeBrowserInfo: boolean;
  maxLogSize: number;
  retention: {
    days: number;
  };
  endpoints: {
    client: string;
    server: string;
  };
}

/**
 * Error context for logging and debugging
 */
export interface ErrorContext {
  component?: string;
  action?: string;
  tool?: string;
  userId?: string;
  sessionId?: string;
  buildVersion?: string;
  feature?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Client-side error recovery strategies
 */
export type ErrorRecoveryStrategy =
  | "retry" // Retry the failed operation
  | "retry_with_backoff" // Retry with exponential backoff
  | "reload" // Reload the page
  | "navigate_back" // Navigate back
  | "navigate_home" // Navigate to home
  | "clear_cache" // Clear cache and retry
  | "report" // Report error to user
  | "ignore"; // Ignore the error

/**
 * Client error recovery configuration
 */
export interface ErrorRecoveryConfig {
  strategy: ErrorRecoveryStrategy;
  maxRetries?: number;
  retryDelay?: number;
  fallbackStrategy?: ErrorRecoveryStrategy;
  customHandler?: (error: Error) => Promise<void> | void;
  showUserNotification?: boolean;
  logError?: boolean;
}

/**
 * Client error handler options
 */
export interface ClientErrorHandlerOptions {
  component?: string;
  context?: Record<string, unknown>;
  recoveryConfig?: ErrorRecoveryConfig;
  silent?: boolean; // Don't show notifications
  rethrow?: boolean; // Re-throw after handling
}

/**
 * Error notification types
 */
export type ErrorNotificationType = "toast" | "modal" | "inline" | "banner";

/**
 * Error notification interface
 */
export interface ErrorNotification {
  id: string;
  type: ErrorNotificationType;
  severity: ErrorSeverity;
  title: string;
  message: string;
  duration?: number; // Auto-dismiss time in ms
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: "primary" | "secondary" | "destructive";
  }>;
  dismissible?: boolean;
  persistent?: boolean; // Don't auto-dismiss
}

/**
 * Client error state for error management
 */
export interface ClientErrorState {
  errors: ClientError[];
  notifications: ErrorNotification[];
  isRecovering: boolean;
  lastError?: ClientError;
  recoveryAttempts: number;
}

/**
 * API Error with retry information
 */
export interface ApiErrorWithRetry extends ApiErrorResponse {
  canRetry: boolean;
  retryAfter?: number; // Seconds to wait before retry
  retryCount?: number;
  maxRetries?: number;
}

/**
 * Network error context
 */
export interface NetworkErrorContext {
  isOnline: boolean;
  connectionType?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

/**
 * Error boundary context information
 */
export interface ErrorBoundaryContext {
  componentStack: string;
  errorBoundary?: string;
  props?: Record<string, unknown>;
}

/**
 * Enhanced error context for client-side errors
 */
export interface EnhancedErrorContext extends ErrorContext {
  networkContext?: NetworkErrorContext;
  errorBoundaryContext?: ErrorBoundaryContext;
  userAgent?: string;
  viewport?: {
    width: number;
    height: number;
  };
  performance?: {
    memory?: Record<string, number>;
    timing?: Record<string, number>;
  };
}
