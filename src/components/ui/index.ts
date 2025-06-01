// Base UI components will be exported from here
// TODO: Add actual UI components as they are created

// Placeholder export to make this a valid module
export const UI_COMPONENTS_PLACEHOLDER = "ui-components";

// Base UI components
export { Button } from "./Button";
export type { ButtonProps } from "./Button";

export { Input } from "./Input";
export type { InputProps } from "./Input";

export { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./Card";
export type {
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardContentProps,
  CardFooterProps,
} from "./Card";

export { Loading, LoadingSkeleton } from "./Loading";
export type { LoadingProps, LoadingSkeletonProps } from "./Loading";

export { ProgressIndicator } from "./ProgressIndicator";

export {
  AriaLiveRegion,
  useAccessibilityAnnouncements,
} from "./AriaLiveRegion";

export { ColorPicker } from "./ColorPicker";
export type { ColorPickerProps } from "./ColorPicker";

// Loading States & Suspense
export {
  SkeletonLoader,
  ToolCardSkeleton,
  TableSkeleton,
  FormSkeleton,
  DashboardSkeleton,
} from "./SkeletonLoader";
export type { SkeletonLoaderProps } from "./SkeletonLoader";

export {
  PageTransition,
  usePageTransition,
  useRouterTransition,
} from "./PageTransition";

export {
  SuspenseFallback,
  ToolPageFallback,
  ToolGridFallback,
  AdminTableFallback,
  AdminDashboardFallback,
  FormFallback,
  withSuspense,
  useSuspenseState,
} from "./SuspenseFallback";

export {
  NetworkErrorHandler,
  useRetryWithBackoff,
  useNetworkRetry,
  ToolLoadingError,
  AdminDataError,
} from "./NetworkErrorHandler";

export {
  Toast,
  ToastContainer,
  createSuccessToast,
  createErrorToast,
  createWarningToast,
  createCriticalToast,
} from "./Toast";

// Performance Optimization Components
export {
  OptimizedImage,
  ToolIcon,
  HeroImage,
  Thumbnail,
} from "./OptimizedImage";
export type { OptimizedImageProps } from "./OptimizedImage";

export {
  LazyLoader,
  withLazyLoading,
  preloadComponent,
  useComponentPreloader,
} from "./LazyLoader";
export type { LazyLoaderProps } from "./LazyLoader";

export { WebVitals } from "./WebVitals";
export type { WebVitalsProps } from "./WebVitals";

export { MultiSelect } from "./MultiSelect";

