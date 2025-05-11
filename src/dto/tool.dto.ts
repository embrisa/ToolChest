import { Prisma } from '@prisma/client';
import { TagDTO, toTagDTO, PrismaTagBasic } from './tag.dto';

export interface ToolDTO {
    id: string; // or number, depending on your Prisma schema for ID
    name: string;
    slug: string;
    description: string | null;
    iconClass: string | null;
    displayOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    usageCount?: number; // Optional, as it comes from ToolUsageStats
    tags?: TagDTO[];     // Optional, as tags might be loaded separately
}

// Define a more specific type for the Prisma Tool entity with includes
export type PrismaToolWithRelations = Prisma.ToolGetPayload<{
    include: {
        tags: { include: { tag: true } };
        toolUsageStats: true;
    };
}>;

// Placeholder for helper function to convert a Prisma Tool entity to ToolDTO
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
        usageCount: tool.toolUsageStats[0]?.usageCount ?? 0,
        tags: tool.tags?.map(toolTag => toTagDTO(toolTag.tag as PrismaTagBasic)) ?? [],
    };
} 