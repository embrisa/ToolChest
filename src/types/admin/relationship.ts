/**
 * Admin tool-tag relationship management types
 */

export interface ToolTagRelationship {
  toolId: string;
  tagId: string;
  toolName: string;
  tagName: string;
  toolSlug: string;
  tagSlug: string;
  toolIsActive: boolean;
  tagColor: string | null;
}

export interface BulkTagOperation {
  type: "assign" | "remove";
  toolIds: string[];
  tagIds: string[];
  requiresConfirmation: boolean;
  estimatedChanges: number;
}

export interface BulkOperationRequest {
  operation: BulkTagOperation;
  confirmationToken?: string;
}

export interface BulkOperationResult {
  success: boolean;
  totalChanges: number;
  toolsAffected: number;
  tagsAffected: number;
  errors: string[];
  warnings: string[];
}

export interface BulkOperationPreview {
  toolsToUpdate: Array<{
    id: string;
    name: string;
    currentTags: string[];
    newTags: string[];
    addedTags: string[];
    removedTags: string[];
  }>;
  summary: {
    totalTools: number;
    totalTagChanges: number;
    newRelationships: number;
    removedRelationships: number;
  };
  warnings: string[];
  requiresConfirmation: boolean;
}

export interface TagUsageStatistics {
  tagId: string;
  tagName: string;
  tagSlug: string;
  tagColor: string | null;
  totalTools: number;
  activeTools: number;
  inactiveTools: number;
  usagePercentage: number;
  popularityRank: number;
  recentUsage: {
    lastUsed: Date | null;
    toolsAddedThisWeek: number;
    toolsAddedThisMonth: number;
  };
  tools: Array<{
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    displayOrder: number;
  }>;
}

export interface ToolTagAssignmentData {
  toolId: string;
  toolName: string;
  toolSlug: string;
  isActive: boolean;
  displayOrder: number;
  currentTagIds: string[];
  availableTagIds: string[];
  lastModified: Date;
}

export interface RelationshipValidationError {
  type: "error" | "warning" | "info";
  code: string;
  message: string;
  field?: string;
  affectedIds?: string[];
}

export interface RelationshipValidationResult {
  isValid: boolean;
  errors: RelationshipValidationError[];
  warnings: RelationshipValidationError[];
  suggestions: RelationshipValidationError[];
}

export interface OrphanedEntityCheck {
  orphanedTools: Array<{
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
  }>;
  orphanedTags: Array<{
    id: string;
    name: string;
    slug: string;
    color: string | null;
  }>;
  canAutoResolve: boolean;
  suggestedActions: string[];
}

// Filters and sorting for relationship management
export interface RelationshipFilters {
  toolIds?: string[];
  tagIds?: string[];
  hasAssignments?: boolean;
  toolIsActive?: boolean;
  search?: string;
}

export interface RelationshipSortOptions {
  field:
    | "toolName"
    | "tagName"
    | "toolDisplayOrder"
    | "assignmentCount"
    | "lastModified";
  direction: "asc" | "desc";
}

// Multi-select interface data
export interface MultiSelectOption {
  id: string;
  label: string;
  description?: string;
  color?: string;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

export interface MultiSelectState {
  selectedIds: string[];
  searchQuery: string;
  isExpanded: boolean;
  focusedIndex: number;
  mode: "single" | "multiple";
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  placeholder?: string;
  maxSelections?: number;
  searchable?: boolean;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  label?: string;
  description?: string;
}
