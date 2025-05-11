import { injectable, inject } from 'inversify';
import { PrismaClient, Prisma } from '@prisma/client';
import NodeCache from 'node-cache';
import { TYPES } from '../config/types';
import { ToolDTO, toToolDTO, PrismaToolWithRelations } from '../dto/tool.dto';
import { TagDTO, toTagDTO, PrismaTagBasic, PrismaTagWithToolCount } from '../dto/tag.dto';

export interface ToolService {
    getAllTools(): Promise<ToolDTO[]>;
    getToolBySlug(slug: string): Promise<ToolDTO | null>;
    getToolsByTag(tagSlug: string): Promise<ToolDTO[]>;
    getAllTags(): Promise<TagDTO[]>;
    getTagBySlug(slug: string): Promise<TagDTO | null>;
    recordToolUsage(toolSlug: string): Promise<void>;
    getPopularTools(limit: number): Promise<ToolDTO[]>;
    searchTools(query: string): Promise<ToolDTO[]>;
    getToolsPaginated(offset: number, limit: number): Promise<ToolDTO[]>;
    getToolsByTagPaginated(tagSlug: string, offset: number, limit: number): Promise<ToolDTO[]>;
}

@injectable()
export class ToolServiceImpl implements ToolService {
    private prisma: PrismaClient;
    private cache: NodeCache;

    constructor(@inject(TYPES.PrismaClient) prisma: PrismaClient) {
        this.prisma = prisma;
        this.cache = new NodeCache({ stdTTL: 300 });
    }

    async getAllTools(): Promise<ToolDTO[]> {
        const cacheKey = 'allTools';
        const cachedData = this.cache.get<ToolDTO[]>(cacheKey);
        if (cachedData) {
            return cachedData;
        }

        const tools = await this.prisma.tool.findMany({
            where: { isActive: true },
            orderBy: { displayOrder: 'asc' },
            include: {
                tags: { include: { tag: true } },
                toolUsageStats: true,
            },
        });
        const toolDTOs = tools.map((tool: PrismaToolWithRelations) => toToolDTO(tool));
        this.cache.set(cacheKey, toolDTOs);
        return toolDTOs;
    }

    async getToolBySlug(slug: string): Promise<ToolDTO | null> {
        const cacheKey = `toolBySlug:${slug}`;
        const cachedData = this.cache.get<ToolDTO | null>(cacheKey);
        if (cachedData !== undefined) {
            return cachedData;
        }

        const tool = await this.prisma.tool.findUnique({
            where: { slug, isActive: true },
            include: {
                tags: { include: { tag: true } },
                toolUsageStats: true,
            },
        });

        if (!tool) {
            this.cache.set(cacheKey, null);
            return null;
        }
        const toolDTO = toToolDTO(tool as PrismaToolWithRelations);
        this.cache.set(cacheKey, toolDTO);
        return toolDTO;
    }

    async getToolsByTag(tagSlug: string): Promise<ToolDTO[]> {
        const cacheKey = `toolsByTag:${tagSlug}`;
        const cachedData = this.cache.get<ToolDTO[]>(cacheKey);
        if (cachedData) {
            return cachedData;
        }

        const tools = await this.prisma.tool.findMany({
            where: {
                isActive: true,
                tags: {
                    some: {
                        tag: { slug: tagSlug },
                    },
                },
            },
            orderBy: { displayOrder: 'asc' },
            include: {
                tags: { include: { tag: true } },
                toolUsageStats: true,
            },
        });
        const toolDTOs = tools.map((tool: PrismaToolWithRelations) => toToolDTO(tool));
        this.cache.set(cacheKey, toolDTOs);
        return toolDTOs;
    }

    async getAllTags(): Promise<TagDTO[]> {
        const cacheKey = 'allTags';
        const cachedData = this.cache.get<TagDTO[]>(cacheKey);
        if (cachedData) {
            return cachedData;
        }

        const tags = await this.prisma.tag.findMany({
            include: {
                _count: {
                    select: {
                        tools: { where: { tool: { isActive: true } } }
                    },
                },
            },
            orderBy: {
                name: 'asc'
            }
        });
        const tagDTOs = tags.map((tag: PrismaTagWithToolCount) => toTagDTO(tag));
        this.cache.set(cacheKey, tagDTOs);
        return tagDTOs;
    }

