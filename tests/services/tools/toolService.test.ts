/**
 * @jest-environment node
 */
import { PrismaClient } from "@prisma/client";
import { ToolService } from "@/services/tools/toolService";

// Mock DatabaseTranslationService first
jest.mock("@/services/core/databaseTranslationService", () => ({
  DatabaseTranslationService: {
    translateTool: jest.fn(),
    translateTools: jest.fn(),
    translateTag: jest.fn(),
    translateTags: jest.fn(),
  },
}));

const prisma = new PrismaClient({
  datasources: { db: { url: "file:./test.db" } },
});
const service = new ToolService(prisma);

afterAll(async () => {
  await prisma.$disconnect();
});

describe("ToolService integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Get the mocked service
    const {
      DatabaseTranslationService,
    } = require("@/services/core/databaseTranslationService");

    // Setup mock return values that return the input data with mock translations
    DatabaseTranslationService.translateTools.mockImplementation(
      (tools: any[]) =>
        Promise.resolve(
          tools.map((tool: any) => ({
            ...tool,
            name: `Mock ${tool.nameKey}`,
            description: tool.descriptionKey
              ? `Mock ${tool.descriptionKey}`
              : null,
          })),
        ),
    );

    DatabaseTranslationService.translateTool.mockImplementation((tool: any) =>
      Promise.resolve(
        tool
          ? {
              ...tool,
              name: `Mock ${tool.nameKey}`,
              description: tool.descriptionKey
                ? `Mock ${tool.descriptionKey}`
                : null,
            }
          : null,
      ),
    );

    DatabaseTranslationService.translateTags.mockImplementation((tags: any[]) =>
      Promise.resolve(
        tags.map((tag: any) => ({
          ...tag,
          name: `Mock ${tag.nameKey}`,
          description: tag.descriptionKey ? `Mock ${tag.descriptionKey}` : null,
        })),
      ),
    );

    DatabaseTranslationService.translateTag.mockImplementation((tag: any) =>
      Promise.resolve(
        tag
          ? {
              ...tag,
              name: `Mock ${tag.nameKey}`,
              description: tag.descriptionKey
                ? `Mock ${tag.descriptionKey}`
                : null,
            }
          : null,
      ),
    );
  });

  test("getAllTools returns seeded tools with default locale", async () => {
    const tools = await service.getAllTools();
    expect(tools.length).toBeGreaterThanOrEqual(4);
    const {
      DatabaseTranslationService,
    } = require("@/services/core/databaseTranslationService");
    expect(DatabaseTranslationService.translateTools).toHaveBeenCalledWith(
      expect.any(Array),
      "en",
    );
  });

  test("getAllTools supports locale parameter", async () => {
    const tools = await service.getAllTools("es");
    expect(tools.length).toBeGreaterThanOrEqual(4);
    const {
      DatabaseTranslationService,
    } = require("@/services/core/databaseTranslationService");
    expect(DatabaseTranslationService.translateTools).toHaveBeenCalledWith(
      expect.any(Array),
      "es",
    );
  });

  test("getToolBySlug returns a tool with default locale", async () => {
    const tool = await service.getToolBySlug("base64");
    expect(tool?.slug).toBe("base64");
    const {
      DatabaseTranslationService,
    } = require("@/services/core/databaseTranslationService");
    expect(DatabaseTranslationService.translateTool).toHaveBeenCalledWith(
      expect.any(Object),
      "en",
    );
  });

  test("getToolBySlug supports locale parameter", async () => {
    const tool = await service.getToolBySlug("base64", "fr");
    expect(tool?.slug).toBe("base64");
    const {
      DatabaseTranslationService,
    } = require("@/services/core/databaseTranslationService");
    expect(DatabaseTranslationService.translateTool).toHaveBeenCalledWith(
      expect.any(Object),
      "fr",
    );
  });

  test("getToolsByTag returns tools for tag with locale support", async () => {
    const tools = await service.getToolsByTag("development", "es");
    expect(tools.length).toBeGreaterThanOrEqual(4);
    const {
      DatabaseTranslationService,
    } = require("@/services/core/databaseTranslationService");
    expect(DatabaseTranslationService.translateTools).toHaveBeenCalledWith(
      expect.any(Array),
      "es",
    );
  });

  test("getAllTags returns seeded tags with locale support", async () => {
    const tags = await service.getAllTags("fr");
    expect(tags.length).toBeGreaterThanOrEqual(4);
    const {
      DatabaseTranslationService,
    } = require("@/services/core/databaseTranslationService");
    expect(DatabaseTranslationService.translateTags).toHaveBeenCalledWith(
      expect.any(Array),
      "fr",
    );
  });

  test("getTagBySlug returns tag with locale support", async () => {
    const tag = await service.getTagBySlug("development", "es");
    expect(tag?.slug).toBe("development");
    const {
      DatabaseTranslationService,
    } = require("@/services/core/databaseTranslationService");
    expect(DatabaseTranslationService.translateTag).toHaveBeenCalledWith(
      expect.any(Object),
      "es",
    );
  });

  test("pagination works for tools with locale support", async () => {
    const tools = await service.getToolsPaginated(0, 2, "fr");
    expect(tools).toHaveLength(2);
    const {
      DatabaseTranslationService,
    } = require("@/services/core/databaseTranslationService");
    expect(DatabaseTranslationService.translateTools).toHaveBeenCalledWith(
      expect.any(Array),
      "fr",
    );
  });

  test("searchTools supports locale parameter", async () => {
    const tools = await service.searchTools("base64", "es");
    const {
      DatabaseTranslationService,
    } = require("@/services/core/databaseTranslationService");
    expect(DatabaseTranslationService.translateTools).toHaveBeenCalledWith(
      expect.any(Array),
      "es",
    );
  });

  test("getPopularTools supports locale parameter", async () => {
    const tools = await service.getPopularTools(5, "fr");
    const {
      DatabaseTranslationService,
    } = require("@/services/core/databaseTranslationService");
    expect(DatabaseTranslationService.translateTools).toHaveBeenCalledWith(
      expect.any(Array),
      "fr",
    );
  });

  test("getToolBySlug should return null for non-existent slug", async () => {
    const tool = await service.getToolBySlug("non-existent-slug");
    expect(tool).toBeNull();
  });

  test("getTagBySlug should return null for non-existent slug", async () => {
    const tag = await service.getTagBySlug("non-existent-slug");
    expect(tag).toBeNull();
  });

  describe("recordToolUsage", () => {
    test("should create a new usage stat if one does not exist", async () => {
      const toolSlug = "base64";
      const toolBefore = await prisma.tool.findUnique({
        where: { slug: toolSlug },
        include: { toolUsageStats: true },
      });
      const initialUsage = toolBefore?.toolUsageStats?.usageCount ?? 0;

      await service.recordToolUsage(toolSlug);

      const toolAfter = await prisma.tool.findUnique({
        where: { slug: toolSlug },
        include: { toolUsageStats: true },
      });
      expect(toolAfter?.toolUsageStats?.usageCount).toBe(initialUsage + 1);
    });

    test("should increment usage count for an existing stat", async () => {
      const toolSlug = "hash-generator";
      // First call to create
      await service.recordToolUsage(toolSlug);
      const toolBefore = await prisma.tool.findUnique({
        where: { slug: toolSlug },
        include: { toolUsageStats: true },
      });
      const initialUsage = toolBefore?.toolUsageStats?.usageCount ?? 0;

      // Second call to increment
      await service.recordToolUsage(toolSlug);

      const toolAfter = await prisma.tool.findUnique({
        where: { slug: toolSlug },
        include: { toolUsageStats: true },
      });
      expect(toolAfter?.toolUsageStats?.usageCount).toBe(initialUsage + 1);
    });

    test("should not throw for non-existent tool and should warn", async () => {
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
      await expect(
        service.recordToolUsage("non-existent-tool"),
      ).resolves.not.toThrow();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Attempted to record usage for non-existent or inactive tool: non-existent-tool",
      );
      consoleWarnSpy.mockRestore();
    });

    test("should invalidate relevant caches", async () => {
      const invalidateCacheSpy = jest.spyOn(service as any, "invalidateCache");
      const toolSlug = "favicon-generator";
      await service.recordToolUsage(toolSlug);
      expect(invalidateCacheSpy).toHaveBeenCalledWith("allTools");
      expect(invalidateCacheSpy).toHaveBeenCalledWith(`toolBySlug:${toolSlug}`);
      expect(invalidateCacheSpy).toHaveBeenCalledWith("popularTools");
      invalidateCacheSpy.mockRestore();
    });
  });

  describe("recordUniqueDailyUsage", () => {
    test("should increment once per IP per day", async () => {
      const toolSlug = "base64";

      const before = await prisma.tool.findUnique({
        where: { slug: toolSlug },
        include: { toolUsageStats: true },
      });
      const startUsage = before?.toolUsageStats?.usageCount ?? 0;

      const res1 = await service.recordUniqueDailyUsage(toolSlug, "1.2.3.4");
      const res2 = await service.recordUniqueDailyUsage(toolSlug, "1.2.3.4");

      expect(res1.counted).toBe(true);
      expect(res2.counted).toBe(false);

      const after = await prisma.tool.findUnique({
        where: { slug: toolSlug },
        include: { toolUsageStats: true },
      });
      expect(after?.toolUsageStats?.usageCount).toBe(startUsage + 1);
    });

    test("should count different IPs separately on same day", async () => {
      const toolSlug = "hash-generator";

      const before = await prisma.tool.findUnique({
        where: { slug: toolSlug },
        include: { toolUsageStats: true },
      });
      const startUsage = before?.toolUsageStats?.usageCount ?? 0;

      const a = await service.recordUniqueDailyUsage(toolSlug, "5.6.7.8");
      const b = await service.recordUniqueDailyUsage(toolSlug, "9.10.11.12");

      expect(a.counted).toBe(true);
      expect(b.counted).toBe(true);

      const after = await prisma.tool.findUnique({
        where: { slug: toolSlug },
        include: { toolUsageStats: true },
      });
      expect(after?.toolUsageStats?.usageCount).toBe(startUsage + 2);
    });
  });

  describe("getPopularTools", () => {
    beforeAll(async () => {
      // Seed popular tools
      await service.recordToolUsage("base64");
      await service.recordToolUsage("base64");
      await service.recordToolUsage("base64");
      await service.recordToolUsage("hash-generator");
      await service.recordToolUsage("hash-generator");
      await service.recordToolUsage("favicon-generator");
    });

    test("should return tools ordered by usage count", async () => {
      const popularTools = await service.getPopularTools(3);
      expect(popularTools.map((t) => t.slug)).toEqual([
        "base64",
        "hash-generator",
        "favicon-generator",
      ]);
    });

    test("should respect the limit parameter", async () => {
      const popularTools = await service.getPopularTools(2);
      expect(popularTools).toHaveLength(2);
      expect(popularTools.map((t) => t.slug)).toEqual([
        "base64",
        "hash-generator",
      ]);
    });

    test("should call translation service with correct locale", async () => {
      await service.getPopularTools(3, "es");
      const {
        DatabaseTranslationService,
      } = require("@/services/core/databaseTranslationService");
      expect(DatabaseTranslationService.translateTools).toHaveBeenCalledWith(
        expect.any(Array),
        "es",
      );
    });
  });

  describe("searchTools", () => {
    test("should find tools by a substring of its nameKey", async () => {
      const tools = await service.searchTools("base64");
      expect(tools.some((t) => t.slug === "base64")).toBe(true);
    });

    test("should find tools by a substring of its descriptionKey", async () => {
      const tools = await service.searchTools("hash-generator.d");
      expect(tools.some((t) => t.slug === "hash-generator")).toBe(true);
    });

    test("should find tools by a substring of its tag's nameKey", async () => {
      const tools = await service.searchTools("encoding");
      // 'base64' tool is seeded with 'encoding' tag
      expect(tools.some((t) => t.slug === "base64")).toBe(true);
    });

    test("should return empty array for no matches", async () => {
      const tools = await service.searchTools("nonexistent-query-xyz");
      expect(tools).toHaveLength(0);
    });

    test("should return all tools for an empty query", async () => {
      const allTools = await service.getAllTools();
      const searchResults = await service.searchTools("");
      expect(searchResults.length).toEqual(allTools.length);
    });

    test("should call translation service with correct locale", async () => {
      await service.searchTools("query", "fr");
      const {
        DatabaseTranslationService,
      } = require("@/services/core/databaseTranslationService");
      expect(DatabaseTranslationService.translateTools).toHaveBeenCalledWith(
        expect.any(Array),
        "fr",
      );
    });
  });
});
