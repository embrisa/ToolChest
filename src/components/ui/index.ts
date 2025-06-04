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
export type { CardProps } from "./Card";

export { Loading } from "./Loading";
export type { LoadingProps } from "./Loading";

export { LoadingWrapper, TextareaLoadingWrapper } from "./LoadingWrapper";
export type { LoadingWrapperProps } from "./LoadingWrapper";

export { ProgressIndicator } from "./ProgressIndicator";

export {
  AriaLiveRegion,
  useAccessibilityAnnouncements,
} from "./AriaLiveRegion";

export { ColorPicker } from "./ColorPicker";
export type { ColorPickerProps } from "./ColorPicker";

export { Alert, AlertList } from "./Alert";
export type { AlertProps } from "./Alert";

// New Tool Components
export { FileUpload } from "./FileUpload";
export type { FileUploadProps } from "./FileUpload";

export { FileInfo } from "./FileInfo";
export type { FileInfoProps } from "./FileInfo";

export { SizeSelector } from "./SizeSelector";
export type { SizeSelectorProps, SizeOption } from "./SizeSelector";

// Data Display Components
export { ResultsPanel, ResultBadge } from "./ResultsPanel";
export type { ResultsPanelProps, ResultMetadata } from "./ResultsPanel";

// Utility Components
export {
  SkeletonLoader,
  ToolCardSkeleton,
  TableSkeleton,
  FormSkeleton,
  DashboardSkeleton,
} from "./SkeletonLoader";

export {
  Toast,
  ToastContainer,
  createSuccessToast,
  createErrorToast,
  createWarningToast,
  createCriticalToast,
} from "./Toast";

export {
  OptimizedImage,
  ToolIcon,
  HeroImage,
  Thumbnail,
} from "./OptimizedImage";
export type { OptimizedImageProps } from "./OptimizedImage";

export { ToolHeader } from "./ToolHeader";
export type { ToolHeaderProps } from "./ToolHeader";

export { OptionGroup } from "./OptionGroup";
export type { OptionGroupProps } from "./OptionGroup";

export { ProgressCard } from "./ProgressCard";
export type { ProgressCardProps, ProgressInfo } from "./ProgressCard";

// New Tool Page Components
export { ToolPageLayout } from "./ToolPageLayout";
export type { ToolPageLayoutProps } from "./ToolPageLayout";

export { ToolPageHero } from "./ToolPageHero";
export type { ToolPageHeroProps } from "./ToolPageHero";

export { PrivacyBadge } from "./PrivacyBadge";
export type { PrivacyBadgeProps } from "./PrivacyBadge";

export { FeatureCard } from "./FeatureCard";
export type { FeatureCardProps } from "./FeatureCard";

export { FeatureGrid } from "./FeatureGrid";
export type { FeatureGridProps } from "./FeatureGrid";

export { ToolInfoSection } from "./ToolInfoSection";
export type {
  ToolInfoSectionProps,
  InfoSection,
  InfoListItem,
} from "./ToolInfoSection";

export { ToolPageTemplate } from "./ToolPageTemplate";
export type { ToolPageTemplateProps } from "./ToolPageTemplate";

export { WebVitals } from "./WebVitals";

// Suspense and Loading Components
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
