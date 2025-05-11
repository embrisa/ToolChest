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

// Define a validator for the Prisma Tool entity with includes
const toolWithRelationsValidator = Prisma.validator<Prisma.ToolDefaultArgs>()({
    include: {
        tags: {
            include: {
                tag: true, // Ensure the 'tag' relation within 'ToolTag' is included
            },
        },
        toolUsageStats: true,
    },
});

// Use the validator to create the payload type
export type PrismaToolWithRelations = Prisma.ToolGetPayload<typeof toolWithRelationsValidator>;

// Type for the 'toolTag' parameter, representing an element from tool.tags
// This will be a ToolTag payload that includes the nested Tag
type ToolTagWithTag = Prisma.ToolTagGetPayload<{
    include: {
        tag: true;
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
        usageCount: tool.toolUsageStats?.[0]?.usageCount ?? 0,
        tags: tool.tags?.map((toolTag: ToolTagWithTag) => toTagDTO(toolTag.tag as PrismaTagBasic)) ?? [],
    };
} 