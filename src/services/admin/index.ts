// Admin services will be exported from here
// TODO: Add actual admin services as they are created

// Placeholder export to make this a valid module
export const ADMIN_SERVICES_PLACEHOLDER = "admin-services";

// Admin services exports
export { AdminToolService, type IAdminToolService } from "./adminToolService";
export { AdminTagService, type IAdminTagService } from "./adminTagService";
export {
  RelationshipService,
  type IRelationshipService,
} from "./relationshipService";
export { AnalyticsService } from "./analyticsService";

// Re-export types for convenience
export type {
  AdminToolFormData,
  AdminToolCreateRequest,
  AdminToolUpdateRequest,
  AdminToolListItem,
  AdminToolsSortOptions,
  AdminToolsFilters,
  AdminToolValidationErrors,
} from "@/types/admin/tool";

export type {
  AdminTagFormData,
  AdminTagCreateRequest,
  AdminTagUpdateRequest,
  AdminTagListItem,
  AdminTagsSortOptions,
  AdminTagsFilters,
  AdminTagValidationErrors,
  AdminTagUsageStats,
  AdminTagRelationshipWarning,
} from "@/types/admin/tag";

export type {
  ToolTagRelationship,
  BulkTagOperation,
  BulkOperationResult,
  BulkOperationPreview,
  TagUsageStatistics,
  ToolTagAssignmentData,
  RelationshipValidationResult,
  RelationshipValidationError,
  OrphanedEntityCheck,
  RelationshipFilters,
  RelationshipSortOptions,
} from "@/types/admin/relationship";

export type {
  AnalyticsSummary,
  ToolUsageAnalytics,
  SystemPerformanceMetrics,
  AnalyticsFilter,
  AnalyticsChart,
  AnalyticsExport,
  ExportOptions,
  AnalyticsTimeRange,
  AnalyticsError,
  AnalyticsConfig,
  AnalyticsDashboardProps,
  AnalyticsChartProps,
  AnalyticsFiltersProps,
  AnalyticsExportProps,
} from "@/types/admin/analytics";
