import { injectable, inject } from 'inversify';
import { PrismaClient, Prisma } from '@prisma/client';
import { TYPES } from '../config/types';
import { AdminAuditService } from './adminAuditService';
import { ToolDTO, toToolDTO, PrismaToolWithRelations } from '../dto/tool.dto';

export interface CreateToolDTO {
    name: string;
    description?: string;
    iconClass?: string;
    displayOrder?: number;
    tagIds?: string[];
}

export interface UpdateToolDTO {
    name?: string;
    slug?: string;
    description?: string;
    iconClass?: string;
    displayOrder?: number;
    isActive?: boolean;
    tagIds?: string[];
}

export interface AdvancedToolFilters {
    search?: string;
    isActive?: boolean;
    tagIds?: string[];
    createdAfter?: Date;
    createdBefore?: Date;
    usageCountMin?: number;
    usageCountMax?: number;
    hasNoTags?: boolean;
    sortBy?: 'name' | 'createdAt' | 'displayOrder' | 'usageCount';
    sortOrder?: 'asc' | 'desc';
}

export interface AdminToolService {
    getAllToolsForAdmin(): Promise<ToolDTO[]>;
    getToolByIdForAdmin(id: string): Promise<ToolDTO | null>;
    createTool(data: CreateToolDTO, adminUserId: string, ipAddress: string, userAgent: string): Promise<ToolDTO>;
    updateTool(id: string, data: UpdateToolDTO, adminUserId: string, ipAddress: string, userAgent: string): Promise<ToolDTO>;
    deleteTool(id: string, adminUserId: string, ipAddress: string, userAgent: string): Promise<void>;
    toggleToolStatus(id: string, adminUserId: string, ipAddress: string, userAgent: string): Promise<ToolDTO>;
    getToolsWithPagination(page: number, limit: number, search?: string, isActive?: boolean): Promise<{ tools: ToolDTO[], total: number, totalPages: number }>;
    getToolsWithAdvancedFilters(page: number, limit: number, filters: AdvancedToolFilters): Promise<{ tools: ToolDTO[], total: number, totalPages: number }>;
    getFilterOptions(): Promise<{ tags: Array<{ id: string, name: string, color: string | null }>, usageStats: { min: number, max: number } }>;
}

@injectable()
export class AdminToolServiceImpl implements AdminToolService {
    constructor(
        @inject(TYPES.PrismaClient) private prisma: PrismaClient,
        @inject(TYPES.AdminAuditService) private auditService: AdminAuditService
    ) { }

    async getAllToolsForAdmin(): Promise<ToolDTO[]> {
        const tools = await this.prisma.tool.findMany({
            orderBy: [{ isActive: 'desc' }, { displayOrder: 'asc' }],
            include: {
                tags: { include: { tag: true } },
                toolUsageStats: true,
            },
        });
        return tools.map((tool: PrismaToolWithRelations) => toToolDTO(tool));
    }

    async getToolByIdForAdmin(id: string): Promise<ToolDTO | null> {
        const tool = await this.prisma.tool.findUnique({
            where: { id },
            include: {
                tags: { include: { tag: true } },
                toolUsageStats: true,
            },
        });

        if (!tool) {
            return null;
        }
        return toToolDTO(tool as PrismaToolWithRelations);
    }

    async createTool(
        data: CreateToolDTO,
        adminUserId: string,
        ipAddress: string,
        userAgent: string
    ): Promise<ToolDTO> {
        // Generate slug from name
        const slug = this.generateSlug(data.name);

        // Check if slug already exists
        const existingTool = await this.prisma.tool.findUnique({
            where: { slug }
        });

        if (existingTool) {
            throw new Error(`A tool with slug "${slug}" already exists`);
        }

        // Get next display order if not provided
        const displayOrder = data.displayOrder !== undefined ? data.displayOrder : await this.getNextDisplayOrder();

        const tool = await this.prisma.tool.create({
            data: {
                name: data.name,
                slug,
                description: data.description,
                iconClass: data.iconClass || 'fas fa-tools',
                displayOrder,
                isActive: true,
                tags: data.tagIds ? {
                    create: data.tagIds.map(tagId => ({
                        tagId,
                        assignedAt: new Date()
                    }))
                } : undefined
            },
            include: {
                tags: { include: { tag: true } },
                toolUsageStats: true,
            },
        });

        // Log the action
        await this.auditService.logAction({
            adminUserId,
            action: 'CREATE',
            tableName: 'Tool',
            recordId: tool.id,
            newValues: tool,
            ipAddress,
            userAgent
        });

        return toToolDTO(tool as PrismaToolWithRelations);
    }

