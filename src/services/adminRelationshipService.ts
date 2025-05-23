import { injectable, inject } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { TYPES } from '../config/types';

export interface ToolTagRelationship {
    toolId: string;
    toolName: string;
    toolSlug: string;
    tags: {
        id: string;
        name: string;
        slug: string;
        color: string | null;
        isAssigned: boolean;
    }[];
}

export interface RelationshipMatrix {
    tools: {
        id: string;
        name: string;
        slug: string;
        isActive: boolean;
    }[];
    tags: {
        id: string;
        name: string;
        slug: string;
        color: string | null;
    }[];
    relationships: Record<string, string[]>; // toolId -> tagIds
}

export interface AssignTagRequest {
    toolId: string;
    tagId: string;
}

export interface BulkRelationshipRequest {
    toolIds: string[];
    tagIds: string[];
    action: 'assign' | 'unassign';
}

export interface IAdminRelationshipService {
    getRelationshipMatrix(): Promise<RelationshipMatrix>;
    getToolRelationships(toolId: string): Promise<ToolTagRelationship>;
    getTagRelationships(tagId: string): Promise<{
        tagId: string;
        tagName: string;
        tagSlug: string;
        tagColor: string | null;
        tools: {
            id: string;
            name: string;
            slug: string;
            isActive: boolean;
            isAssigned: boolean;
        }[];
    }>;
    assignTag(toolId: string, tagId: string): Promise<void>;
    unassignTag(toolId: string, tagId: string): Promise<void>;
    bulkManageRelationships(request: BulkRelationshipRequest): Promise<{
        affected: number;
        skipped: number;
    }>;
    getRelationshipStats(): Promise<{
        totalRelationships: number;
        toolsWithTags: number;
        tagsInUse: number;
        averageTagsPerTool: number;
    }>;
}

@injectable()
export class AdminRelationshipServiceImpl implements IAdminRelationshipService {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

