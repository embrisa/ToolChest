import {
  ErrorSeverity,
  ErrorCategory,
  BaseError,
  ClientError,
} from "@/types/errors";

/**
 * Generate a unique error ID
 */
export function generateErrorId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `err_${timestamp}_${random}`;
}

/**
 * Get browser information for error reporting
 */
export function getBrowserInfo() {
  if (typeof window === "undefined") {
    return null;
  }

  return {
    userAgent: navigator.userAgent,
    url: window.location.href,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
  };
}

/**
 * Determine error category from error message or type
 */
export function categorizeError(error: Error): ErrorCategory {
  const message = error.message.toLowerCase();

  if (message.includes("network") || message.includes("fetch")) {
    return "network";
  }

  if (message.includes("unauthorized") || message.includes("auth")) {
    return "authentication";
  }

  if (message.includes("forbidden") || message.includes("permission")) {
    return "authorization";
  }

  if (message.includes("validation") || message.includes("invalid")) {
    return "validation";
  }

  if (message.includes("not found") || message.includes("404")) {
    return "not_found";
  }

  if (message.includes("rate limit") || message.includes("too many")) {
    return "rate_limit";
  }

  if (message.includes("file") || message.includes("upload")) {
    return "file_processing";
  }

  // Default categorization based on error type
  if (error.name === "TypeError" || error.name === "ReferenceError") {
    return "client";
  }

  return "unknown";
}

/**
 * Determine error severity
 */
export function determineSeverity(
  error: Error,
  category: ErrorCategory,
): ErrorSeverity {
  // Critical errors that break core functionality
  if (category === "server" || error.name === "ChunkLoadError") {
    return "critical";
  }

  // High severity for authentication and authorization issues
  if (category === "authentication" || category === "authorization") {
    return "high";
  }

  // Medium severity for validation and file processing issues
  if (category === "validation" || category === "file_processing") {
    return "medium";
  }

  // Low severity for not found and rate limit issues
  if (category === "not_found" || category === "rate_limit") {
    return "low";
  }

  // Default to medium for unknown issues
  return "medium";
}

/**
 * Create a standardized error object
 */
export function createStandardError(
  error: Error,
  context?: {
    component?: string;
    path?: string;
    userId?: string;
    requestId?: string;
  },
): BaseError {
  const category = categorizeError(error);
  const severity = determineSeverity(error, category);

  return {
    code: generateErrorId(),
    message: error.message,
    category,
    severity,
    timestamp: new Date().toISOString(),
    requestId: context?.requestId,
    userId: context?.userId,
    path:
      context?.path ||
      (typeof window !== "undefined" ? window.location.pathname : undefined),
    userAgent: typeof window !== "undefined" ? navigator.userAgent : undefined,
  };
}

/**
 * Create a client-side error with browser context
 */
export function createClientError(
  error: Error,
  component?: string,
): ClientError {
  const baseError = createStandardError(error, { component });
  const browserInfo = getBrowserInfo();

  return {
    ...baseError,
    component,
    stack: error.stack,
    browserInfo: browserInfo || undefined,
  };
}

/**
 * Check if error is recoverable
 */
export function isRecoverableError(error: Error): boolean {
  const nonRecoverableErrors = [
    "ChunkLoadError",
    "ReferenceError",
    "SyntaxError",
  ];

  return !nonRecoverableErrors.includes(error.name);
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: Error): string {
  const category = categorizeError(error);

  const friendlyMessages: Record<ErrorCategory, string> = {
    authentication: "Please sign in to continue.",
    authorization: "You don't have permission to perform this action.",
    validation: "Please check your input and try again.",
    network: "Please check your internet connection and try again.",
    server:
      "We're experiencing technical difficulties. Please try again later.",
    client: "Something went wrong. Please refresh the page and try again.",
    rate_limit: "You're making requests too quickly. Please wait a moment.",
    not_found: "The requested resource could not be found.",
    file_processing:
      "There was an issue processing your file. Please try again.",
    unknown: "An unexpected error occurred. Please try again.",
  };

  return friendlyMessages[category] || friendlyMessages.unknown;
}

/**
 * Log error to console with structured format
 */
export function logError(error: Error, context?: Record<string, any>) {
  const errorData = createStandardError(error, context);

  console.error("Error occurred:", {
    ...errorData,
    originalError: error,
    context,
  });
}
