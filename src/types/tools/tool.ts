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
  nameKey: string;
  toolKey: string;
  slug: string;
  descriptionKey: string | null;
  iconClass: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags: Array<{
    tag: {
      id: string;
      nameKey: string;
      tagKey: string;
      slug: string;
      descriptionKey: string | null;
      iconClass: string | null;
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
  nameKey: string;
  tagKey: string;
  slug: string;
  descriptionKey: string | null;
  iconClass: string | null;
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
  nameKey: string;
  tagKey: string;
  slug: string;
  descriptionKey: string | null;
  iconClass: string | null;
  createdAt: Date;
}

/**
 * Convert Prisma Tool to ToolDTO
 * Note: This function now expects the tool to already have name and description 
 * fields populated by the DatabaseTranslationService
 */
export function toToolDTO(tool: PrismaToolWithRelations & { name: string; description: string | null }): ToolDTO {
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
    tags: tool.tags?.map((toolTag) => toTagDTO(toolTag.tag as PrismaTagBasic & { name: string; description: string | null })) ?? [],
  };
}

/**
 * Convert Prisma Tag to TagDTO
 * Note: This function now expects the tag to already have name and description 
 * fields populated by the DatabaseTranslationService
 */
export function toTagDTO(tag: (PrismaTagBasic | PrismaTagWithToolCount) & { name: string; description: string | null }): TagDTO {
  const baseTag: TagDTO = {
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    description: tag.description,
    color: tag.iconClass, // Using iconClass as color for now
    createdAt: tag.createdAt,
    updatedAt: tag.createdAt,
  };

  // Add tool count if available
  if ("_count" in tag) {
    baseTag.toolCount = tag._count.tools;
  }

  return baseTag;
}
