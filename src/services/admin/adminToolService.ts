import { BaseService } from "../core/baseService";
import { ToolDTO, TagDTO, ToolInput, toToolDTO } from "@/types/tools/tool";
import {
  AdminToolFormData,
  AdminToolCreateRequest,
  AdminToolUpdateRequest,
  AdminToolListItem,
  AdminToolsSortOptions,
  AdminToolsFilters,
  AdminToolValidationErrors,
} from "@/types/admin/tool";

export interface IAdminToolService {
  getAllToolsForAdmin(
    sortOptions?: AdminToolsSortOptions,
    filters?: AdminToolsFilters,
  ): Promise<AdminToolListItem[]>;
  getToolByIdForAdmin(id: string): Promise<ToolDTO | null>;
  createTool(data: AdminToolCreateRequest): Promise<ToolDTO>;
  updateTool(data: AdminToolUpdateRequest): Promise<ToolDTO>;
  deleteTool(id: string): Promise<void>;
  validateToolData(data: AdminToolFormData): Promise<AdminToolValidationErrors>;
  generateSlugFromName(name: string): string;
  checkSlugAvailable(slug: string, excludeId?: string): Promise<boolean>;
}

export class AdminToolService extends BaseService implements IAdminToolService {
  async getAllToolsForAdmin(
    sortOptions: AdminToolsSortOptions = {
      field: "displayOrder",
      direction: "asc",
    },
    filters: AdminToolsFilters = {},
  ): Promise<AdminToolListItem[]> {
    const cacheKey = `adminTools:${JSON.stringify(sortOptions)}:${JSON.stringify(filters)}`;

    return this.getCached(cacheKey, async () => {
      // Build where clause for filters
      const where: any = {};

      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: "insensitive" } },
          { description: { contains: filters.search, mode: "insensitive" } },
          { slug: { contains: filters.search, mode: "insensitive" } },
        ];
      }

      if (typeof filters.isActive === "boolean") {
        where.isActive = filters.isActive;
      }

      if (filters.tagIds && filters.tagIds.length > 0) {
        where.tags = {
          some: {
            tagId: { in: filters.tagIds },
          },
        };
      }

      // Build order by clause
      const orderBy: any = {};
      orderBy[sortOptions.field] = sortOptions.direction;

      const tools = await this.prisma.tool.findMany({
        where,
        orderBy,
        include: {
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  color: true,
                },
              },
            },
          },
          toolUsageStats: {
            select: {
              usageCount: true,
            },
          },
          _count: {
            select: {
              tags: true,
            },
          },
        },
      });

      return tools.map((tool) => ({
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
        tagCount: tool._count.tags,
        tags: tool.tags.map((t) => ({
          id: t.tag.id,
          name: t.tag.name,
          color: t.tag.color,
        })),
      }));
    });
  }

  async getToolByIdForAdmin(id: string): Promise<ToolDTO | null> {
    this.validateRequired({ id });

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

    return toToolDTO(tool as any);
  }

  async createTool(data: AdminToolCreateRequest): Promise<ToolDTO> {
    this.validateRequired({ name: data.name, slug: data.slug });

    // Check if slug is available
    const slugAvailable = await this.checkSlugAvailable(data.slug);
    if (!slugAvailable) {
      throw new Error(`Slug '${data.slug}' is already in use`);
    }

    // Get next display order if not provided
    let displayOrder = data.displayOrder;
    if (displayOrder === undefined) {
      const maxOrder = await this.prisma.tool.aggregate({
        _max: { displayOrder: true },
      });
      displayOrder = (maxOrder._max.displayOrder ?? 0) + 1;
    }

    const tool = await this.prisma.tool.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        iconClass: data.iconClass || null,
        displayOrder,
        isActive: data.isActive ?? true,
        tags:
          data.tagIds && data.tagIds.length > 0
            ? {
                create: data.tagIds.map((tagId) => ({
                  tagId,
                })),
              }
            : undefined,
      },
      include: {
        tags: { include: { tag: true } },
        toolUsageStats: true,
      },
    });

    // Clear caches
    this.invalidateCache("allTools");
    this.invalidateCache("adminTools:*");

    return toToolDTO(tool as any);
  }

  async updateTool(data: AdminToolUpdateRequest): Promise<ToolDTO> {
    this.validateRequired({ id: data.id, name: data.name, slug: data.slug });

    // Check if slug is available (excluding current tool)
    const slugAvailable = await this.checkSlugAvailable(data.slug, data.id);
    if (!slugAvailable) {
      throw new Error(`Slug '${data.slug}' is already in use`);
    }

    // Update tool and handle tag relationships
    const tool = await this.prisma.tool.update({
      where: { id: data.id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        iconClass: data.iconClass || null,
        displayOrder: data.displayOrder,
        isActive: data.isActive,
        tags: {
          deleteMany: {}, // Remove all existing relationships
          create:
            data.tagIds?.map((tagId) => ({
              tagId,
            })) || [],
        },
      },
      include: {
        tags: { include: { tag: true } },
        toolUsageStats: true,
      },
    });

    // Clear caches
    this.invalidateCache("allTools");
    this.invalidateCache("adminTools:*");
    this.invalidateCache(`toolBySlug:${data.slug}`);

    return toToolDTO(tool as any);
  }

  async deleteTool(id: string): Promise<void> {
    this.validateRequired({ id });

    // Get tool info for cache clearing
    const tool = await this.prisma.tool.findUnique({
      where: { id },
      select: { slug: true },
    });

    if (!tool) {
      throw new Error("Tool not found");
    }

    // Delete tool (cascade will handle related records)
    await this.prisma.tool.delete({
      where: { id },
    });

    // Clear caches
    this.invalidateCache("allTools");
    this.invalidateCache("adminTools:*");
    this.invalidateCache(`toolBySlug:${tool.slug}`);
  }

  async validateToolData(
    data: AdminToolFormData,
  ): Promise<AdminToolValidationErrors> {
    const errors: AdminToolValidationErrors = {};

    // Name validation
    if (!data.name.trim()) {
      errors.name = "Name is required";
    } else if (data.name.length > 100) {
      errors.name = "Name must be 100 characters or less";
    }

    // Slug validation
    if (!data.slug.trim()) {
      errors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
      errors.slug =
        "Slug must contain only lowercase letters, numbers, and hyphens";
    } else if (data.slug.length > 100) {
      errors.slug = "Slug must be 100 characters or less";
    }

    // Description validation
    if (data.description && data.description.length > 1000) {
      errors.description = "Description must be 1000 characters or less";
    }

    // Icon class validation
    if (data.iconClass && data.iconClass.length > 100) {
      errors.iconClass = "Icon class must be 100 characters or less";
    }

    // Display order validation
    if (data.displayOrder < 0) {
      errors.displayOrder = "Display order must be 0 or greater";
    }

    return errors;
  }

  generateSlugFromName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "") // Remove invalid characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
  }

  async checkSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
    const where: any = { slug };
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const existingTool = await this.prisma.tool.findFirst({
      where,
      select: { id: true },
    });

    return !existingTool;
  }
}
