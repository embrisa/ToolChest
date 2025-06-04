import { PrismaClient, Prisma } from "@prisma/client";
import { BaseService } from "../core/baseService";
import {
  ToolTagRelationship,
  BulkTagOperation,
  BulkOperationResult,
  BulkOperationPreview,
  TagUsageStatistics,
  ToolTagAssignmentData,
  RelationshipValidationResult,
  RelationshipValidationError,
  OrphanedEntityCheck,
  RelationshipFilters,
  RelationshipSortOptions,
} from "@/types/admin/relationship";

export interface IRelationshipService {
  getAllRelationships(
    filters?: RelationshipFilters,
    sortOptions?: RelationshipSortOptions,
  ): Promise<ToolTagRelationship[]>;

  getToolTagAssignments(toolId: string): Promise<ToolTagAssignmentData>;

  getTagUsageStatistics(tagId?: string): Promise<TagUsageStatistics[]>;

  previewBulkOperation(
    operation: BulkTagOperation,
  ): Promise<BulkOperationPreview>;

  executeBulkOperation(
    operation: BulkTagOperation,
  ): Promise<BulkOperationResult>;

  validateRelationships(
    toolIds?: string[],
    tagIds?: string[],
  ): Promise<RelationshipValidationResult>;

  findOrphanedEntities(): Promise<OrphanedEntityCheck>;

  bulkAssignTags(
    toolIds: string[],
    tagIds: string[],
  ): Promise<BulkOperationResult>;

  bulkRemoveTags(
    toolIds: string[],
    tagIds: string[],
  ): Promise<BulkOperationResult>;

  autoResolveOrphans(): Promise<BulkOperationResult>;
}

