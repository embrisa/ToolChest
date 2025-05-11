import { Prisma } from '@prisma/client';

export interface TagDTO {
    id: string; // or number, depending on your Prisma schema for ID
    name: string;
    slug: string;
    description: string | null;
    color: string | null;
    createdAt: Date;
    toolCount?: number; // Optional, as this needs to be calculated
}

// Define a more specific type for the Prisma Tag entity with includes for tool count
export type PrismaTagWithToolCount = Prisma.TagGetPayload<{
    include: {
        _count: {
            select: { tools: true };
        };
    };
}>;

// Type for a basic Tag, without tool count (e.g., when nested in ToolDTO)
export type PrismaTagBasic = Prisma.TagGetPayload<{}>;

// Placeholder for helper function to convert a Prisma Tag entity to TagDTO
// You'll need to implement this based on how you fetch and structure your data.
// For example, it might take a Prisma.TagGetPayload type as input
// and potentially an additional argument for toolCount if calculated separately.
export function toTagDTO(tag: PrismaTagWithToolCount | PrismaTagBasic, toolCount?: number): TagDTO {
    return {
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
        color: tag.color,
        createdAt: tag.createdAt,
        // Example: Assign toolCount if provided, or from Prisma's _count if available
        toolCount: toolCount ?? (tag as PrismaTagWithToolCount)._count?.tools ?? 0,
    };
} 