    async getRelationshipMatrix(): Promise<RelationshipMatrix> {
        // Get all tools and tags with their relationships
        const [tools, tags, toolTags] = await Promise.all([
            this.prisma.tool.findMany({
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    isActive: true,
                },
                orderBy: { name: 'asc' },
            }),
            this.prisma.tag.findMany({
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    color: true,
                },
                orderBy: { name: 'asc' },
            }),
            this.prisma.toolTag.findMany({
                select: {
                    toolId: true,
                    tagId: true,
                },
            }),
        ]);

        // Build relationships map
        const relationships: Record<string, string[]> = {};
        for (const tool of tools) {
            relationships[tool.id] = [];
        }

        for (const toolTag of toolTags) {
            if (!relationships[toolTag.toolId]) {
                relationships[toolTag.toolId] = [];
            }
            relationships[toolTag.toolId].push(toolTag.tagId);
        }

        return {
            tools,
            tags,
            relationships,
        };
    }

    async getToolRelationships(toolId: string): Promise<ToolTagRelationship> {
        const tool = await this.prisma.tool.findUnique({
            where: { id: toolId },
            select: {
                id: true,
                name: true,
                slug: true,
            },
        });

        if (!tool) {
            throw new Error('Tool not found');
        }

        // Get all tags with assignment status for this tool
        const [allTags, assignedTagIds] = await Promise.all([
            this.prisma.tag.findMany({
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    color: true,
                },
                orderBy: { name: 'asc' },
            }),
            this.prisma.toolTag.findMany({
                where: { toolId },
                select: { tagId: true },
            }),
        ]);

        const assignedTagIdsSet = new Set(assignedTagIds.map(tt => tt.tagId));

        const tags = allTags.map(tag => ({
            ...tag,
            isAssigned: assignedTagIdsSet.has(tag.id),
        }));

        return {
            toolId: tool.id,
            toolName: tool.name,
            toolSlug: tool.slug,
            tags,
        };
    }

    async getTagRelationships(tagId: string): Promise<{
        tagId: string;
        tagName: string;
        tagSlug: string;
        tagColor: string | null;
        tools: {
            id: string;
            name: string;
            slug: string;
            isActive: boolean;
            isAssigned: boolean;
        }[];
    }> {
        const tag = await this.prisma.tag.findUnique({
            where: { id: tagId },
            select: {
                id: true,
                name: true,
                slug: true,
                color: true,
            },
        });

        if (!tag) {
            throw new Error('Tag not found');
        }

        // Get all tools with assignment status for this tag
        const [allTools, assignedToolIds] = await Promise.all([
            this.prisma.tool.findMany({
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    isActive: true,
                },
                orderBy: { name: 'asc' },
            }),
            this.prisma.toolTag.findMany({
                where: { tagId },
                select: { toolId: true },
            }),
        ]);

        const assignedToolIdsSet = new Set(assignedToolIds.map(tt => tt.toolId));

        const tools = allTools.map(tool => ({
            ...tool,
            isAssigned: assignedToolIdsSet.has(tool.id),
        }));

        return {
            tagId: tag.id,
            tagName: tag.name,
            tagSlug: tag.slug,
            tagColor: tag.color,
            tools,
        };
    }

    async assignTag(toolId: string, tagId: string): Promise<void> {
        // Check if relationship already exists
        const existing = await this.prisma.toolTag.findUnique({
            where: {
                toolId_tagId: {
                    toolId,
                    tagId,
                },
            },
        });

        if (existing) {
            throw new Error('Tag is already assigned to this tool');
        }

        // Verify tool and tag exist
        const [tool, tag] = await Promise.all([
            this.prisma.tool.findUnique({ where: { id: toolId } }),
            this.prisma.tag.findUnique({ where: { id: tagId } }),
        ]);

        if (!tool) {
            throw new Error('Tool not found');
        }
        if (!tag) {
            throw new Error('Tag not found');
        }

        await this.prisma.toolTag.create({
            data: {
                toolId,
                tagId,
            },
        });
    }

    async unassignTag(toolId: string, tagId: string): Promise<void> {
        const existing = await this.prisma.toolTag.findUnique({
            where: {
                toolId_tagId: {
                    toolId,
                    tagId,
                },
            },
        });

        if (!existing) {
            throw new Error('Tag is not assigned to this tool');
        }

        await this.prisma.toolTag.delete({
            where: {
                toolId_tagId: {
                    toolId,
                    tagId,
                },
            },
        });
    }

    async bulkManageRelationships(request: BulkRelationshipRequest): Promise<{
        affected: number;
        skipped: number;
    }> {
        const { toolIds, tagIds, action } = request;
        let affected = 0;
        let skipped = 0;

        if (action === 'assign') {
            // Bulk assign tags to tools
            for (const toolId of toolIds) {
                for (const tagId of tagIds) {
                    try {
                        await this.assignTag(toolId, tagId);
                        affected++;
                    } catch (error) {
                        // Tag already assigned or other error
                        skipped++;
                    }
                }
            }
        } else if (action === 'unassign') {
            // Bulk unassign tags from tools
            for (const toolId of toolIds) {
                for (const tagId of tagIds) {
                    try {
                        await this.unassignTag(toolId, tagId);
                        affected++;
                    } catch (error) {
                        // Tag not assigned or other error
                        skipped++;
                    }
                }
            }
        }

        return { affected, skipped };
    }

    async getRelationshipStats(): Promise<{
        totalRelationships: number;
        toolsWithTags: number;
        tagsInUse: number;
        averageTagsPerTool: number;
    }> {
        const [totalRelationships, toolsWithTags, tagsInUse, totalTools] = await Promise.all([
            this.prisma.toolTag.count(),
            this.prisma.toolTag.groupBy({
                by: ['toolId'],
                _count: { toolId: true },
            }).then(result => result.length),
            this.prisma.toolTag.groupBy({
                by: ['tagId'],
                _count: { tagId: true },
            }).then(result => result.length),
            this.prisma.tool.count(),
        ]);

        const averageTagsPerTool = totalTools > 0 ? totalRelationships / totalTools : 0;

        return {
            totalRelationships,
            toolsWithTags,
            tagsInUse,
            averageTagsPerTool: Math.round(averageTagsPerTool * 100) / 100, // Round to 2 decimal places
        };
    }
} 