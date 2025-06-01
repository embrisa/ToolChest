/**
 * Admin tag management types
 */
export interface AdminTagFormData {
  name: string;
  slug: string;
  description: string;
  color: string;
}

export interface AdminTagCreateRequest {
  name: string;
  slug: string;
  description?: string;
  color?: string;
}

export interface AdminTagUpdateRequest extends AdminTagCreateRequest {
  id: string;
}

export interface AdminTagDeleteRequest {
  id: string;
  confirmationText: string;
}

export interface AdminTagValidationErrors {
  name?: string;
  slug?: string;
  description?: string;
  color?: string;
  general?: string;
}

export interface AdminTagListItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  createdAt: Date;
  updatedAt: Date;
  toolCount: number;
  tools: Array<{
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
  }>;
}

export interface AdminTagsSortOptions {
  field: "name" | "slug" | "toolCount" | "createdAt" | "updatedAt";
  direction: "asc" | "desc";
}

export interface AdminTagsFilters {
  search?: string;
  hasTools?: boolean;
}

export interface AdminTagUsageStats {
  toolCount: number;
  activeToolCount: number;
  inactiveToolCount: number;
  popularityRank: number;
  tools: Array<{
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    usageCount: number;
  }>;
}

export interface AdminTagRelationshipWarning {
  type: "warning" | "error";
  message: string;
  toolCount: number;
  toolNames: string[];
  canProceed: boolean;
  requiresConfirmation: boolean;
}