    async getTagBySlug(slug: string): Promise<TagDTO | null> {
        const cacheKey = `tagBySlug:${slug}`;
        const cachedData = this.cache.get<TagDTO | null>(cacheKey);
        if (cachedData !== undefined) {
            return cachedData;
        }

        const tag = await this.prisma.tag.findUnique({
            where: { slug },
            include: {
                _count: {
                    select: {
                        tools: { where: { tool: { isActive: true } } }
                    },
                },
            },
        });

        if (!tag) {
            this.cache.set(cacheKey, null);
            return null;
        }
        const tagDTO = toTagDTO(tag as PrismaTagWithToolCount);
        this.cache.set(cacheKey, tagDTO);
        return tagDTO;
    }

    async recordToolUsage(toolSlug: string): Promise<void> {
        const tool = await this.prisma.tool.findUnique({
            where: { slug: toolSlug, isActive: true },
            select: { id: true },
        });

        if (!tool) {
            console.warn(`Attempted to record usage for non-existent or inactive tool: ${toolSlug}`);
            return;
        }

        const now = new Date();
        await this.prisma.toolUsageStats.upsert({
            where: { toolId: tool.id },
            create: {
                toolId: tool.id,
                usageCount: 1,
                lastUsed: now,
            },
            update: {
                usageCount: { increment: 1 },
                lastUsed: now,
            },
        });

        this.cache.flushAll();
    }

    async getPopularTools(limit: number): Promise<ToolDTO[]> {
        const cacheKey = `popularTools:${limit}`;
        const cachedData = this.cache.get<ToolDTO[]>(cacheKey);
        if (cachedData) {
            return cachedData;
        }

        const popularToolsResults = await this.prisma.tool.findMany({
            where: { isActive: true },
            orderBy: [
                { createdAt: 'desc' }
            ],
            take: limit,
            include: {
                tags: { include: { tag: true } },
                toolUsageStats: true,
            },
        });
        const toolDTOs = (popularToolsResults as PrismaToolWithRelations[]).map((tool: PrismaToolWithRelations) => toToolDTO(tool));
        this.cache.set(cacheKey, toolDTOs);
        return toolDTOs;
    }

    async searchTools(query: string): Promise<ToolDTO[]> {
        const cacheKey = `searchTools:${query}`;
        const cachedData = this.cache.get<ToolDTO[]>(cacheKey);
        if (cachedData) {
            return cachedData;
        }

        const searchResultsFromDb = await this.prisma.tool.findMany({
            where: {
                isActive: true,
                OR: [
                    { name: { contains: query } },
                    { description: { contains: query } },
                    { slug: { contains: query } },
                    {
                        tags: {
                            some: {
                                tag: {
                                    OR: [
                                        { name: { contains: query } },
                                        { slug: { contains: query } },
                                    ],
                                },
                            },
                        },
                    },
                ],
            },
            orderBy: { displayOrder: 'asc' },
            include: {
                tags: { include: { tag: true } },
                toolUsageStats: true,
            },
        });
        const toolDTOs = (searchResultsFromDb as PrismaToolWithRelations[]).map((tool: PrismaToolWithRelations) => toToolDTO(tool));
        this.cache.set(cacheKey, toolDTOs);
        return toolDTOs;
    }

    async getToolsPaginated(offset: number, limit: number): Promise<ToolDTO[]> {
        const cacheKey = `toolsPaginated:${offset}:${limit}`;
        const cachedData = this.cache.get<ToolDTO[]>(cacheKey);
        if (cachedData) {
            return cachedData;
        }
        const tools = await this.prisma.tool.findMany({
            where: { isActive: true },
            orderBy: { displayOrder: 'asc' },
            skip: offset,
            take: limit,
            include: {
                tags: { include: { tag: true } },
                toolUsageStats: true,
            },
        });
        const toolDTOs = tools.map((tool: PrismaToolWithRelations) => toToolDTO(tool));
        this.cache.set(cacheKey, toolDTOs);
        return toolDTOs;
    }

    async getToolsByTagPaginated(tagSlug: string, offset: number, limit: number): Promise<ToolDTO[]> {
        const cacheKey = `toolsByTagPaginated:${tagSlug}:${offset}:${limit}`;
        const cachedData = this.cache.get<ToolDTO[]>(cacheKey);
        if (cachedData) {
            return cachedData;
        }
        const tools = await this.prisma.tool.findMany({
            where: {
                isActive: true,
                tags: {
                    some: {
                        tag: { slug: tagSlug },
                    },
                },
            },
            orderBy: { displayOrder: 'asc' },
            skip: offset,
            take: limit,
            include: {
                tags: { include: { tag: true } },
                toolUsageStats: true,
            },
        });
        const toolDTOs = tools.map((tool: PrismaToolWithRelations) => toToolDTO(tool));
        this.cache.set(cacheKey, toolDTOs);
        return toolDTOs;
    }
} 