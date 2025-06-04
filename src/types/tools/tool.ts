/**
 * Tool data transfer object
 */
export interface ToolDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconClass: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  usageCount?: number;
  tags?: TagDTO[];
}

/**
 * Tag data transfer object
 */
export interface TagDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  createdAt: Date;
  updatedAt: Date;
  toolCount?: number;
}

/**
 * Tool usage statistics
 */
export interface ToolUsageStats {
  toolId: string;
  usageCount: number;
  lastUsed: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Tool creation/update input
 */
export interface ToolInput {
  name: string;
  slug: string;
  description?: string | null;
  iconClass?: string | null;
  displayOrder?: number;
  isActive?: boolean;
  tagIds?: string[];
}

/**
 * Tag creation/update input
 */
export interface TagInput {
  name: string;
  slug: string;
  description?: string | null;
  color?: string | null;
}

/**
 * Raw Prisma tool with relations (simplified)
 */
export interface PrismaToolWithRelations {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconClass: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      color: string | null;
      createdAt: Date;
    };
  }>;
  toolUsageStats: {
    usageCount: number;
    lastUsed: Date;
  } | null;
}

/**
 * Raw Prisma tag with tool count
 */
export interface PrismaTagWithToolCount {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  createdAt: Date;
  _count: {
    tools: number;
  };
}

/**
 * Basic Prisma tag
 */
export interface PrismaTagBasic {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  createdAt: Date;
}

/**
 * Convert Prisma Tool to ToolDTO
 */
export function toToolDTO(tool: PrismaToolWithRelations): ToolDTO {
  return {
    id: tool.id,
    name: tool.name,
    slug: tool.slug,
    description: tool.description,
    iconClass: tool.iconClass,
    displayOrder: tool.displayOrder,
    isActive: tool.isActive,
    createdAt: tool.createdAt,
    updatedAt: tool.updatedAt,
    usageCount: tool.toolUsageStats?.usageCount ?? 0,
    tags: tool.tags?.map((toolTag) => toTagDTO(toolTag.tag)) ?? [],
  };
}

/**
 * Convert Prisma Tag to TagDTO
 */
export function toTagDTO(tag: PrismaTagBasic | PrismaTagWithToolCount): TagDTO {
  const baseTag: TagDTO = {
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    description: tag.description,
    color: tag.color,
    createdAt: tag.createdAt,
    updatedAt: tag.createdAt,
  };

  // Add tool count if available
  if ("_count" in tag) {
    baseTag.toolCount = tag._count.tools;
  }

  return baseTag;
}
