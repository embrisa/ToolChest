import { PrismaClient, Prisma, Tool, Tag, ToolTag, ToolUsageStats } from '@prisma/client';
import NodeCache from 'node-cache';
import { ToolServiceImpl, ToolService } from '../../src/services/toolService';
import { ToolDTO, PrismaToolWithRelations, toToolDTO } from '../../src/dto/tool.dto';
import { TagDTO, PrismaTagWithToolCount, toTagDTO } from '../../src/dto/tag.dto';

// Mock PrismaClient
const mockPrismaClient = {
    tool: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
    },
    tag: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
    },
    toolUsageStats: {
        upsert: jest.fn(),
    },
} as unknown as PrismaClient;

// Mock NodeCache
const mockCacheGet = jest.fn();
const mockCacheSet = jest.fn();
const mockCacheFlushAll = jest.fn();

jest.mock('node-cache', () => {
    return jest.fn().mockImplementation(() => ({
        get: mockCacheGet,
        set: mockCacheSet,
        flushAll: mockCacheFlushAll,
    }));
});

describe('ToolService', () => {
    let toolService: ToolService;

    beforeEach(() => {
        jest.clearAllMocks();
        mockCacheGet.mockReset();
        mockCacheSet.mockReset();
        mockCacheFlushAll.mockReset();
        toolService = new ToolServiceImpl(mockPrismaClient);
    });

    describe('getAllTools', () => {
        const mockPrismaTags: Omit<Tag, 'updatedAt'>[] = [
            { id: 't1', name: 'Tag 1', slug: 'tag-1', description: 'Tag 1 desc', color: 'blue', createdAt: new Date() },
        ];

        const mockToolTags: (ToolTag & { tag: Tag })[] = [
            { toolId: '1', tagId: 't1', assignedAt: new Date(), tag: mockPrismaTags[0] as Tag },
        ];

        const mockUsageStatItem: ToolUsageStats =
            { id: 's1', toolId: '1', usageCount: 10, lastUsed: new Date() };


        const mockToolData: PrismaToolWithRelations[] = [
            {
                id: '1', name: 'Tool 1', slug: 'tool-1', description: 'Description 1',
                iconClass: 'icon-1', displayOrder: 1, isActive: true,
                createdAt: new Date(), updatedAt: new Date(),
                tags: [mockToolTags[0]],
                toolUsageStats: [mockUsageStatItem], // toolUsageStats should be an array
            },
            {
                id: '2', name: 'Tool 2', slug: 'tool-2', description: 'Description 2',
                iconClass: 'icon-2', displayOrder: 2, isActive: true,
                createdAt: new Date(), updatedAt: new Date(),
                tags: [],
                toolUsageStats: [], // Empty array if no stats, Prisma type expects array or null for relation
            },
        ];
        // Casting to `any` for `toToolDTO` mapping in tests as the mock structure is complex 
        // and primarily for testing service logic, not DTO mapping perfection.
        // The key is that tool.tags[...].tag within mockToolData will effectively be PrismaTagBasic
        const mockToolDTOs: ToolDTO[] = mockToolData.map(t => toToolDTO(t as any));

        it('should return all active tools from database if not in cache', async () => {
            mockCacheGet.mockReturnValue(undefined);
            (mockPrismaClient.tool.findMany as jest.Mock).mockResolvedValue(mockToolData);

            const result = await toolService.getAllTools();

            expect(result).toEqual(mockToolDTOs);
            expect(mockCacheGet).toHaveBeenCalledWith('allTools');
            expect(mockPrismaClient.tool.findMany).toHaveBeenCalledWith({
                where: { isActive: true },
                orderBy: { displayOrder: 'asc' },
                include: {
                    tags: { include: { tag: true } },
                    toolUsageStats: true,
                },
            });
            expect(mockCacheSet).toHaveBeenCalledWith('allTools', mockToolDTOs);
        });

        it('should return all active tools from cache if available', async () => {
            mockCacheGet.mockReturnValue(mockToolDTOs);

            const result = await toolService.getAllTools();

            expect(result).toEqual(mockToolDTOs);
            expect(mockCacheGet).toHaveBeenCalledWith('allTools');
            expect(mockPrismaClient.tool.findMany).not.toHaveBeenCalled();
            expect(mockCacheSet).not.toHaveBeenCalled();
        });

        it('should return empty array if no tools are found and cache is empty', async () => {
            mockCacheGet.mockReturnValue(undefined);
            (mockPrismaClient.tool.findMany as jest.Mock).mockResolvedValue([]);

            const result = await toolService.getAllTools();

            expect(result).toEqual([]);
            expect(mockCacheGet).toHaveBeenCalledWith('allTools');
            expect(mockPrismaClient.tool.findMany).toHaveBeenCalledTimes(1);
            expect(mockCacheSet).toHaveBeenCalledWith('allTools', []);
        });

        it('should handle errors from PrismaClient gracefully', async () => {
            mockCacheGet.mockReturnValue(undefined);
            const prismaError = new Error("Prisma connection failed");
            (mockPrismaClient.tool.findMany as jest.Mock).mockRejectedValue(prismaError);

            await expect(toolService.getAllTools()).rejects.toThrow(prismaError);

            expect(mockCacheGet).toHaveBeenCalledWith('allTools');
            expect(mockPrismaClient.tool.findMany).toHaveBeenCalledTimes(1);
            expect(mockCacheSet).not.toHaveBeenCalled();
        });
    });

    describe('getToolBySlug', () => {
        const slug = 'tool-1';
        const cacheKey = `toolBySlug:${slug}`;
        const mockToolDataItem: PrismaToolWithRelations = {
            id: '1', name: 'Tool 1', slug: 'tool-1', description: 'Description 1',
            iconClass: 'icon-1', displayOrder: 1, isActive: true,
            createdAt: new Date(), updatedAt: new Date(),
            tags: [{ toolId: '1', tagId: 't1', assignedAt: new Date(), tag: { id: 't1', name: 'Tag 1', slug: 'tag-1', description: 'Tag 1 desc', color: 'blue', createdAt: new Date() } as Tag }],
            toolUsageStats: [{ id: 's1', toolId: '1', usageCount: 10, lastUsed: new Date() }],
        };
        const mockToolDTOItem: ToolDTO = toToolDTO(mockToolDataItem as any);

        it('should return a tool by slug from database if not in cache', async () => {
            mockCacheGet.mockReturnValue(undefined); // Cache miss
            (mockPrismaClient.tool.findUnique as jest.Mock).mockResolvedValue(mockToolDataItem);

            const result = await toolService.getToolBySlug(slug);

            expect(result).toEqual(mockToolDTOItem);
            expect(mockCacheGet).toHaveBeenCalledWith(cacheKey);
            expect(mockPrismaClient.tool.findUnique).toHaveBeenCalledWith({
                where: { slug, isActive: true },
                include: {
                    tags: { include: { tag: true } },
                    toolUsageStats: true,
                },
            });
            expect(mockCacheSet).toHaveBeenCalledWith(cacheKey, mockToolDTOItem);
        });

        it('should return a tool by slug from cache if available', async () => {
            mockCacheGet.mockReturnValue(mockToolDTOItem); // Cache hit

            const result = await toolService.getToolBySlug(slug);

            expect(result).toEqual(mockToolDTOItem);
            expect(mockCacheGet).toHaveBeenCalledWith(cacheKey);
            expect(mockPrismaClient.tool.findUnique).not.toHaveBeenCalled();
            expect(mockCacheSet).not.toHaveBeenCalled();
        });

        it('should return null if tool is not found and cache is empty', async () => {
            mockCacheGet.mockReturnValue(undefined); // Cache miss
            (mockPrismaClient.tool.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await toolService.getToolBySlug('non-existent-slug');

            expect(result).toBeNull();
            expect(mockCacheGet).toHaveBeenCalledWith('toolBySlug:non-existent-slug');
            expect(mockPrismaClient.tool.findUnique).toHaveBeenCalledTimes(1);
            expect(mockCacheSet).toHaveBeenCalledWith('toolBySlug:non-existent-slug', null);
        });

        it('should return null from cache if tool was previously not found', async () => {
            mockCacheGet.mockReturnValue(null); // Cache hit for not found

            const result = await toolService.getToolBySlug(slug);

            expect(result).toBeNull();
            expect(mockCacheGet).toHaveBeenCalledWith(cacheKey);
            expect(mockPrismaClient.tool.findUnique).not.toHaveBeenCalled();
            expect(mockCacheSet).not.toHaveBeenCalled();
        });

        it('should handle errors from PrismaClient gracefully', async () => {
            mockCacheGet.mockReturnValue(undefined);
            const prismaError = new Error("Prisma connection failed");
            (mockPrismaClient.tool.findUnique as jest.Mock).mockRejectedValue(prismaError);

            await expect(toolService.getToolBySlug(slug)).rejects.toThrow(prismaError);

            expect(mockCacheGet).toHaveBeenCalledWith(cacheKey);
            expect(mockPrismaClient.tool.findUnique).toHaveBeenCalledTimes(1);
            expect(mockCacheSet).not.toHaveBeenCalled();
        });
    });

    describe('getToolsByTag', () => {
        const tagSlug = 'tag-1';
        const cacheKey = `toolsByTag:${tagSlug}`;
        // Re-use mockToolData from getAllTools for consistency, assuming they could be returned by this call
        const mockToolDataFromDb: PrismaToolWithRelations[] = [
            {
                id: '1', name: 'Tool 1', slug: 'tool-1', description: 'Description 1',
                iconClass: 'icon-1', displayOrder: 1, isActive: true, createdAt: new Date(), updatedAt: new Date(),
                tags: [{ toolId: '1', tagId: 't1', assignedAt: new Date(), tag: { id: 't1', name: 'Tag 1', slug: 'tag-1', description: 'Tag 1 desc', color: 'blue', createdAt: new Date() } as Tag }],
                toolUsageStats: [{ id: 's1', toolId: '1', usageCount: 10, lastUsed: new Date() }],
            }
        ];
        const mockToolDTOsFromDb: ToolDTO[] = mockToolDataFromDb.map(t => toToolDTO(t as any));

        it('should return tools by tag slug from database if not in cache', async () => {
            mockCacheGet.mockReturnValue(undefined); // Cache miss
            (mockPrismaClient.tool.findMany as jest.Mock).mockResolvedValue(mockToolDataFromDb);

            const result = await toolService.getToolsByTag(tagSlug);

            expect(result).toEqual(mockToolDTOsFromDb);
            expect(mockCacheGet).toHaveBeenCalledWith(cacheKey);
            expect(mockPrismaClient.tool.findMany).toHaveBeenCalledWith({
                where: {
                    isActive: true,
                    tags: { some: { tag: { slug: tagSlug } } },
                },
                orderBy: { displayOrder: 'asc' },
                include: {
                    tags: { include: { tag: true } },
                    toolUsageStats: true,
                },
            });
            expect(mockCacheSet).toHaveBeenCalledWith(cacheKey, mockToolDTOsFromDb);
        });

        it('should return tools by tag slug from cache if available', async () => {
            mockCacheGet.mockReturnValue(mockToolDTOsFromDb); // Cache hit

            const result = await toolService.getToolsByTag(tagSlug);

            expect(result).toEqual(mockToolDTOsFromDb);
            expect(mockCacheGet).toHaveBeenCalledWith(cacheKey);
            expect(mockPrismaClient.tool.findMany).not.toHaveBeenCalled();
            expect(mockCacheSet).not.toHaveBeenCalled();
        });

        it('should return empty array if no tools are found for the tag and cache is empty', async () => {
            mockCacheGet.mockReturnValue(undefined); // Cache miss
            (mockPrismaClient.tool.findMany as jest.Mock).mockResolvedValue([]);

            const result = await toolService.getToolsByTag('non-existent-tag-slug');

            expect(result).toEqual([]);
            expect(mockCacheGet).toHaveBeenCalledWith('toolsByTag:non-existent-tag-slug');
            expect(mockPrismaClient.tool.findMany).toHaveBeenCalledTimes(1);
            expect(mockCacheSet).toHaveBeenCalledWith('toolsByTag:non-existent-tag-slug', []);
        });

        it('should handle errors from PrismaClient gracefully', async () => {
            mockCacheGet.mockReturnValue(undefined);
            const prismaError = new Error("Prisma connection failed");
            (mockPrismaClient.tool.findMany as jest.Mock).mockRejectedValue(prismaError);

            await expect(toolService.getToolsByTag(tagSlug)).rejects.toThrow(prismaError);

            expect(mockCacheGet).toHaveBeenCalledWith(cacheKey);
            expect(mockPrismaClient.tool.findMany).toHaveBeenCalledTimes(1);
            expect(mockCacheSet).not.toHaveBeenCalled();
        });
    });

    describe('getAllTags', () => {
        const cacheKey = 'allTags';
        // PrismaTagWithToolCount does not include updatedAt by default
        const mockTagDataFromDb: Omit<PrismaTagWithToolCount, 'updatedAt'>[] = [
            {
                id: 't1', name: 'Tag 1', slug: 'tag-1', description: 'Tag 1 desc', color: 'blue',
                createdAt: new Date(),
                _count: { tools: 5 }
            },
            {
                id: 't2', name: 'Tag 2', slug: 'tag-2', description: 'Tag 2 desc', color: 'green',
                createdAt: new Date(),
                _count: { tools: 3 }
            },
        ];
        const mockTagDTOs: TagDTO[] = mockTagDataFromDb.map(t => toTagDTO(t as PrismaTagWithToolCount));

        it('should return all tags with tool counts from database if not in cache', async () => {
            mockCacheGet.mockReturnValue(undefined); // Cache miss
            (mockPrismaClient.tag.findMany as jest.Mock).mockResolvedValue(mockTagDataFromDb);

            const result = await toolService.getAllTags();

            expect(result).toEqual(mockTagDTOs);
            expect(mockCacheGet).toHaveBeenCalledWith(cacheKey);
            expect(mockPrismaClient.tag.findMany).toHaveBeenCalledWith({
                include: {
                    _count: { select: { tools: { where: { tool: { isActive: true } } } } },
                },
                orderBy: { name: 'asc' }
            });
            expect(mockCacheSet).toHaveBeenCalledWith(cacheKey, mockTagDTOs);
        });

        it('should return all tags from cache if available', async () => {
            mockCacheGet.mockReturnValue(mockTagDTOs); // Cache hit

            const result = await toolService.getAllTags();

            expect(result).toEqual(mockTagDTOs);
            expect(mockCacheGet).toHaveBeenCalledWith(cacheKey);
            expect(mockPrismaClient.tag.findMany).not.toHaveBeenCalled();
            expect(mockCacheSet).not.toHaveBeenCalled();
        });

        it('should return empty array if no tags are found and cache is empty', async () => {
            mockCacheGet.mockReturnValue(undefined);
            (mockPrismaClient.tag.findMany as jest.Mock).mockResolvedValue([]);

            const result = await toolService.getAllTags();

            expect(result).toEqual([]);
            expect(mockCacheGet).toHaveBeenCalledWith(cacheKey);
            expect(mockPrismaClient.tag.findMany).toHaveBeenCalledTimes(1);
            expect(mockCacheSet).toHaveBeenCalledWith(cacheKey, []);
        });

        it('should handle errors from PrismaClient gracefully', async () => {
            mockCacheGet.mockReturnValue(undefined);
            const prismaError = new Error("Prisma connection failed");
            (mockPrismaClient.tag.findMany as jest.Mock).mockRejectedValue(prismaError);

            await expect(toolService.getAllTags()).rejects.toThrow(prismaError);

            expect(mockCacheGet).toHaveBeenCalledWith(cacheKey);
            expect(mockPrismaClient.tag.findMany).toHaveBeenCalledTimes(1);
            expect(mockCacheSet).not.toHaveBeenCalled();
        });
    });

    describe('getTagBySlug', () => {
        const slug = 'tag-1';
        const cacheKey = `tagBySlug:${slug}`;
        // PrismaTagWithToolCount does not include updatedAt by default
        const mockTagDataItem: Omit<PrismaTagWithToolCount, 'updatedAt'> = {
            id: 't1', name: 'Tag 1', slug: 'tag-1', description: 'Tag 1 desc', color: 'blue',
            createdAt: new Date(),
            _count: { tools: 5 }
        };
        const mockTagDTOItem: TagDTO = toTagDTO(mockTagDataItem as PrismaTagWithToolCount);

        it('should return a tag by slug from database if not in cache', async () => {
            mockCacheGet.mockReturnValue(undefined); // Cache miss
            (mockPrismaClient.tag.findUnique as jest.Mock).mockResolvedValue(mockTagDataItem);

            const result = await toolService.getTagBySlug(slug);

            expect(result).toEqual(mockTagDTOItem);
            expect(mockCacheGet).toHaveBeenCalledWith(cacheKey);
            expect(mockPrismaClient.tag.findUnique).toHaveBeenCalledWith({
                where: { slug },
                include: {
                    _count: { select: { tools: { where: { tool: { isActive: true } } } } },
                },
            });
            expect(mockCacheSet).toHaveBeenCalledWith(cacheKey, mockTagDTOItem);
        });

        it('should return a tag by slug from cache if available', async () => {
            mockCacheGet.mockReturnValue(mockTagDTOItem); // Cache hit

            const result = await toolService.getTagBySlug(slug);

            expect(result).toEqual(mockTagDTOItem);
            expect(mockCacheGet).toHaveBeenCalledWith(cacheKey);
            expect(mockPrismaClient.tag.findUnique).not.toHaveBeenCalled();
            expect(mockCacheSet).not.toHaveBeenCalled();
        });

        it('should return null if tag is not found and cache is empty', async () => {
            mockCacheGet.mockReturnValue(undefined); // Cache miss
            (mockPrismaClient.tag.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await toolService.getTagBySlug('non-existent-slug');

            expect(result).toBeNull();
            expect(mockCacheGet).toHaveBeenCalledWith('tagBySlug:non-existent-slug');
            expect(mockPrismaClient.tag.findUnique).toHaveBeenCalledTimes(1);
            expect(mockCacheSet).toHaveBeenCalledWith('tagBySlug:non-existent-slug', null);
        });

        it('should return null from cache if tag was previously not found', async () => {
            mockCacheGet.mockReturnValue(null); // Cache hit for not found

            const result = await toolService.getTagBySlug(slug);

            expect(result).toBeNull();
            expect(mockCacheGet).toHaveBeenCalledWith(cacheKey);
            expect(mockPrismaClient.tag.findUnique).not.toHaveBeenCalled();
            expect(mockCacheSet).not.toHaveBeenCalled();
        });

        it('should handle errors from PrismaClient gracefully', async () => {
            mockCacheGet.mockReturnValue(undefined);
            const prismaError = new Error("Prisma connection failed");
            (mockPrismaClient.tag.findUnique as jest.Mock).mockRejectedValue(prismaError);

            await expect(toolService.getTagBySlug(slug)).rejects.toThrow(prismaError);

            expect(mockCacheGet).toHaveBeenCalledWith(cacheKey);
            expect(mockPrismaClient.tag.findUnique).toHaveBeenCalledTimes(1);
            expect(mockCacheSet).not.toHaveBeenCalled();
        });
    });

    // TODO: Add tests for getAllTags
    test.todo('should get all tags with tool counts');

    // TODO: Add tests for getTagBySlug
    test.todo('should get a tag by slug with tool count');

    describe('recordToolUsage', () => {
        const toolSlug = 'tool-1';
        const mockToolInDb = { id: '1' }; // Only id is selected in the service method

        it('should find tool by slug and upsert usage stats, then flush cache', async () => {
            (mockPrismaClient.tool.findUnique as jest.Mock).mockResolvedValue(mockToolInDb);
            (mockPrismaClient.toolUsageStats.upsert as jest.Mock).mockResolvedValue({}); // Upsert resolves to the record, mock empty for simplicity

            await toolService.recordToolUsage(toolSlug);

            expect(mockPrismaClient.tool.findUnique).toHaveBeenCalledWith({
                where: { slug: toolSlug, isActive: true },
                select: { id: true },
            });
            expect(mockPrismaClient.toolUsageStats.upsert).toHaveBeenCalledWith(expect.objectContaining({
                where: { toolId: mockToolInDb.id },
                create: expect.objectContaining({ toolId: mockToolInDb.id, usageCount: 1 }),
                update: expect.objectContaining({ usageCount: { increment: 1 } }),
            }));
            // Check that lastUsed is a Date object in create and update
            const upsertCallArg = (mockPrismaClient.toolUsageStats.upsert as jest.Mock).mock.calls[0][0];
            expect(upsertCallArg.create.lastUsed).toBeInstanceOf(Date);
            expect(upsertCallArg.update.lastUsed).toBeInstanceOf(Date);

            expect(mockCacheFlushAll).toHaveBeenCalledTimes(1);
        });

        it('should not attempt to upsert stats or flush cache if tool is not found', async () => {
            (mockPrismaClient.tool.findUnique as jest.Mock).mockResolvedValue(null);

            await toolService.recordToolUsage('non-existent-tool');

            expect(mockPrismaClient.tool.findUnique).toHaveBeenCalledWith({
                where: { slug: 'non-existent-tool', isActive: true },
                select: { id: true },
            });
            expect(mockPrismaClient.toolUsageStats.upsert).not.toHaveBeenCalled();
            expect(mockCacheFlushAll).not.toHaveBeenCalled();
        });

        it('should log a warning if tool is not found (manual check of console output or use spyOn(console, 'warn'))', async () => {
            const consoleWarnSpy = jest.spyOn(console, 'warn');
            consoleWarnSpy.mockImplementation(() => { }); // Corrected mockImplementation
            (mockPrismaClient.tool.findUnique as jest.Mock).mockResolvedValue(null);

            await toolService.recordToolUsage('warn-tool');

            expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Attempted to record usage for non-existent or inactive tool: warn-tool'));
            consoleWarnSpy.mockRestore();
        });

        it('should handle errors from prisma.tool.findUnique gracefully', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error');
            consoleErrorSpy.mockImplementation(() => { }); // Corrected mockImplementation
            const prismaError = new Error("Prisma findUnique failed");
            (mockPrismaClient.tool.findUnique as jest.Mock).mockRejectedValue(prismaError);

            await expect(toolService.recordToolUsage(toolSlug)).resolves.toBeUndefined();

            expect(mockPrismaClient.toolUsageStats.upsert).not.toHaveBeenCalled();
            expect(mockCacheFlushAll).not.toHaveBeenCalled();
            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error finding tool tool-1 for usage tracking:'), prismaError);
            consoleErrorSpy.mockRestore();
        });

        it('should handle errors from prisma.toolUsageStats.upsert gracefully and NOT flush cache', async () => {
            (mockPrismaClient.tool.findUnique as jest.Mock).mockResolvedValue(mockToolInDb);
            const upsertError = new Error("Prisma upsert failed");
            (mockPrismaClient.toolUsageStats.upsert as jest.Mock).mockRejectedValue(upsertError);

            await expect(toolService.recordToolUsage(toolSlug)).rejects.toThrow(upsertError);

            expect(mockCacheFlushAll).not.toHaveBeenCalled(); // Cache flush should not happen if upsert fails
        });
    });

    describe('getPopularTools', () => {
        const limit = 5;
        const cacheKey = `popularTools:${limit}`;

        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
        const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);

        const mockToolC_DB: PrismaToolWithRelations = {
            id: 'C', name: 'Tool C', slug: 'tool-c', description: 'Popular and recently updated',
            iconClass: 'icon-c', displayOrder: 3, isActive: true, createdAt: threeHoursAgo, updatedAt: oneHourAgo,
            tags: [],
            toolUsageStats: [{ id: 'sC', toolId: 'C', usageCount: 100, lastUsed: oneHourAgo, views: 0, averageRating: null, ratingsCount: 0 }],
        };
        const mockToolA_DB: PrismaToolWithRelations = {
            id: 'A', name: 'Tool A', slug: 'tool-a', description: 'Very popular',
            iconClass: 'icon-a', displayOrder: 1, isActive: true, createdAt: threeHoursAgo, updatedAt: twoHoursAgo,
            tags: [],
            toolUsageStats: [{ id: 'sA', toolId: 'A', usageCount: 100, lastUsed: twoHoursAgo, views: 0, averageRating: null, ratingsCount: 0 }],
        };
        const mockToolB_DB: PrismaToolWithRelations = {
            id: 'B', name: 'Tool B', slug: 'tool-b', description: 'Moderately popular, very new update',
            iconClass: 'icon-b', displayOrder: 2, isActive: true, createdAt: threeHoursAgo, updatedAt: now,
            tags: [],
            toolUsageStats: [{ id: 'sB', toolId: 'B', usageCount: 50, lastUsed: now, views: 0, averageRating: null, ratingsCount: 0 }],
        };
        const mockToolD_DB: PrismaToolWithRelations = {
            id: 'D', name: 'Tool D', slug: 'tool-d', description: 'Less popular',
            iconClass: 'icon-d', displayOrder: 4, isActive: true, createdAt: threeHoursAgo, updatedAt: oneHourAgo,
            tags: [],
            toolUsageStats: [{ id: 'sD', toolId: 'D', usageCount: 10, lastUsed: oneHourAgo, views: 0, averageRating: null, ratingsCount: 0 }],
        };
        const mockToolE_DB: PrismaToolWithRelations = {
            id: 'E', name: 'Tool E', slug: 'tool-e', description: 'No usage stats',
            iconClass: 'icon-e', displayOrder: 5, isActive: true, createdAt: threeHoursAgo, updatedAt: now,
            tags: [],
            toolUsageStats: [],
        };

        const mockUnsortedPopularToolDataFromDB: PrismaToolWithRelations[] = [
            mockToolA_DB, mockToolB_DB, mockToolC_DB, mockToolD_DB, mockToolE_DB
        ];

        const expectedSortedPopularToolDTOs: ToolDTO[] = [
            toToolDTO(mockToolC_DB as any),
            toToolDTO(mockToolA_DB as any),
            toToolDTO(mockToolB_DB as any),
            toToolDTO(mockToolD_DB as any),
            toToolDTO(mockToolE_DB as any),
        ];

        it('should return popular tools from database if not in cache, ordered by usageCount desc then updatedAt desc', async () => {
            mockCacheGet.mockReturnValue(undefined);
            (mockPrismaClient.tool.findMany as jest.Mock).mockResolvedValue(mockUnsortedPopularToolDataFromDB);

            const result = await toolService.getPopularTools(limit);

            expect(result).toEqual(expectedSortedPopularToolDTOs);
            expect(mockCacheGet).toHaveBeenCalledWith(cacheKey);
            expect(mockPrismaClient.tool.findMany).toHaveBeenCalledWith({
                where: { isActive: true },
                orderBy: [
                    { toolUsageStats: { usageCount: 'desc' } },
                    { updatedAt: 'desc' }
                ],
                take: limit,
                include: {
                    tags: { include: { tag: true } },
                    toolUsageStats: true,
                },
            });
            expect(mockCacheSet).toHaveBeenCalledWith(cacheKey, expectedSortedPopularToolDTOs);
        });

        it('should return popular tools from cache if available', async () => {
            mockCacheGet.mockReturnValue(expectedSortedPopularToolDTOs);

            const result = await toolService.getPopularTools(limit);

            expect(result).toEqual(expectedSortedPopularToolDTOs);
            expect(mockCacheGet).toHaveBeenCalledWith(cacheKey);
            expect(mockPrismaClient.tool.findMany).not.toHaveBeenCalled();
            expect(mockCacheSet).not.toHaveBeenCalled();
        });

        it('should return empty array if no popular tools are found and cache is empty', async () => {
            mockCacheGet.mockReturnValue(undefined);
            (mockPrismaClient.tool.findMany as jest.Mock).mockResolvedValue([]);

            const result = await toolService.getPopularTools(limit);

            expect(result).toEqual([]);
            expect(mockCacheGet).toHaveBeenCalledWith(cacheKey);
            expect(mockPrismaClient.tool.findMany).toHaveBeenCalledTimes(1);
            expect(mockCacheSet).toHaveBeenCalledWith(cacheKey, []);
        });

        it('should handle errors from PrismaClient gracefully', async () => {
            mockCacheGet.mockReturnValue(undefined);
            const prismaError = new Error("Prisma connection failed for popular tools");
            (mockPrismaClient.tool.findMany as jest.Mock).mockRejectedValue(prismaError);

            await expect(toolService.getPopularTools(limit)).rejects.toThrow(prismaError);

            expect(mockCacheGet).toHaveBeenCalledWith(cacheKey);
            expect(mockPrismaClient.tool.findMany).toHaveBeenCalledTimes(1);
            expect(mockCacheSet).not.toHaveBeenCalled();
        });
    });

    describe('searchTools', () => {
        const query = 'Tool';
        const cacheKey = `searchTools:${query}`;
        const mockSearchToolDataFromDb: PrismaToolWithRelations[] = [
            {
                id: '1', name: 'Tool 1 Search', slug: 'tool-1-search', description: 'Description with Tool keyword',
                iconClass: 'icon-1', displayOrder: 1, isActive: true, createdAt: new Date(), updatedAt: new Date(),
                tags: [{ toolId: '1', tagId: 't1', assignedAt: new Date(), tag: { id: 't1', name: 'Tag Relevant', slug: 'tag-relevant', description: 'Desc', color: 'blue', createdAt: new Date() } as Tag }],
                toolUsageStats: [{ id: 's1', toolId: '1', usageCount: 10, lastUsed: new Date() }],
            }
        ];
        const mockSearchToolDTOs: ToolDTO[] = mockSearchToolDataFromDb.map(t => toToolDTO(t as any));

        it('should return search results from database if not in cache', async () => {
            mockCacheGet.mockReturnValue(undefined); // Cache miss
            (mockPrismaClient.tool.findMany as jest.Mock).mockResolvedValue(mockSearchToolDataFromDb);

            const result = await toolService.searchTools(query);

            expect(result).toEqual(mockSearchToolDTOs);
            expect(mockCacheGet).toHaveBeenCalledWith(cacheKey);
            expect(mockPrismaClient.tool.findMany).toHaveBeenCalledWith({
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
            expect(mockCacheSet).toHaveBeenCalledWith(cacheKey, mockSearchToolDTOs);
        });

        it('should return search results from cache if available', async () => {
            mockCacheGet.mockReturnValue(mockSearchToolDTOs); // Cache hit

            const result = await toolService.searchTools(query);

            expect(result).toEqual(mockSearchToolDTOs);
            expect(mockCacheGet).toHaveBeenCalledWith(cacheKey);
            expect(mockPrismaClient.tool.findMany).not.toHaveBeenCalled();
            expect(mockCacheSet).not.toHaveBeenCalled();
        });

        it('should return empty array if no tools match search and cache is empty', async () => {
            mockCacheGet.mockReturnValue(undefined);
            (mockPrismaClient.tool.findMany as jest.Mock).mockResolvedValue([]);

            const result = await toolService.searchTools('non-existent-query');

            expect(result).toEqual([]);
            expect(mockCacheGet).toHaveBeenCalledWith('searchTools:non-existent-query');
            expect(mockPrismaClient.tool.findMany).toHaveBeenCalledTimes(1);
            expect(mockCacheSet).toHaveBeenCalledWith('searchTools:non-existent-query', []);
        });

        it('should handle errors from PrismaClient gracefully', async () => {
            mockCacheGet.mockReturnValue(undefined);
            const prismaError = new Error("Prisma connection failed");
            (mockPrismaClient.tool.findMany as jest.Mock).mockRejectedValue(prismaError);

            await expect(toolService.searchTools(query)).rejects.toThrow(prismaError);

            expect(mockCacheGet).toHaveBeenCalledWith(cacheKey);
            expect(mockPrismaClient.tool.findMany).toHaveBeenCalledTimes(1);
            expect(mockCacheSet).not.toHaveBeenCalled();
        });
    });

    describe('getToolsPaginated', () => {
        const offset = 0;
        const limit = 2;
        const cacheKey = `toolsPaginated:${offset}:${limit}`;
        // Mock data similar to getAllTools, but potentially a subset if limit is small
        const mockPaginatedToolDataFromDb: PrismaToolWithRelations[] = [
            {
                id: '1', name: 'Tool 1 Paginated', slug: 'tool-1-paginated', description: 'Desc 1',
                iconClass: 'icon-1', displayOrder: 1, isActive: true, createdAt: new Date(), updatedAt: new Date(),
                tags: [{ toolId: '1', tagId: 't1', assignedAt: new Date(), tag: { id: 't1', name: 'Tag 1', slug: 'tag-1', description: 'Desc', color: 'blue', createdAt: new Date() } as Tag }],
                toolUsageStats: [{ id: 's1', toolId: '1', usageCount: 10, lastUsed: new Date() }],
            },
            {
                id: '2', name: 'Tool 2 Paginated', slug: 'tool-2-paginated', description: 'Desc 2',
                iconClass: 'icon-2', displayOrder: 2, isActive: true, createdAt: new Date(Date.now() - 100000), updatedAt: new Date(), // Older than Tool 3 for createdAt sort fallback
                tags: [],
                toolUsageStats: [{ id: 's2', toolId: '2', usageCount: 5, lastUsed: new Date() }]
            }
        ];
        const mockPaginatedToolDTOs: ToolDTO[] = mockPaginatedToolDataFromDb.map(t => toToolDTO(t as any));

        it('should return paginated tools from database if not in cache', async () => {
            mockCacheGet.mockReturnValue(undefined); // Cache miss
            (mockPrismaClient.tool.findMany as jest.Mock).mockResolvedValue(mockPaginatedToolDataFromDb);

            const result = await toolService.getToolsPaginated(offset, limit);

            expect(result).toEqual(mockPaginatedToolDTOs);
            expect(mockCacheGet).toHaveBeenCalledWith(cacheKey);
            expect(mockPrismaClient.tool.findMany).toHaveBeenCalledWith({
                where: { isActive: true },
                orderBy: { displayOrder: 'asc' },
                skip: offset,
                take: limit,
                include: {
                    tags: { include: { tag: true } },
                    toolUsageStats: true,
                },
            });
            expect(mockCacheSet).toHaveBeenCalledWith(cacheKey, mockPaginatedToolDTOs);
        });

        it('should return paginated tools from cache if available', async () => {
            mockCacheGet.mockReturnValue(mockPaginatedToolDTOs); // Cache hit

            const result = await toolService.getToolsPaginated(offset, limit);

            expect(result).toEqual(mockPaginatedToolDTOs);
            expect(mockCacheGet).toHaveBeenCalledWith(cacheKey);
            expect(mockPrismaClient.tool.findMany).not.toHaveBeenCalled();
            expect(mockCacheSet).not.toHaveBeenCalled();
        });

        it('should return empty array if no tools for pagination and cache is empty', async () => {
            mockCacheGet.mockReturnValue(undefined);
            (mockPrismaClient.tool.findMany as jest.Mock).mockResolvedValue([]);
            const emptyCacheKey = `toolsPaginated:10:2`; // Different offset/limit for this test

            const result = await toolService.getToolsPaginated(10, 2);

            expect(result).toEqual([]);
            expect(mockCacheGet).toHaveBeenCalledWith(emptyCacheKey);
            expect(mockPrismaClient.tool.findMany).toHaveBeenCalledTimes(1);
            expect(mockCacheSet).toHaveBeenCalledWith(emptyCacheKey, []);
        });

        it('should handle errors from PrismaClient gracefully', async () => {
            mockCacheGet.mockReturnValue(undefined);
            const prismaError = new Error("Prisma connection failed");
            (mockPrismaClient.tool.findMany as jest.Mock).mockRejectedValue(prismaError);

            await expect(toolService.getToolsPaginated(offset, limit)).rejects.toThrow(prismaError);

            expect(mockCacheGet).toHaveBeenCalledWith(cacheKey);
            expect(mockPrismaClient.tool.findMany).toHaveBeenCalledTimes(1);
            expect(mockCacheSet).not.toHaveBeenCalled();
        });
    });

    describe('getToolsByTagPaginated', () => {
        const tagSlug = 'tag-1';
        const offset = 0;
        const limit = 1;
        const cacheKey = `toolsByTagPaginated:${tagSlug}:${offset}:${limit}`;
        const mockToolDataForTagPaginated: PrismaToolWithRelations[] = [
            {
                id: '1', name: 'Tool 1 For Tag Paginated', slug: 'tool-1-tag-paginated', description: 'Desc 1',
                iconClass: 'icon-1', displayOrder: 1, isActive: true, createdAt: new Date(), updatedAt: new Date(),
                tags: [{ toolId: '1', tagId: 't1', assignedAt: new Date(), tag: { id: 't1', name: 'Tag 1', slug: 'tag-1', description: 'Desc', color: 'blue', createdAt: new Date() } as Tag }],
                toolUsageStats: [{ id: 's1', toolId: '1', usageCount: 10, lastUsed: new Date() }],
            }
        ];
        const mockToolDTOsForTagPaginated: ToolDTO[] = mockToolDataForTagPaginated.map(t => toToolDTO(t as any));

        it('should return paginated tools by tag from database if not in cache', async () => {
            mockCacheGet.mockReturnValue(undefined); // Cache miss
            (mockPrismaClient.tool.findMany as jest.Mock).mockResolvedValue(mockToolDataForTagPaginated);

            const result = await toolService.getToolsByTagPaginated(tagSlug, offset, limit);

            expect(result).toEqual(mockToolDTOsForTagPaginated);
            expect(mockCacheGet).toHaveBeenCalledWith(cacheKey);
            expect(mockPrismaClient.tool.findMany).toHaveBeenCalledWith({
                where: {
                    isActive: true,
                    tags: { some: { tag: { slug: tagSlug } } },
                },
                orderBy: { displayOrder: 'asc' },
                skip: offset,
                take: limit,
                include: {
                    tags: { include: { tag: true } },
                    toolUsageStats: true,
                },
            });
            expect(mockCacheSet).toHaveBeenCalledWith(cacheKey, mockToolDTOsForTagPaginated);
        });

        it('should return paginated tools by tag from cache if available', async () => {
            mockCacheGet.mockReturnValue(mockToolDTOsForTagPaginated); // Cache hit

            const result = await toolService.getToolsByTagPaginated(tagSlug, offset, limit);

            expect(result).toEqual(mockToolDTOsForTagPaginated);
            expect(mockCacheGet).toHaveBeenCalledWith(cacheKey);
            expect(mockPrismaClient.tool.findMany).not.toHaveBeenCalled();
            expect(mockCacheSet).not.toHaveBeenCalled();
        });

        it('should return empty array if no tools for tag pagination and cache is empty', async () => {
            mockCacheGet.mockReturnValue(undefined);
            (mockPrismaClient.tool.findMany as jest.Mock).mockResolvedValue([]);
            const emptyCacheKey = `toolsByTagPaginated:non-existent-tag:10:1`;

            const result = await toolService.getToolsByTagPaginated('non-existent-tag', 10, 1);

            expect(result).toEqual([]);
            expect(mockCacheGet).toHaveBeenCalledWith(emptyCacheKey);
            expect(mockPrismaClient.tool.findMany).toHaveBeenCalledTimes(1);
            expect(mockCacheSet).toHaveBeenCalledWith(emptyCacheKey, []);
        });

        it('should handle errors from PrismaClient gracefully', async () => {
            mockCacheGet.mockReturnValue(undefined);
            const prismaError = new Error("Prisma connection failed");
            (mockPrismaClient.tool.findMany as jest.Mock).mockRejectedValue(prismaError);

            await expect(toolService.getToolsByTagPaginated(tagSlug, offset, limit)).rejects.toThrow(prismaError);

            expect(mockCacheGet).toHaveBeenCalledWith(cacheKey);
            expect(mockPrismaClient.tool.findMany).toHaveBeenCalledTimes(1);
            expect(mockCacheSet).not.toHaveBeenCalled();
        });
    });
}); 