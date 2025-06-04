import { BaseService } from "../core/baseService";
import { ToolDTO, TagDTO, toToolDTO, toTagDTO } from "@/types/tools/tool";
import {
  PrismaToolWithRelations,
  PrismaTagWithToolCount,
} from "@/types/tools/tool";
import { Prisma } from "@prisma/client";

export interface PaginationOptions {
  limit?: number;
  offset?: number;
  sortBy?: "displayOrder" | "name" | "createdAt" | "usageCount";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  tools: T[];
  total: number;
}

export interface IToolService {
  getAllTools(): Promise<ToolDTO[]>;
  getToolBySlug(slug: string): Promise<ToolDTO | null>;
  getToolsByTag(tagSlug: string): Promise<ToolDTO[]>;
  getAllTags(): Promise<TagDTO[]>;
  getTagBySlug(slug: string): Promise<TagDTO | null>;
  recordToolUsage(toolSlug: string): Promise<void>;
  getPopularTools(limit: number): Promise<ToolDTO[]>;
  searchTools(query: string): Promise<ToolDTO[]>;
  getToolsPaginated(offset: number, limit: number): Promise<ToolDTO[]>;
  getToolsByTagPaginated(
    tagSlug: string,
    offset: number,
    limit: number,
  ): Promise<ToolDTO[]>;
  getAllToolsPaginated(
    options: PaginationOptions,
  ): Promise<PaginatedResult<ToolDTO>>;
}