    async updateTool(
        id: string,
        data: UpdateToolDTO,
        adminUserId: string,
        ipAddress: string,
        userAgent: string
    ): Promise<ToolDTO> {
        // Get existing tool for audit log
        const existingTool = await this.prisma.tool.findUnique({
            where: { id },
            include: {
                tags: { include: { tag: true } },
                toolUsageStats: true,
            },
        });

        if (!existingTool) {
            throw new Error('Tool not found');
        }

        // Prepare update data
        const updateData: Prisma.ToolUpdateInput = {};

        if (data.name !== undefined) {
            updateData.name = data.name;
            // If name changed, regenerate slug unless explicitly provided
            if (data.slug === undefined) {
                const newSlug = this.generateSlug(data.name);
                if (newSlug !== existingTool.slug) {
                    // Check if new slug already exists
                    const existingSlug = await this.prisma.tool.findUnique({
                        where: { slug: newSlug }
                    });
                    if (existingSlug && existingSlug.id !== id) {
                        throw new Error(`A tool with slug "${newSlug}" already exists`);
                    }
                    updateData.slug = newSlug;
                }
            }
        }

        if (data.slug !== undefined) {
            // Check if slug already exists
            const existingSlug = await this.prisma.tool.findUnique({
                where: { slug: data.slug }
            });
            if (existingSlug && existingSlug.id !== id) {
                throw new Error(`A tool with slug "${data.slug}" already exists`);
            }
            updateData.slug = data.slug;
        }

        if (data.description !== undefined) updateData.description = data.description;
        if (data.iconClass !== undefined) updateData.iconClass = data.iconClass;
        if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;

        // Handle tag relationships
        if (data.tagIds !== undefined) {
            // Remove existing relationships and create new ones
            updateData.tags = {
                deleteMany: {},
                create: data.tagIds.map(tagId => ({
                    tagId,
                    assignedAt: new Date()
                }))
            };
        }

        const updatedTool = await this.prisma.tool.update({
            where: { id },
            data: updateData,
            include: {
                tags: { include: { tag: true } },
                toolUsageStats: true,
            },
        });

        // Log the action
        await this.auditService.logAction({
            adminUserId,
            action: 'UPDATE',
            tableName: 'Tool',
            recordId: id,
            oldValues: existingTool,
            newValues: updatedTool,
            ipAddress,
            userAgent
        });

        return toToolDTO(updatedTool as PrismaToolWithRelations);
    }

    async deleteTool(
        id: string,
        adminUserId: string,
        ipAddress: string,
        userAgent: string
    ): Promise<void> {
        // Get existing tool for audit log
        const existingTool = await this.prisma.tool.findUnique({
            where: { id },
            include: {
                tags: { include: { tag: true } },
                toolUsageStats: true,
            },
        });

        if (!existingTool) {
            throw new Error('Tool not found');
        }

        // Delete related records first
        await this.prisma.toolTag.deleteMany({
            where: { toolId: id }
        });

        await this.prisma.toolUsageStats.deleteMany({
            where: { toolId: id }
        });

        // Delete the tool
        await this.prisma.tool.delete({
            where: { id }
        });

        // Log the action
        await this.auditService.logAction({
            adminUserId,
            action: 'DELETE',
            tableName: 'Tool',
            recordId: id,
            oldValues: existingTool,
            ipAddress,
            userAgent
        });
    }

    async toggleToolStatus(
        id: string,
        adminUserId: string,
        ipAddress: string,
        userAgent: string
    ): Promise<ToolDTO> {
        const existingTool = await this.getToolByIdForAdmin(id);
        if (!existingTool) {
            throw new Error('Tool not found');
        }

        return this.updateTool(
            id,
            { isActive: !existingTool.isActive },
            adminUserId,
            ipAddress,
            userAgent
        );
    }

