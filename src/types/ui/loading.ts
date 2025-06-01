// Loading States & Suspense Types
export type LoadingVariant =
  | "spinner"
  | "dots"
  | "pulse"
  | "skeleton"
  | "bars"
  | "wave";

export type LoadingSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface BaseLoadingProps {
  size?: LoadingSize;
  variant?: LoadingVariant;
  text?: string;
  className?: string;
  "aria-label"?: string;
}

export interface SkeletonLoadingProps {
  className?: string;
  lines?: number;
  height?: string;
  width?: string | string[];
  animated?: boolean;
  "aria-label"?: string;
}

export interface PageTransitionProps {
  isLoading: boolean;
  progress?: number;
  message?: string;
  className?: string;
}

export interface SuspenseFallbackProps {
  variant?: "page" | "section" | "card" | "list" | "form";
  message?: string;
  className?: string;
  height?: string;
  showProgress?: boolean;
  progress?: number;
}

export interface NetworkErrorProps {
  error: Error | string;
  onRetry?: () => void;
  retryCount?: number;
  maxRetries?: number;
  isRetrying?: boolean;
  className?: string;
}

export interface LoadingStateConfig {
  showProgress?: boolean;
  showMessage?: boolean;
  showRetry?: boolean;
  autoRetry?: boolean;
  retryDelay?: number;
  maxRetries?: number;
}

// Page-specific loading configurations
export interface PageLoadingConfig extends LoadingStateConfig {
  pageType: "home" | "tool" | "admin" | "auth";
  skeleton?: {
    variant: "card" | "table" | "form" | "dashboard";
    count?: number;
  };
}

// Retry mechanism types
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryCondition?: (error: any) => boolean;
}

export interface RetryState {
  attempt: number;
  isRetrying: boolean;
  lastError?: Error;
  nextRetryIn?: number;
}

// Loading manager for coordinating multiple loading states
export interface LoadingManager {
  register: (key: string, config: LoadingStateConfig) => void;
  unregister: (key: string) => void;
  setLoading: (key: string, loading: boolean, message?: string) => void;
  isLoading: (key?: string) => boolean;
  getLoadingStates: () => Record<string, boolean>;
  clearAll: () => void;
}

// Accessibility helpers
export interface LoadingAccessibility {
  announceLoading: (message: string) => void;
  announceComplete: (message: string) => void;
  announceError: (message: string) => void;
  setProgressAnnouncement: (progress: number, total?: number) => void;
}