export class ToolService extends BaseService implements IToolService {
  async getAllTools(): Promise<ToolDTO[]> {
    const cacheKey = "allTools";
    return this.getCached(cacheKey, async () => {
      const tools = await this.prisma.tool.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
        include: {
          tags: { include: { tag: true } },
          toolUsageStats: true,
        },
      });
      return tools.map((tool: PrismaToolWithRelations) => toToolDTO(tool));
    });
  }

  async getToolBySlug(slug: string): Promise<ToolDTO | null> {
    this.validateRequired({ slug });

    const cacheKey = `toolBySlug:${slug}`;
    return this.getCached(cacheKey, async () => {
      const tool = await this.prisma.tool.findUnique({
        where: { slug, isActive: true },
        include: {
          tags: { include: { tag: true } },
          toolUsageStats: true,
        },
      });

      if (!tool) {
        return null;
      }

      return toToolDTO(tool as PrismaToolWithRelations);
    });
  }

  async getToolsByTag(tagSlug: string): Promise<ToolDTO[]> {
    this.validateRequired({ tagSlug });

    const cacheKey = `toolsByTag:${tagSlug}`;
    return this.getCached(cacheKey, async () => {
      const tools = await this.prisma.tool.findMany({
        where: {
          isActive: true,
          tags: {
            some: {
              tag: { slug: tagSlug },
            },
          },
        },
        orderBy: { displayOrder: "asc" },
        include: {
          tags: { include: { tag: true } },
          toolUsageStats: true,
        },
      });
      return tools.map((tool: PrismaToolWithRelations) => toToolDTO(tool));
    });
  }

  async getAllTags(): Promise<TagDTO[]> {
    const cacheKey = "allTags";
    return this.getCached(cacheKey, async () => {
      const tags = await this.prisma.tag.findMany({
        include: {
          _count: {
            select: {
              tools: { where: { tool: { isActive: true } } },
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });
      return tags.map((tag: PrismaTagWithToolCount) => toTagDTO(tag));
    });
  }

  async getTagBySlug(slug: string): Promise<TagDTO | null> {
    this.validateRequired({ slug });

    const cacheKey = `tagBySlug:${slug}`;
    return this.getCached(cacheKey, async () => {
      const tag = await this.prisma.tag.findUnique({
        where: { slug },
        include: {
          _count: {
            select: {
              tools: { where: { tool: { isActive: true } } },
            },
          },
        },
      });

      if (!tag) {
        return null;
      }

      return toTagDTO(tag as PrismaTagWithToolCount);
    });
  }

  async recordToolUsage(toolSlug: string): Promise<void> {
    this.validateRequired({ toolSlug });

    const tool = await this.prisma.tool.findUnique({
      where: { slug: toolSlug, isActive: true },
      select: { id: true },
    });

    if (!tool) {
      console.warn(
        `Attempted to record usage for non-existent or inactive tool: ${toolSlug}`,
      );
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

    // Clear related caches
    this.invalidateCache("allTools");
    this.invalidateCache(`toolBySlug:${toolSlug}`);
    this.invalidateCache("popularTools");
  }

  async getPopularTools(limit: number): Promise<ToolDTO[]> {
    this.validateRequired({ limit });

    const cacheKey = `popularTools:${limit}`;
    return this.getCached(cacheKey, async () => {
      // Raw query to get ordered tool IDs by usage count
      const orderedToolIdResults: Array<{ id: string }> = await this.prisma
        .$queryRaw`
                SELECT t.id
                FROM "Tool" t
                INNER JOIN "ToolUsageStats" tus ON t.id = tus."toolId"
                WHERE t."isActive" = ${true}
                ORDER BY tus."usageCount" DESC, t."updatedAt" DESC
                LIMIT ${limit}
            `;

      // If no tools have usage stats yet, fall back to the most recently updated tools
      if (!orderedToolIdResults || orderedToolIdResults.length === 0) {
        const fallbackTools = await this.prisma.tool.findMany({
          where: { isActive: true },
          orderBy: [{ displayOrder: "asc" }, { updatedAt: "desc" }],
          take: limit,
          include: {
            tags: { include: { tag: true } },
            toolUsageStats: true,
          },
        });

        return fallbackTools.map((tool: PrismaToolWithRelations) =>
          toToolDTO(tool),
        );
      }

      const orderedToolIds = orderedToolIdResults.map((r) => r.id);

      // Fetch tools based on the ordered IDs
      const popularToolsResults = await this.prisma.tool.findMany({
        where: {
          id: { in: orderedToolIds },
        },
        include: {
          tags: { include: { tag: true } },
          toolUsageStats: true,
        },
      });

      // Re-sort the fetched tools to match the order from the raw query
      const toolsMap = new Map(
        popularToolsResults.map((tool: PrismaToolWithRelations) => [
          tool.id,
          tool,
        ]),
      );
      const sortedPopularTools = orderedToolIds
        .map((id) => toolsMap.get(id))
        .filter(Boolean) as PrismaToolWithRelations[];

      return sortedPopularTools.map((tool: PrismaToolWithRelations) =>
        toToolDTO(tool),
      );
    });
  }

  async searchTools(query: string): Promise<ToolDTO[]> {
    this.validateRequired({ query });

    const cacheKey = `searchTools:${query}`;
    return this.getCached(cacheKey, async () => {
      const searchResults = await this.prisma.tool.findMany({
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
        orderBy: { displayOrder: "asc" },
        include: {
          tags: { include: { tag: true } },
          toolUsageStats: true,
        },
      });

      return searchResults.map((tool: PrismaToolWithRelations) =>
        toToolDTO(tool),
      );
    });
  }

  async getToolsPaginated(offset: number, limit: number): Promise<ToolDTO[]> {
    this.validateRequired({ offset, limit });

    const cacheKey = `toolsPaginated:${offset}:${limit}`;
    return this.getCached(cacheKey, async () => {
      const tools = await this.prisma.tool.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
        skip: offset,
        take: limit,
        include: {
          tags: { include: { tag: true } },
          toolUsageStats: true,
        },
      });
      return tools.map((tool: PrismaToolWithRelations) => toToolDTO(tool));
    });
  }

  async getToolsByTagPaginated(
    tagSlug: string,
    offset: number,
    limit: number,
  ): Promise<ToolDTO[]> {
    this.validateRequired({ tagSlug, offset, limit });

    const cacheKey = `toolsByTagPaginated:${tagSlug}:${offset}:${limit}`;
    return this.getCached(cacheKey, async () => {
      const tools = await this.prisma.tool.findMany({
        where: {
          isActive: true,
          tags: {
            some: {
              tag: { slug: tagSlug },
            },
          },
        },
        orderBy: { displayOrder: "asc" },
        skip: offset,
        take: limit,
        include: {
          tags: { include: { tag: true } },
          toolUsageStats: true,
        },
      });
      return tools.map((tool: PrismaToolWithRelations) => toToolDTO(tool));
    });
  }

  async getAllToolsPaginated(
    options: PaginationOptions,
  ): Promise<PaginatedResult<ToolDTO>> {
    const {
      limit,
      offset,
      sortBy = "displayOrder",
      sortOrder = "asc",
    } = options;

    const cacheKey = `toolsPaginatedAdvanced:${limit}:${offset}:${sortBy}:${sortOrder}`;
    return this.getCached(cacheKey, async () => {
      const where = { isActive: true };

      // Build the orderBy clause based on sortBy
      let orderBy: Prisma.ToolOrderByWithRelationInput;
      if (sortBy === "usageCount") {
        // Special handling for usage count sorting using raw query
        const orderedToolIdResults: Array<{ id: string }> = await this.prisma
          .$queryRaw`
                    SELECT t.id
                    FROM "Tool" t
                    LEFT JOIN "ToolUsageStats" tus ON t.id = tus."toolId"
                    WHERE t."isActive" = ${true}
                    ORDER BY COALESCE(tus."usageCount", 0) ${sortOrder === "desc" ? "DESC" : "ASC"}
                    ${limit ? `LIMIT ${limit}` : ""}
                    ${offset ? `OFFSET ${offset}` : ""}
                `;

        const totalCount = await this.prisma.tool.count({ where });

        if (orderedToolIdResults.length === 0) {
          return { tools: [], total: totalCount };
        }

        const orderedToolIds = orderedToolIdResults.map((r) => r.id);

        const tools = await this.prisma.tool.findMany({
          where: {
            id: { in: orderedToolIds },
          },
          include: {
            tags: { include: { tag: true } },
            toolUsageStats: true,
          },
        });

        // Re-sort to match the order from the raw query
        const toolsMap = new Map(
          tools.map((tool: PrismaToolWithRelations) => [tool.id, tool]),
        );
        const sortedTools = orderedToolIds
          .map((id) => toolsMap.get(id))
          .filter(Boolean) as PrismaToolWithRelations[];

        return {
          tools: sortedTools.map((tool: PrismaToolWithRelations) =>
            toToolDTO(tool),
          ),
          total: totalCount,
        };
      } else {
        // Standard sorting for other fields
        orderBy = {
          [sortBy]: sortOrder,
        } as Prisma.ToolOrderByWithRelationInput;
      }

      // Get total count for pagination
      const total = await this.prisma.tool.count({ where });

      // Get the paginated tools
      const queryOptions: Prisma.ToolFindManyArgs = {
        where,
        orderBy,
        include: {
          tags: { include: { tag: true } },
          toolUsageStats: true,
        },
      };

      if (limit) queryOptions.take = limit;
      if (offset) queryOptions.skip = offset;

      const tools = await this.prisma.tool.findMany(queryOptions);

      return {
        tools: tools.map((tool) =>
          toToolDTO(tool as unknown as PrismaToolWithRelations),
        ),
        total,
      };
    });
  }
}