    async getToolsWithPagination(
        page: number = 1,
        limit: number = 20,
        search?: string,
        isActive?: boolean
    ): Promise<{ tools: ToolDTO[], total: number, totalPages: number }> {
        const offset = (page - 1) * limit;

        const where: Prisma.ToolWhereInput = {};

        if (isActive !== undefined) {
            where.isActive = isActive;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [tools, total] = await Promise.all([
            this.prisma.tool.findMany({
                where,
                orderBy: [{ isActive: 'desc' }, { displayOrder: 'asc' }],
                skip: offset,
                take: limit,
                include: {
                    tags: { include: { tag: true } },
                    toolUsageStats: true,
                },
            }),
            this.prisma.tool.count({ where })
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            tools: tools.map((tool: PrismaToolWithRelations) => toToolDTO(tool)),
            total,
            totalPages
        };
    }

    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    async getToolsWithAdvancedFilters(
        page: number = 1,
        limit: number = 20,
        filters: AdvancedToolFilters
    ): Promise<{ tools: ToolDTO[], total: number, totalPages: number }> {
        const offset = (page - 1) * limit;

        const where: Prisma.ToolWhereInput = {};

        // Basic filters
        if (filters.isActive !== undefined) {
            where.isActive = filters.isActive;
        }

        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
                { slug: { contains: filters.search, mode: 'insensitive' } }
            ];
        }

        // Date range filters
        if (filters.createdAfter || filters.createdBefore) {
            where.createdAt = {};
            if (filters.createdAfter) {
                where.createdAt.gte = filters.createdAfter;
            }
            if (filters.createdBefore) {
                where.createdAt.lte = filters.createdBefore;
            }
        }

        // Tag filters
        if (filters.tagIds && filters.tagIds.length > 0) {
            where.tags = {
                some: {
                    tagId: { in: filters.tagIds }
                }
            };
        }

        // Filter for tools with no tags
        if (filters.hasNoTags) {
            where.tags = {
                none: {}
            };
        }

        // Usage count filters (we'll need to handle this with a subquery)
        if (filters.usageCountMin !== undefined || filters.usageCountMax !== undefined) {
            const usageWhere: any = {};
            if (filters.usageCountMin !== undefined) {
                usageWhere.gte = filters.usageCountMin;
            }
            if (filters.usageCountMax !== undefined) {
                usageWhere.lte = filters.usageCountMax;
            }

            // For usage count filtering, we need to use a more complex query
            const toolsWithUsage = await this.prisma.tool.findMany({
                where,
                include: {
                    toolUsageStats: true,
                    tags: { include: { tag: true } }
                }
            });

            const filteredTools = toolsWithUsage.filter(tool => {
                const usageCount = tool.toolUsageStats.reduce((sum, stat) => sum + stat.usageCount, 0);
                if (filters.usageCountMin !== undefined && usageCount < filters.usageCountMin) return false;
                if (filters.usageCountMax !== undefined && usageCount > filters.usageCountMax) return false;
                return true;
            });

            // Apply sorting
            const sortedTools = this.applySorting(filteredTools, filters.sortBy, filters.sortOrder);

            // Apply pagination
            const paginatedTools = sortedTools.slice(offset, offset + limit);

            return {
                tools: paginatedTools.map((tool: PrismaToolWithRelations) => toToolDTO(tool)),
                total: filteredTools.length,
                totalPages: Math.ceil(filteredTools.length / limit)
            };
        }

        // Build order by clause
        const orderBy = this.buildOrderBy(filters.sortBy, filters.sortOrder);

        const [tools, total] = await Promise.all([
            this.prisma.tool.findMany({
                where,
                orderBy,
                skip: offset,
                take: limit,
                include: {
                    tags: { include: { tag: true } },
                    toolUsageStats: true,
                },
            }),
            this.prisma.tool.count({ where })
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            tools: tools.map((tool: PrismaToolWithRelations) => toToolDTO(tool)),
            total,
            totalPages
        };
    }

    async getFilterOptions(): Promise<{ tags: Array<{ id: string, name: string, color: string | null }>, usageStats: { min: number, max: number } }> {
        // Get all tags for filter dropdown
        const tags = await this.prisma.tag.findMany({
            select: { id: true, name: true, color: true },
            orderBy: { name: 'asc' }
        });

        // Get usage statistics range
        const tools = await this.prisma.tool.findMany({
            include: { toolUsageStats: true }
        });

        let minUsage = 0;
        let maxUsage = 0;

        if (tools.length > 0) {
            const usageCounts = tools.map(tool =>
                tool.toolUsageStats.reduce((sum, stat) => sum + stat.usageCount, 0)
            );
            minUsage = Math.min(...usageCounts);
            maxUsage = Math.max(...usageCounts);
        }

        return {
            tags,
            usageStats: { min: minUsage, max: maxUsage }
        };
    }

    private buildOrderBy(sortBy?: string, sortOrder?: string): Prisma.ToolOrderByWithRelationInput[] {
        const order = sortOrder === 'desc' ? 'desc' : 'asc';

        switch (sortBy) {
            case 'name':
                return [{ name: order }];
            case 'createdAt':
                return [{ createdAt: order }];
            case 'displayOrder':
                return [{ displayOrder: order }];
            case 'usageCount':
                // For usage count, we'll need to use a different approach since it's calculated
                // Fall back to default ordering for now
                return [{ isActive: 'desc' }, { displayOrder: 'asc' }];
            default:
                return [{ isActive: 'desc' }, { displayOrder: 'asc' }];
        }
    }

    private applySorting(tools: any[], sortBy?: string, sortOrder?: string): any[] {
        if (!sortBy) return tools;

        const order = sortOrder === 'desc' ? -1 : 1;

        return tools.sort((a, b) => {
            let aValue: any;
            let bValue: any;

            switch (sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'createdAt':
                    aValue = new Date(a.createdAt);
                    bValue = new Date(b.createdAt);
                    break;
                case 'displayOrder':
                    aValue = a.displayOrder;
                    bValue = b.displayOrder;
                    break;
                case 'usageCount':
                    aValue = a.toolUsageStats.reduce((sum: number, stat: any) => sum + stat.usageCount, 0);
                    bValue = b.toolUsageStats.reduce((sum: number, stat: any) => sum + stat.usageCount, 0);
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return -1 * order;
            if (aValue > bValue) return 1 * order;
            return 0;
        });
    }

    private async getNextDisplayOrder(): Promise<number> {
        const lastTool = await this.prisma.tool.findFirst({
            orderBy: { displayOrder: 'desc' },
            select: { displayOrder: true }
        });
        return (lastTool?.displayOrder || 0) + 1;
    }
} 