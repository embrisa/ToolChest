import { injectable, inject } from 'inversify';
import { PrismaClient, Prisma } from '@prisma/client';
import { TYPES } from '../config/types';
import { AdminAuditService } from './adminAuditService';
import { TagDTO, toTagDTO, PrismaTagWithToolCount } from '../dto/tag.dto';

export interface CreateTagDTO {
    name: string;
    description?: string;
    color?: string;
}

export interface UpdateTagDTO {
    name?: string;
    slug?: string;
    description?: string;
    color?: string;
}

export interface AdminTagService {
    getAllTagsForAdmin(): Promise<TagDTO[]>;
    getTagByIdForAdmin(id: string): Promise<TagDTO | null>;
    createTag(data: CreateTagDTO, adminUserId: string, ipAddress: string, userAgent: string): Promise<TagDTO>;
    updateTag(id: string, data: UpdateTagDTO, adminUserId: string, ipAddress: string, userAgent: string): Promise<TagDTO>;
    deleteTag(id: string, adminUserId: string, ipAddress: string, userAgent: string): Promise<void>;
    getTagsWithPagination(page: number, limit: number, search?: string): Promise<{ tags: TagDTO[], total: number, totalPages: number }>;
    getTagUsageStats(id: string): Promise<{ toolCount: number, tools: Array<{ id: string, name: string, slug: string }> }>;
}

@injectable()
export class AdminTagServiceImpl implements AdminTagService {
    constructor(
        @inject(TYPES.PrismaClient) private prisma: PrismaClient,
        @inject(TYPES.AdminAuditService) private auditService: AdminAuditService
    ) { }

    async getAllTagsForAdmin(): Promise<TagDTO[]> {
        const tags = await this.prisma.tag.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: {
                        tools: { where: { tool: { isActive: true } } }
                    },
                },
            },
        });
        return tags.map((tag: PrismaTagWithToolCount) => toTagDTO(tag));
    }

    async getTagByIdForAdmin(id: string): Promise<TagDTO | null> {
        const tag = await this.prisma.tag.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        tools: { where: { tool: { isActive: true } } }
                    },
                },
            },
        });

        if (!tag) {
            return null;
        }
        return toTagDTO(tag as PrismaTagWithToolCount);
    }

    async createTag(
        data: CreateTagDTO,
        adminUserId: string,
        ipAddress: string,
        userAgent: string
    ): Promise<TagDTO> {
        // Generate slug from name
        const slug = this.generateSlug(data.name);

        // Check if slug already exists
        const existingTag = await this.prisma.tag.findUnique({
            where: { slug }
        });

        if (existingTag) {
            throw new Error(`A tag with slug "${slug}" already exists`);
        }

        const tag = await this.prisma.tag.create({
            data: {
                name: data.name,
                slug,
                description: data.description,
                color: data.color || '#3B82F6', // Default to blue
            },
            include: {
                _count: {
                    select: {
                        tools: { where: { tool: { isActive: true } } }
                    },
                },
            },
        });

        // Log the action
        await this.auditService.logAction({
            adminUserId,
            action: 'CREATE',
            tableName: 'Tag',
            recordId: tag.id,
            newValues: tag,
            ipAddress,
            userAgent
        });

        return toTagDTO(tag as PrismaTagWithToolCount);
    }

    async updateTag(
        id: string,
        data: UpdateTagDTO,
        adminUserId: string,
        ipAddress: string,
        userAgent: string
    ): Promise<TagDTO> {
        // Get existing tag for audit log
        const existingTag = await this.prisma.tag.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        tools: { where: { tool: { isActive: true } } }
                    },
                },
            },
        });

        if (!existingTag) {
            throw new Error('Tag not found');
        }

        // Prepare update data
        const updateData: Prisma.TagUpdateInput = {};

        if (data.name !== undefined) {
            updateData.name = data.name;
            // If name changed, regenerate slug unless explicitly provided
            if (data.slug === undefined) {
                const newSlug = this.generateSlug(data.name);
                if (newSlug !== existingTag.slug) {
                    // Check if new slug already exists
                    const existingSlug = await this.prisma.tag.findUnique({
                        where: { slug: newSlug }
                    });
                    if (existingSlug && existingSlug.id !== id) {
                        throw new Error(`A tag with slug "${newSlug}" already exists`);
                    }
                    updateData.slug = newSlug;
                }
            }
        }

        if (data.slug !== undefined) {
            // Check if slug already exists
            const existingSlug = await this.prisma.tag.findUnique({
                where: { slug: data.slug }
            });
            if (existingSlug && existingSlug.id !== id) {
                throw new Error(`A tag with slug "${data.slug}" already exists`);
            }
            updateData.slug = data.slug;
        }

        if (data.description !== undefined) updateData.description = data.description;
        if (data.color !== undefined) updateData.color = data.color;

        const updatedTag = await this.prisma.tag.update({
            where: { id },
            data: updateData,
            include: {
                _count: {
                    select: {
                        tools: { where: { tool: { isActive: true } } }
                    },
                },
            },
        });

        // Log the action
        await this.auditService.logAction({
            adminUserId,
            action: 'UPDATE',
            tableName: 'Tag',
            recordId: id,
            oldValues: existingTag,
            newValues: updatedTag,
            ipAddress,
            userAgent
        });

        return toTagDTO(updatedTag as PrismaTagWithToolCount);
    }

    async deleteTag(
        id: string,
        adminUserId: string,
        ipAddress: string,
        userAgent: string
    ): Promise<void> {
        // Get existing tag for audit log and check usage
        const existingTag = await this.prisma.tag.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        tools: true
                    },
                },
            },
        });

        if (!existingTag) {
            throw new Error('Tag not found');
        }

        // Check if tag is being used by any tools
        if (existingTag._count.tools > 0) {
            throw new Error(`Cannot delete tag "${existingTag.name}" because it is assigned to ${existingTag._count.tools} tool(s). Remove the tag from all tools first.`);
        }

        // Delete the tag
        await this.prisma.tag.delete({
            where: { id }
        });

        // Log the action
        await this.auditService.logAction({
            adminUserId,
            action: 'DELETE',
            tableName: 'Tag',
            recordId: id,
            oldValues: existingTag,
            ipAddress,
            userAgent
        });
    }

    async getTagsWithPagination(
        page: number = 1,
        limit: number = 20,
        search?: string
    ): Promise<{ tags: TagDTO[], total: number, totalPages: number }> {
        const offset = (page - 1) * limit;

        const where: Prisma.TagWhereInput = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [tags, total] = await Promise.all([
            this.prisma.tag.findMany({
                where,
                orderBy: { name: 'asc' },
                skip: offset,
                take: limit,
                include: {
                    _count: {
                        select: {
                            tools: { where: { tool: { isActive: true } } }
                        },
                    },
                },
            }),
            this.prisma.tag.count({ where })
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            tags: tags.map((tag: PrismaTagWithToolCount) => toTagDTO(tag)),
            total,
            totalPages
        };
    }

    async getTagUsageStats(id: string): Promise<{ toolCount: number, tools: Array<{ id: string, name: string, slug: string }> }> {
        const tag = await this.prisma.tag.findUnique({
            where: { id },
            include: {
                tools: {
                    include: {
                        tool: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                isActive: true
                            }
                        }
                    }
                }
            }
        });

        if (!tag) {
            throw new Error('Tag not found');
        }

        const tools = tag.tools.map(toolTag => ({
            id: toolTag.tool.id,
            name: toolTag.tool.name,
            slug: toolTag.tool.slug
        }));

        return {
            toolCount: tools.length,
            tools
        };
    }

    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
} 