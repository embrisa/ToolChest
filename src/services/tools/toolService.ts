/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { BaseService } from "../core/baseService";
import { ToolDTO, TagDTO, toToolDTO, toTagDTO } from "@/types/tools/tool";
import {
  PrismaToolWithRelations,
  PrismaTagWithToolCount,
} from "@/types/tools/tool";
import { Prisma } from "@prisma/client";
import { DatabaseTranslationService } from "../core/databaseTranslationService";

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
  getAllTools(locale?: string): Promise<ToolDTO[]>;
  getToolBySlug(slug: string, locale?: string): Promise<ToolDTO | null>;
  getToolsByTag(tagSlug: string, locale?: string): Promise<ToolDTO[]>;
  getAllTags(locale?: string): Promise<TagDTO[]>;
  getTagBySlug(slug: string, locale?: string): Promise<TagDTO | null>;
  recordToolUsage(toolSlug: string): Promise<void>;
  recordUniqueDailyUsage(
    toolSlug: string,
    ipAddress: string,
  ): Promise<{ counted: boolean }>;
  getPopularTools(limit: number, locale?: string): Promise<ToolDTO[]>;
  searchTools(query: string, locale?: string): Promise<ToolDTO[]>;
  getToolsPaginated(
    offset: number,
    limit: number,
    locale?: string,
  ): Promise<ToolDTO[]>;
  getToolsByTagPaginated(
    tagSlug: string,
    offset: number,
    limit: number,
    locale?: string,
  ): Promise<ToolDTO[]>;
  getAllToolsPaginated(
    options: PaginationOptions,
    locale?: string,
  ): Promise<PaginatedResult<ToolDTO>>;
}