export class RelationshipService
  extends BaseService
  implements IRelationshipService
{
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async getAllRelationships(
    filters: RelationshipFilters = {},
    sortOptions: RelationshipSortOptions = {
      field: "toolName",
      direction: "asc",
    },
  ): Promise<ToolTagRelationship[]> {
    const cacheKey = `relationships:${JSON.stringify(filters)}:${JSON.stringify(sortOptions)}`;

    return this.getCached(cacheKey, async () => {
      // Build where clause
      const where: Prisma.ToolTagWhereInput = {};

      if (filters.toolIds && filters.toolIds.length > 0) {
        where.toolId = { in: filters.toolIds };
      }

      if (filters.tagIds && filters.tagIds.length > 0) {
        where.tagId = { in: filters.tagIds };
      }

      if (typeof filters.toolIsActive === "boolean") {
        where.tool = { isActive: filters.toolIsActive };
      }

      if (filters.search) {
        where.OR = [
          { tool: { name: { contains: filters.search, mode: "insensitive" } } },
          { tag: { name: { contains: filters.search, mode: "insensitive" } } },
        ];
      }

      // Build order by
      let orderBy: Prisma.ToolTagOrderByWithRelationInput = {};
      switch (sortOptions.field) {
        case "toolName":
          orderBy = { tool: { name: sortOptions.direction } };
          break;
        case "tagName":
          orderBy = { tag: { name: sortOptions.direction } };
          break;
        case "toolDisplayOrder":
          orderBy = { tool: { displayOrder: sortOptions.direction } };
          break;
        default:
          orderBy = { tool: { name: sortOptions.direction } };
      }

      const relationships = await this.prisma.toolTag.findMany({
        where,
        orderBy,
        include: {
          tool: {
            select: {
              id: true,
              name: true,
              slug: true,
              isActive: true,
            },
          },
          tag: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true,
            },
          },
        },
      });

      return relationships.map((rel) => ({
        toolId: rel.toolId,
        tagId: rel.tagId,
        toolName: rel.tool.name,
        tagName: rel.tag.name,
        toolSlug: rel.tool.slug,
        tagSlug: rel.tag.slug,
        toolIsActive: rel.tool.isActive,
        tagColor: rel.tag.color,
      }));
    });
  }

  async getToolTagAssignments(toolId: string): Promise<ToolTagAssignmentData> {
    this.validateRequired({ toolId });

    const tool = await this.prisma.tool.findUnique({
      where: { id: toolId },
      include: {
        tags: {
          select: {
            tagId: true,
          },
        },
      },
    });

    if (!tool) {
      throw new Error("Tool not found");
    }

    const allTags = await this.prisma.tag.findMany({
      select: { id: true },
    });

    const currentTagIds = tool.tags.map((t) => t.tagId);
    const availableTagIds = allTags.map((t) => t.id);

    return {
      toolId: tool.id,
      toolName: tool.name,
      toolSlug: tool.slug,
      isActive: tool.isActive,
      displayOrder: tool.displayOrder,
      currentTagIds,
      availableTagIds,
      lastModified: tool.updatedAt || tool.createdAt,
    };
  }

  async getTagUsageStatistics(tagId?: string): Promise<TagUsageStatistics[]> {
    const cacheKey = `tagUsageStats:${tagId || "all"}`;

    return this.getCached(cacheKey, async () => {
      const where = tagId ? { id: tagId } : {};

      const tags = await this.prisma.tag.findMany({
        where,
        include: {
          tools: {
            include: {
              tool: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  isActive: true,
                  displayOrder: true,
                },
              },
            },
          },
          _count: {
            select: {
              tools: true,
            },
          },
        },
      });

      const totalTools = await this.prisma.tool.count();

      // Calculate usage statistics for each tag
      const statistics = await Promise.all(
        tags.map(async (tag, index) => {
          const activeTools = tag.tools.filter((t) => t.tool.isActive).length;
          const inactiveTools = tag.tools.filter(
            (t) => !t.tool.isActive,
          ).length;
          const usagePercentage =
            totalTools > 0 ? (tag._count.tools / totalTools) * 100 : 0;

          // Get recent usage data
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

          const recentRelationships = await this.prisma.toolTag.findMany({
            where: {
              tagId: tag.id,
              // Note: We don't have createdAt on ToolTag, so we'll use tool creation dates as proxy
              tool: {
                createdAt: {
                  gte: oneWeekAgo,
                },
              },
            },
          });

          const monthlyRelationships = await this.prisma.toolTag.findMany({
            where: {
              tagId: tag.id,
              tool: {
                createdAt: {
                  gte: oneMonthAgo,
                },
              },
            },
          });

          return {
            tagId: tag.id,
            tagName: tag.name,
            tagSlug: tag.slug,
            tagColor: tag.color,
            totalTools: tag._count.tools,
            activeTools,
            inactiveTools,
            usagePercentage,
            popularityRank: index + 1, // Will be properly ranked after sorting
            recentUsage: {
              lastUsed:
                tag.tools.length > 0
                  ? tag.tools[0]?.tool
                    ? new Date()
                    : null
                  : null,
              toolsAddedThisWeek: recentRelationships.length,
              toolsAddedThisMonth: monthlyRelationships.length,
            },
            tools: tag.tools.map((t) => ({
              id: t.tool.id,
              name: t.tool.name,
              slug: t.tool.slug,
              isActive: t.tool.isActive,
              displayOrder: t.tool.displayOrder,
            })),
          };
        }),
      );

      // Sort by usage count and assign proper popularity ranks
      statistics.sort((a, b) => b.totalTools - a.totalTools);
      statistics.forEach((stat, index) => {
        stat.popularityRank = index + 1;
      });

      return statistics;
    });
  }

  async previewBulkOperation(
    operation: BulkTagOperation,
  ): Promise<BulkOperationPreview> {
    this.validateRequired({
      toolIds: operation.toolIds,
      tagIds: operation.tagIds,
      type: operation.type,
    });

    const tools = await this.prisma.tool.findMany({
      where: { id: { in: operation.toolIds } },
      include: {
        tags: {
          include: {
            tag: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    const toolsToUpdate = tools.map((tool) => {
      const currentTagIds = tool.tags.map((t) => t.tagId);
      let newTagIds: string[];

      if (operation.type === "assign") {
        // Add new tags, keep existing ones
        newTagIds = [...new Set([...currentTagIds, ...operation.tagIds])];
      } else {
        // Remove specified tags
        newTagIds = currentTagIds.filter(
          (id) => !operation.tagIds.includes(id),
        );
      }

      const addedTags = newTagIds.filter((id) => !currentTagIds.includes(id));
      const removedTags = currentTagIds.filter((id) => !newTagIds.includes(id));

      return {
        id: tool.id,
        name: tool.name,
        currentTags: currentTagIds,
        newTags: newTagIds,
        addedTags,
        removedTags,
      };
    });

    const summary = {
      totalTools: tools.length,
      totalTagChanges: toolsToUpdate.reduce(
        (sum, tool) => sum + tool.addedTags.length + tool.removedTags.length,
        0,
      ),
      newRelationships: toolsToUpdate.reduce(
        (sum, tool) => sum + tool.addedTags.length,
        0,
      ),
      removedRelationships: toolsToUpdate.reduce(
        (sum, tool) => sum + tool.removedTags.length,
        0,
      ),
    };

    const warnings: string[] = [];
    let requiresConfirmation = false;

    // Add warnings for potential issues
    if (operation.type === "remove") {
      const toolsBecomingUntagged = toolsToUpdate.filter(
        (tool) => tool.newTags.length === 0,
      );
      if (toolsBecomingUntagged.length > 0) {
        warnings.push(
          `${toolsBecomingUntagged.length} tool(s) will have no tags after this operation`,
        );
        requiresConfirmation = true;
      }
    }

    if (summary.totalTagChanges > 50) {
      warnings.push("This operation will make a large number of changes");
      requiresConfirmation = true;
    }

    return {
      toolsToUpdate,
      summary,
      warnings,
      requiresConfirmation,
    };
  }

  async executeBulkOperation(
    operation: BulkTagOperation,
  ): Promise<BulkOperationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let totalChanges = 0;
    let toolsAffected = 0;

    try {
      // Get preview to validate operation
      const preview = await this.previewBulkOperation(operation);

      if (preview.requiresConfirmation && !operation.requiresConfirmation) {
        throw new Error(
          "This operation requires confirmation due to potential data impact",
        );
      }

      // Execute the operation
      for (const toolUpdate of preview.toolsToUpdate) {
        if (
          toolUpdate.addedTags.length === 0 &&
          toolUpdate.removedTags.length === 0
        ) {
          continue; // No changes needed for this tool
        }

        try {
          await this.prisma.tool.update({
            where: { id: toolUpdate.id },
            data: {
              tags: {
                deleteMany:
                  operation.type === "assign"
                    ? {}
                    : {
                        tagId: { in: toolUpdate.removedTags },
                      },
                create:
                  operation.type === "assign"
                    ? toolUpdate.addedTags.map((tagId) => ({ tagId }))
                    : [],
              },
            },
          });

          totalChanges +=
            toolUpdate.addedTags.length + toolUpdate.removedTags.length;
          toolsAffected++;
        } catch (err) {
          errors.push(
            `Failed to update tool ${toolUpdate.name}: ${err instanceof Error ? err.message : "Unknown error"}`,
          );
        }
      }

      // Clear caches
      this.invalidateCache("relationships:*");
      this.invalidateCache("allTools");
      this.invalidateCache("adminTools:*");
      this.invalidateCache("tagUsageStats:*");

      return {
        success: errors.length === 0,
        totalChanges,
        toolsAffected,
        tagsAffected: operation.tagIds.length,
        errors,
        warnings,
      };
    } catch (err) {
      return {
        success: false,
        totalChanges: 0,
        toolsAffected: 0,
        tagsAffected: 0,
        errors: [err instanceof Error ? err.message : "Operation failed"],
        warnings,
      };
    }
  }

  async bulkAssignTags(
    toolIds: string[],
    tagIds: string[],
  ): Promise<BulkOperationResult> {
    const operation: BulkTagOperation = {
      type: "assign",
      toolIds,
      tagIds,
      requiresConfirmation: false,
      estimatedChanges: toolIds.length * tagIds.length,
    };

    return this.executeBulkOperation(operation);
  }

  async bulkRemoveTags(
    toolIds: string[],
    tagIds: string[],
  ): Promise<BulkOperationResult> {
    const operation: BulkTagOperation = {
      type: "remove",
      toolIds,
      tagIds,
      requiresConfirmation: true, // Removal operations require confirmation
      estimatedChanges: toolIds.length * tagIds.length,
    };

    return this.executeBulkOperation(operation);
  }

  async validateRelationships(
    toolIds?: string[],
    tagIds?: string[],
  ): Promise<RelationshipValidationResult> {
    const errors: RelationshipValidationError[] = [];
    const warnings: RelationshipValidationError[] = [];
    const suggestions: RelationshipValidationError[] = [];

    try {
      // Check for tools without tags
      const untaggedTools = await this.prisma.tool.findMany({
        where: {
          ...(toolIds && { id: { in: toolIds } }),
          tags: { none: {} },
        },
        select: { id: true, name: true, isActive: true },
      });

      if (untaggedTools.length > 0) {
        warnings.push({
          type: "warning",
          code: "UNTAGGED_TOOLS",
          message: `${untaggedTools.length} tool(s) have no tags assigned`,
          affectedIds: untaggedTools.map((t) => t.id),
        });
      }

      // Check for tags without tools
      const unusedTags = await this.prisma.tag.findMany({
        where: {
          ...(tagIds && { id: { in: tagIds } }),
          tools: { none: {} },
        },
        select: { id: true, name: true },
      });

      if (unusedTags.length > 0) {
        warnings.push({
          type: "warning",
          code: "UNUSED_TAGS",
          message: `${unusedTags.length} tag(s) are not assigned to any tools`,
          affectedIds: unusedTags.map((t) => t.id),
        });
      }

      // Check for inactive tools with tags
      const inactiveTaggedTools = await this.prisma.tool.findMany({
        where: {
          ...(toolIds && { id: { in: toolIds } }),
          isActive: false,
          tags: { some: {} },
        },
        select: { id: true, name: true },
      });

      if (inactiveTaggedTools.length > 0) {
        suggestions.push({
          type: "info",
          code: "INACTIVE_TAGGED_TOOLS",
          message: `${inactiveTaggedTools.length} inactive tool(s) still have tags assigned`,
          affectedIds: inactiveTaggedTools.map((t) => t.id),
        });
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        suggestions,
      };
    } catch (err) {
      return {
        isValid: false,
        errors: [
          {
            type: "error",
            code: "VALIDATION_ERROR",
            message: err instanceof Error ? err.message : "Validation failed",
          },
        ],
        warnings: [],
        suggestions: [],
      };
    }
  }

  async findOrphanedEntities(): Promise<OrphanedEntityCheck> {
    const orphanedTools = await this.prisma.tool.findMany({
      where: { tags: { none: {} } },
      select: { id: true, name: true, slug: true, isActive: true },
    });

    const orphanedTags = await this.prisma.tag.findMany({
      where: { tools: { none: {} } },
      select: { id: true, name: true, slug: true, color: true },
    });

    const suggestedActions: string[] = [];
    let canAutoResolve = false;

    if (orphanedTools.length > 0) {
      suggestedActions.push(
        `Assign tags to ${orphanedTools.length} untagged tool(s)`,
      );
    }

    if (orphanedTags.length > 0) {
      suggestedActions.push(
        `Review ${orphanedTags.length} unused tag(s) for removal or assignment`,
      );

      // We can auto-resolve by suggesting popular tags for tools
      if (orphanedTools.length > 0) {
        canAutoResolve = true;
        suggestedActions.push("Auto-assign popular tags to untagged tools");
      }
    }

    return {
      orphanedTools,
      orphanedTags,
      canAutoResolve,
      suggestedActions,
    };
  }

  async autoResolveOrphans(): Promise<BulkOperationResult> {
    try {
      const orphanCheck = await this.findOrphanedEntities();

      if (!orphanCheck.canAutoResolve) {
        return {
          success: false,
          totalChanges: 0,
          toolsAffected: 0,
          tagsAffected: 0,
          errors: ["No auto-resolvable orphan issues found"],
          warnings: [],
        };
      }

      // Get most popular tags (those used by most tools)
      const popularTags = await this.prisma.tag.findMany({
        include: {
          _count: {
            select: { tools: true },
          },
        },
        orderBy: {
          tools: {
            _count: "desc",
          },
        },
        take: 3, // Get top 3 most popular tags
      });

      if (popularTags.length === 0) {
        return {
          success: false,
          totalChanges: 0,
          toolsAffected: 0,
          tagsAffected: 0,
          errors: ["No popular tags found for auto-assignment"],
          warnings: [],
        };
      }

      // Assign popular tags to untagged tools
      const popularTagIds = popularTags.map((t) => t.id);
      const orphanedToolIds = orphanCheck.orphanedTools.map((t) => t.id);

      const result = await this.bulkAssignTags(orphanedToolIds, popularTagIds);

      return {
        ...result,
        warnings: [
          ...result.warnings,
          `Auto-assigned ${popularTags.length} popular tag(s) to ${orphanedToolIds.length} untagged tool(s)`,
        ],
      };
    } catch (err) {
      return {
        success: false,
        totalChanges: 0,
        toolsAffected: 0,
        tagsAffected: 0,
        errors: [err instanceof Error ? err.message : "Auto-resolve failed"],
        warnings: [],
      };
    }
  }
}
