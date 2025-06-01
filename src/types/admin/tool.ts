/**
 * Admin tool management types
 */
export interface AdminToolFormData {
  name: string;
  slug: string;
  description: string;
  iconClass: string;
  displayOrder: number;
  isActive: boolean;
  tagIds: string[];
}

export interface AdminToolCreateRequest {
  name: string;
  slug: string;
  description?: string;
  iconClass?: string;
  displayOrder?: number;
  isActive?: boolean;
  tagIds?: string[];
}

export interface AdminToolUpdateRequest extends AdminToolCreateRequest {
  id: string;
}

export interface AdminToolDeleteRequest {
  id: string;
  confirmationText: string;
}

export interface AdminToolValidationErrors {
  name?: string;
  slug?: string;
  description?: string;
  iconClass?: string;
  displayOrder?: string;
  general?: string;
}

export interface AdminToolListItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconClass: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  tagCount: number;
  tags: Array<{
    id: string;
    name: string;
    color: string | null;
  }>;
}

export interface AdminToolsSortOptions {
  field:
    | "name"
    | "slug"
    | "displayOrder"
    | "usageCount"
    | "createdAt"
    | "updatedAt";
  direction: "asc" | "desc";
}

export interface AdminToolsFilters {
  search?: string;
  isActive?: boolean;
  tagIds?: string[];
}