export class ToolService extends BaseService implements IToolService {
  async getAllTools(locale: string = "en"): Promise<ToolDTO[]> {
    const cacheKey = `allTools:${locale}`;
    return this.getCached(cacheKey, async () => {
      const rawTools = await this.prisma.tool.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
        include: {
          tags: { include: { tag: true } },
          toolUsageStats: true,
        },
      });

      const translatedTools = await DatabaseTranslationService.translateTools(
        rawTools,
        locale,
      );

      const toolsWithTranslatedTags = await Promise.all(
        translatedTools.map(async (tool) => {
          const translatedTags = await DatabaseTranslationService.translateTags(
            tool.tags.map((tt) => tt.tag),
            locale,
          );
          return {
            ...tool,
            tags: tool.tags.map((tt, index) => ({
              ...tt,
              tag: translatedTags[index],
            })),
          };
        }),
      );

      return toolsWithTranslatedTags.map((tool) =>
        toToolDTO(tool as PrismaToolWithRelations),
      );
    });
  }

  async getToolBySlug(
    slug: string,
    locale: string = "en",
  ): Promise<ToolDTO | null> {
    this.validateRequired({ slug });

    const cacheKey = `toolBySlug:${slug}:${locale}`;
    return this.getCached(cacheKey, async () => {
      const rawTool = await this.prisma.tool.findUnique({
        where: { slug, isActive: true },
        include: {
          tags: { include: { tag: true } },
          toolUsageStats: true,
        },
      });

      if (!rawTool) {
        return null;
      }

      const translatedTool = await DatabaseTranslationService.translateTool(
        rawTool,
        locale,
      );

      const translatedTags = await DatabaseTranslationService.translateTags(
        rawTool.tags.map((tt) => tt.tag),
        locale,
      );

      const toolWithTranslatedTags = {
        ...translatedTool,
        tags: rawTool.tags.map((tt, index) => ({
          ...tt,
          tag: translatedTags[index],
        })),
      };

      return toToolDTO(toolWithTranslatedTags as PrismaToolWithRelations);
    });
  }

  async getToolsByTag(
    tagSlug: string,
    locale: string = "en",
  ): Promise<ToolDTO[]> {
    this.validateRequired({ tagSlug });

    const cacheKey = `toolsByTag:${tagSlug}:${locale}`;
    return this.getCached(cacheKey, async () => {
      const rawTools = await this.prisma.tool.findMany({
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

      const translatedTools = await DatabaseTranslationService.translateTools(
        rawTools,
        locale,
      );

      const toolsWithTranslatedTags = await Promise.all(
        translatedTools.map(async (tool) => {
          const translatedTags = await DatabaseTranslationService.translateTags(
            tool.tags.map((tt) => tt.tag),
            locale,
          );
          return {
            ...tool,
            tags: tool.tags.map((tt, index) => ({
              ...tt,
              tag: translatedTags[index],
            })),
          };
        }),
      );

      return toolsWithTranslatedTags.map((tool: PrismaToolWithRelations) =>
        toToolDTO(tool),
      );
    });
  }

  async getAllTags(locale: string = "en"): Promise<TagDTO[]> {
    const cacheKey = `allTags:${locale}`;
    return this.getCached(cacheKey, async () => {
      const rawTags = await this.prisma.tag.findMany({
        include: {
          _count: {
            select: {
              tools: { where: { tool: { isActive: true } } },
            },
          },
        },
        orderBy: {
          displayOrder: "asc",
        },
      });

      const translatedTags = await DatabaseTranslationService.translateTags(
        rawTags,
        locale,
      );

      return translatedTags.map((tag) =>
        toTagDTO(tag as PrismaTagWithToolCount),
      );
    });
  }

  async getTagBySlug(
    slug: string,
    locale: string = "en",
  ): Promise<TagDTO | null> {
    this.validateRequired({ slug });

    const cacheKey = `tagBySlug:${slug}:${locale}`;
    return this.getCached(cacheKey, async () => {
      const rawTag = await this.prisma.tag.findUnique({
        where: { slug },
        include: {
          _count: {
            select: {
              tools: { where: { tool: { isActive: true } } },
            },
          },
        },
      });

      if (!rawTag) {
        return null;
      }

      const translatedTag = await DatabaseTranslationService.translateTag(
        rawTag,
        locale,
      );

      return toTagDTO(translatedTag as PrismaTagWithToolCount);
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

  /**
   * Increment usage only once per unique IP per UTC day.
   * Uses a salted SHA-256 hash of the IP for privacy and stores a small dedup record.
   */
  async recordUniqueDailyUsage(
    toolSlug: string,
    ipAddress: string,
  ): Promise<{ counted: boolean }> {
    this.validateRequired({ toolSlug, ipAddress });

    const tool = await this.prisma.tool.findUnique({
      where: { slug: toolSlug, isActive: true },
      select: { id: true },
    });

    if (!tool) {
      console.warn(
        `Attempted to record usage for non-existent or inactive tool: ${toolSlug}`,
      );
      return { counted: false };
    }

    // Compute start of current UTC day
    const now = new Date();
    const visitDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    // Salted hash of IP for privacy (fallback to ADMIN_SECRET_TOKEN to avoid adding a hard requirement)
    const salt =
      process.env.USAGE_IP_HASH_SALT || process.env.ADMIN_SECRET_TOKEN || "default-salt";

    // Lazy import crypto to avoid type issues; file has ts-nocheck
    const crypto = await import("crypto");
    const ipHash = crypto
      .createHmac("sha256", salt)
      .update(ipAddress)
      .digest("hex");

    // Try to create a unique visit; if it already exists, skip increment
    try {
      await this.prisma.toolDailyVisit.create({
        data: {
          toolId: tool.id,
          visitDate,
          ipHash,
        },
      });
    } catch (e: any) {
      // Prisma unique constraint violation -> already counted today for this IP
      if (e?.code === "P2002") {
        return { counted: false };
      }
      throw e;
    }

    // Count this unique visit
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

    // Opportunistic cleanup: delete dedup rows older than 7 days (non-blocking)
    this.prisma.toolDailyVisit
      .deleteMany({
        where: {
          visitDate: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      })
      .catch(() => undefined);

    return { counted: true };
  }

  async getPopularTools(
    limit: number,
    locale: string = "en",
  ): Promise<ToolDTO[]> {
    this.validateRequired({ limit });

    const cacheKey = `popularTools:${limit}:${locale}`;
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

        const translatedTools = await DatabaseTranslationService.translateTools(
          fallbackTools,
          locale,
        );

        return translatedTools.map((tool: PrismaToolWithRelations) =>
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

      const translatedTools = await DatabaseTranslationService.translateTools(
        sortedPopularTools,
        locale,
      );

      const toolsWithTranslatedTags = await Promise.all(
        translatedTools.map(async (tool) => {
          const translatedTags = await DatabaseTranslationService.translateTags(
            tool.tags.map((tt) => tt.tag),
            locale,
          );
          return {
            ...tool,
            tags: tool.tags.map((tt, index) => ({
              ...tt,
              tag: translatedTags[index],
            })),
          };
        }),
      );

      return toolsWithTranslatedTags.map((tool: PrismaToolWithRelations) =>
        toToolDTO(tool),
      );
    });
  }

  async searchTools(query: string, locale: string = "en"): Promise<ToolDTO[]> {
    if (query === "") {
      return this.getAllTools(locale);
    }

    this.validateRequired({ query });

    const cacheKey = `searchTools:${query}:${locale}`;
    return this.getCached(cacheKey, async () => {
      const lowercasedQuery = query.toLowerCase();
      const rawTools = await this.prisma.tool.findMany({
        where: {
          isActive: true,
          OR: [
            { nameKey: { contains: lowercasedQuery } },
            { descriptionKey: { contains: lowercasedQuery } },
            {
              tags: {
                some: {
                  tag: {
                    nameKey: { contains: lowercasedQuery },
                  },
                },
              },
            },
          ],
        },
        include: {
          tags: { include: { tag: true } },
          toolUsageStats: true,
        },
      });

      const translatedTools = await DatabaseTranslationService.translateTools(
        rawTools,
        locale,
      );

      const toolsWithTranslatedTags = await Promise.all(
        translatedTools.map(async (tool) => {
          const translatedTags = await DatabaseTranslationService.translateTags(
            tool.tags.map((tt) => tt.tag),
            locale,
          );
          return {
            ...tool,
            tags: tool.tags.map((tt, index) => ({
              ...tt,
              tag: translatedTags[index],
            })),
          };
        }),
      );

      return toolsWithTranslatedTags.map((tool: PrismaToolWithRelations) =>
        toToolDTO(tool),
      );
    });
  }

  async getToolsPaginated(
    offset: number,
    limit: number,
    locale: string = "en",
  ): Promise<ToolDTO[]> {
    this.validateRequired({ offset, limit });

    const cacheKey = `toolsPaginated:${offset}:${limit}:${locale}`;
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

      const translatedTools = await DatabaseTranslationService.translateTools(
        tools,
        locale,
      );

      const toolsWithTranslatedTags = await Promise.all(
        translatedTools.map(async (tool) => {
          const translatedTags = await DatabaseTranslationService.translateTags(
            tool.tags.map((tt) => tt.tag),
            locale,
          );
          return {
            ...tool,
            tags: tool.tags.map((tt, index) => ({
              ...tt,
              tag: translatedTags[index],
            })),
          };
        }),
      );

      return toolsWithTranslatedTags.map((tool: PrismaToolWithRelations) =>
        toToolDTO(tool),
      );
    });
  }

  async getToolsByTagPaginated(
    tagSlug: string,
    offset: number,
    limit: number,
    locale: string = "en",
  ): Promise<ToolDTO[]> {
    this.validateRequired({ tagSlug, offset, limit });

    const cacheKey = `toolsByTagPaginated:${tagSlug}:${offset}:${limit}:${locale}`;
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

      const translatedTools = await DatabaseTranslationService.translateTools(
        tools,
        locale,
      );

      const toolsWithTranslatedTags = await Promise.all(
        translatedTools.map(async (tool) => {
          const translatedTags = await DatabaseTranslationService.translateTags(
            tool.tags.map((tt) => tt.tag),
            locale,
          );
          return {
            ...tool,
            tags: tool.tags.map((tt, index) => ({
              ...tt,
              tag: translatedTags[index],
            })),
          };
        }),
      );

      return toolsWithTranslatedTags.map((tool: PrismaToolWithRelations) =>
        toToolDTO(tool),
      );
    });
  }

  async getAllToolsPaginated(
    options: PaginationOptions,
    locale: string = "en",
  ): Promise<PaginatedResult<ToolDTO>> {
    const {
      limit,
      offset,
      sortBy = "displayOrder",
      sortOrder = "asc",
    } = options;

    const cacheKey = `toolsPaginatedAdvanced:${limit}:${offset}:${sortBy}:${sortOrder}:${locale}`;
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

        const translatedTools = await DatabaseTranslationService.translateTools(
          sortedTools,
          locale,
        );

        const toolsWithTranslatedTags = await Promise.all(
          translatedTools.map(async (tool) => {
            const translatedTags =
              await DatabaseTranslationService.translateTags(
                tool.tags.map((tt) => tt.tag),
                locale,
              );
            return {
              ...tool,
              tags: tool.tags.map((tt, index) => ({
                ...tt,
                tag: translatedTags[index],
              })),
            };
          }),
        );

        return {
          tools: toolsWithTranslatedTags.map((tool: PrismaToolWithRelations) =>
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

      const translatedTools = await DatabaseTranslationService.translateTools(
        tools,
        locale,
      );

      const toolsWithTranslatedTags = await Promise.all(
        translatedTools.map(async (tool) => {
          const translatedTags = await DatabaseTranslationService.translateTags(
            tool.tags.map((tt) => tt.tag),
            locale,
          );
          return {
            ...tool,
            tags: tool.tags.map((tt, index) => ({
              ...tt,
              tag: translatedTags[index],
            })),
          };
        }),
      );

      return {
        tools: toolsWithTranslatedTags.map((tool) =>
          toToolDTO(tool as unknown as PrismaToolWithRelations),
        ),
        total,
      };
    });
  }
}
