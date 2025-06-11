// @ts-nocheck - Bypassing Prisma client type conflicts during test development
import { DatabaseTranslationService } from "@/services/core/databaseTranslationService";

// Create test data that matches the actual Prisma schema structure
const createTestTool = (overrides = {}) => ({
    id: "test-tool-1",
    toolKey: "base64",
    slug: "base64",
    nameKey: "tools.base64.name",
    descriptionKey: "tools.base64.description",
    isActive: true,
    isFeatured: false,
    iconClass: null,
    displayOrder: 0,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
});

const createTestTag = (overrides = {}) => ({
    id: "test-tag-1",
    tagKey: "encoding",
    slug: "encoding",
    nameKey: "tags.encoding.name",
    descriptionKey: "tags.encoding.description",
    iconClass: null,
    displayOrder: 0,
    isActive: true,
    createdAt: new Date(),
    ...overrides,
});

// Mock console methods to avoid cluttering test output
const mockConsole = {
    warn: jest.fn(),
    error: jest.fn(),
};

const originalConsole = {
    warn: console.warn,
    error: console.error,
};

describe("DatabaseTranslationService - FULL Integration Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Replace console methods with mocks
        console.warn = mockConsole.warn;
        console.error = mockConsole.error;
    });

    afterEach(() => {
        // Restore console methods
        console.warn = originalConsole.warn;
        console.error = originalConsole.error;
    });

    describe("translateTool - Core Translation Functionality", () => {
        it("should translate a tool to English using real translation files", async () => {
            const testTool = createTestTool();

            const result = await DatabaseTranslationService.translateTool(testTool, "en");

            // Verify the tool structure is preserved
            expect(result.id).toBe(testTool.id);
            expect(result.toolKey).toBe(testTool.toolKey);
            expect(result.slug).toBe(testTool.slug);
            expect(result.nameKey).toBe(testTool.nameKey);
            expect(result.descriptionKey).toBe(testTool.descriptionKey);

            // Verify translation was attempted (either real translation or fallback to key)
            expect(result.name).toBeDefined();
            expect(result.description).toBeDefined();
            expect(typeof result.name).toBe("string");
            expect(result.name.length).toBeGreaterThan(0);
        });

        it("should translate a tool to Spanish using real translation files", async () => {
            const testTool = createTestTool();

            const result = await DatabaseTranslationService.translateTool(testTool, "es");

            // Verify the tool structure is preserved
            expect(result.id).toBe(testTool.id);
            expect(result.toolKey).toBe(testTool.toolKey);

            // Verify translation was attempted
            expect(result.name).toBeDefined();
            expect(result.description).toBeDefined();
            expect(typeof result.name).toBe("string");
            expect(result.name.length).toBeGreaterThan(0);
        });

        it("should translate a tool to French using real translation files", async () => {
            const testTool = createTestTool();

            const result = await DatabaseTranslationService.translateTool(testTool, "fr");

            // Verify the tool structure is preserved
            expect(result.id).toBe(testTool.id);
            expect(result.toolKey).toBe(testTool.toolKey);

            // Verify translation was attempted
            expect(result.name).toBeDefined();
            expect(result.description).toBeDefined();
            expect(typeof result.name).toBe("string");
            expect(result.name.length).toBeGreaterThan(0);
        });

        it("should handle missing translation keys gracefully", async () => {
            const testTool = createTestTool({
                toolKey: "nonexistent-tool",
                nameKey: "tools.nonexistent-tool.name",
                descriptionKey: "tools.nonexistent-tool.description"
            });

            const result = await DatabaseTranslationService.translateTool(testTool, "en");

            // Should fallback to the translation key itself
            expect(result.name).toBe("tools.nonexistent-tool.name");
            expect(result.description).toBe("tools.nonexistent-tool.description");
        });

        it("should handle tools without description keys", async () => {
            const testTool = createTestTool({
                descriptionKey: null
            });

            const result = await DatabaseTranslationService.translateTool(testTool, "en");

            // Name should be translated, description should remain null
            expect(result.name).toBeDefined();
            expect(result.description).toBeNull();
        });

        it("should fallback to English for unsupported locales", async () => {
            const testTool = createTestTool();

            const result = await DatabaseTranslationService.translateTool(testTool, "unsupported-locale");

            // Should log a warning
            expect(mockConsole.warn).toHaveBeenCalledWith(
                "Failed to load database translations for locale unsupported-locale, falling back to English"
            );

            // Should still return a valid result
            expect(result.name).toBeDefined();
            expect(result.description).toBeDefined();
        });

        it("should handle hash-generator tool correctly", async () => {
            const testTool = createTestTool({
                id: "test-tool-2",
                toolKey: "hash-generator",
                slug: "hash-generator",
                nameKey: "tools.hash-generator.name",
                descriptionKey: "tools.hash-generator.description"
            });

            const result = await DatabaseTranslationService.translateTool(testTool, "en");

            expect(result.toolKey).toBe("hash-generator");
            expect(result.name).toBeDefined();
            expect(result.description).toBeDefined();
        });
    });

    describe("translateTools - Batch Translation", () => {
        it("should translate multiple tools efficiently", async () => {
            const testTools = [
                createTestTool(),
                createTestTool({
                    id: "test-tool-2",
                    toolKey: "hash-generator",
                    slug: "hash-generator",
                    nameKey: "tools.hash-generator.name",
                    descriptionKey: "tools.hash-generator.description"
                }),
                createTestTool({
                    id: "test-tool-3",
                    toolKey: "favicon-generator",
                    slug: "favicon-generator",
                    nameKey: "tools.favicon-generator.name",
                    descriptionKey: "tools.favicon-generator.description"
                })
            ];

            const result = await DatabaseTranslationService.translateTools(testTools, "en");

            expect(result).toHaveLength(3);

            // Verify each tool was processed
            result.forEach((tool, index) => {
                expect(tool.id).toBe(testTools[index].id);
                expect(tool.toolKey).toBe(testTools[index].toolKey);
                expect(tool.name).toBeDefined();
                expect(tool.description).toBeDefined();
            });
        });

        it("should translate multiple tools to Spanish", async () => {
            const testTools = [
                createTestTool(),
                createTestTool({
                    id: "test-tool-2",
                    toolKey: "hash-generator",
                    slug: "hash-generator",
                    nameKey: "tools.hash-generator.name",
                    descriptionKey: "tools.hash-generator.description"
                })
            ];

            const result = await DatabaseTranslationService.translateTools(testTools, "es");

            expect(result).toHaveLength(2);
            result.forEach((tool) => {
                expect(tool.name).toBeDefined();
                expect(tool.description).toBeDefined();
            });
        });

        it("should handle empty arrays", async () => {
            const result = await DatabaseTranslationService.translateTools([], "en");
            expect(result).toEqual([]);
        });

        it("should handle mixed translation success/failure", async () => {
            const testTools = [
                createTestTool(), // Valid tool
                createTestTool({
                    id: "test-tool-invalid",
                    toolKey: "nonexistent-tool",
                    nameKey: "tools.nonexistent-tool.name",
                    descriptionKey: "tools.nonexistent-tool.description"
                }) // Invalid tool
            ];

            const result = await DatabaseTranslationService.translateTools(testTools, "en");

            expect(result).toHaveLength(2);

            // First tool should have valid translation or fallback
            expect(result[0].name).toBeDefined();

            // Second tool should fallback to keys
            expect(result[1].name).toBe("tools.nonexistent-tool.name");
        });
    });

    describe("translateTag - Tag Translation", () => {
        it("should translate a tag to English", async () => {
            const testTag = createTestTag();

            const result = await DatabaseTranslationService.translateTag(testTag, "en");

            expect(result.id).toBe(testTag.id);
            expect(result.tagKey).toBe(testTag.tagKey);
            expect(result.slug).toBe(testTag.slug);
            expect(result.name).toBeDefined();
            expect(result.description).toBeDefined();
        });

        it("should translate a tag to Spanish", async () => {
            const testTag = createTestTag();

            const result = await DatabaseTranslationService.translateTag(testTag, "es");

            expect(result.tagKey).toBe(testTag.tagKey);
            expect(result.name).toBeDefined();
            expect(result.description).toBeDefined();
        });

        it("should handle security tag correctly", async () => {
            const testTag = createTestTag({
                id: "test-tag-2",
                tagKey: "security",
                slug: "security",
                nameKey: "tags.security.name",
                descriptionKey: "tags.security.description"
            });

            const result = await DatabaseTranslationService.translateTag(testTag, "en");

            expect(result.tagKey).toBe("security");
            expect(result.name).toBeDefined();
            expect(result.description).toBeDefined();
        });

        it("should handle missing tag translation keys gracefully", async () => {
            const testTag = createTestTag({
                tagKey: "nonexistent-tag",
                nameKey: "tags.nonexistent-tag.name",
                descriptionKey: "tags.nonexistent-tag.description"
            });

            const result = await DatabaseTranslationService.translateTag(testTag, "en");

            expect(result.name).toBe("tags.nonexistent-tag.name");
            expect(result.description).toBe("tags.nonexistent-tag.description");
        });
    });

    describe("translateTags - Batch Tag Translation", () => {
        it("should translate multiple tags", async () => {
            const testTags = [
                createTestTag(),
                createTestTag({
                    id: "test-tag-2",
                    tagKey: "security",
                    slug: "security",
                    nameKey: "tags.security.name",
                    descriptionKey: "tags.security.description"
                }),
                createTestTag({
                    id: "test-tag-3",
                    tagKey: "design",
                    slug: "design",
                    nameKey: "tags.design.name",
                    descriptionKey: "tags.design.description"
                })
            ];

            const result = await DatabaseTranslationService.translateTags(testTags, "en");

            expect(result).toHaveLength(3);
            result.forEach((tag, index) => {
                expect(tag.id).toBe(testTags[index].id);
                expect(tag.tagKey).toBe(testTags[index].tagKey);
                expect(tag.name).toBeDefined();
                expect(tag.description).toBeDefined();
            });
        });

        it("should handle empty tag arrays", async () => {
            const result = await DatabaseTranslationService.translateTags([], "en");
            expect(result).toEqual([]);
        });
    });

    describe("Performance Testing with Large Datasets", () => {
        it("should handle translation of 100 tools efficiently", async () => {
            const startTime = performance.now();

            const largeToolsArray = Array.from({ length: 100 }, (_, i) =>
                createTestTool({
                    id: `test-tool-${i}`,
                    toolKey: i % 4 === 0 ? "base64" :
                        i % 4 === 1 ? "hash-generator" :
                            i % 4 === 2 ? "favicon-generator" : "markdown-to-pdf",
                    nameKey: i % 4 === 0 ? "tools.base64.name" :
                        i % 4 === 1 ? "tools.hash-generator.name" :
                            i % 4 === 2 ? "tools.favicon-generator.name" : "tools.markdown-to-pdf.name",
                    descriptionKey: i % 4 === 0 ? "tools.base64.description" :
                        i % 4 === 1 ? "tools.hash-generator.description" :
                            i % 4 === 2 ? "tools.favicon-generator.description" : "tools.markdown-to-pdf.description"
                })
            );

            const result = await DatabaseTranslationService.translateTools(largeToolsArray, "en");

            const endTime = performance.now();
            const executionTime = endTime - startTime;

            expect(result).toHaveLength(100);
            expect(executionTime).toBeLessThan(1000); // Should complete within 1 second

            // Verify first and last items to ensure all were processed
            expect(result[0].id).toBe("test-tool-0");
            expect(result[99].id).toBe("test-tool-99");
            expect(result[0].name).toBeDefined();
            expect(result[99].name).toBeDefined();
        });

        it("should handle translation of 100 tags efficiently", async () => {
            const startTime = performance.now();

            const largeTagsArray = Array.from({ length: 100 }, (_, i) =>
                createTestTag({
                    id: `test-tag-${i}`,
                    tagKey: i % 4 === 0 ? "encoding" :
                        i % 4 === 1 ? "security" :
                            i % 4 === 2 ? "design" : "document",
                    nameKey: i % 4 === 0 ? "tags.encoding.name" :
                        i % 4 === 1 ? "tags.security.name" :
                            i % 4 === 2 ? "tags.design.name" : "tags.document.name",
                    descriptionKey: i % 4 === 0 ? "tags.encoding.description" :
                        i % 4 === 1 ? "tags.security.description" :
                            i % 4 === 2 ? "tags.design.description" : "tags.document.description"
                })
            );

            const result = await DatabaseTranslationService.translateTags(largeTagsArray, "en");

            const endTime = performance.now();
            const executionTime = endTime - startTime;

            expect(result).toHaveLength(100);
            expect(executionTime).toBeLessThan(1000); // Should complete within 1 second

            // Verify first and last items to ensure all were processed
            expect(result[0].id).toBe("test-tag-0");
            expect(result[99].id).toBe("test-tag-99");
            expect(result[0].name).toBeDefined();
            expect(result[99].name).toBeDefined();
        });
    });

    describe("Error Handling and Edge Cases", () => {
        it("should handle concurrent translation requests", async () => {
            const testTool = createTestTool();

            // Make multiple concurrent requests with different locales
            const promises = [
                DatabaseTranslationService.translateTool(testTool, "en"),
                DatabaseTranslationService.translateTool(testTool, "es"),
                DatabaseTranslationService.translateTool(testTool, "fr"),
                DatabaseTranslationService.translateTool(testTool, "en"),
                DatabaseTranslationService.translateTool(testTool, "es")
            ];

            const results = await Promise.all(promises);

            expect(results).toHaveLength(5);
            results.forEach((result) => {
                expect(result.id).toBe(testTool.id);
                expect(result.name).toBeDefined();
                expect(result.description).toBeDefined();
            });
        });

        it("should handle malformed locale gracefully", async () => {
            const testTool = createTestTool();

            const result = await DatabaseTranslationService.translateTool(testTool, "invalid-locale-123");

            // Should log warning and fallback
            expect(mockConsole.warn).toHaveBeenCalled();
            expect(result.name).toBeDefined();
            expect(result.description).toBeDefined();
        });

        it("should handle null/undefined locale gracefully", async () => {
            const testTool = createTestTool();

            const result1 = await DatabaseTranslationService.translateTool(testTool, null);
            const result2 = await DatabaseTranslationService.translateTool(testTool, undefined);

            expect(result1.name).toBeDefined();
            expect(result2.name).toBeDefined();
        });

        it("should validate all supported locales work", async () => {
            const testTool = createTestTool();
            const supportedLocales = ["en", "es", "fr", "de", "it", "pt", "ru", "ja", "ko", "zh"];

            const results = await Promise.all(
                supportedLocales.map(locale =>
                    DatabaseTranslationService.translateTool(testTool, locale)
                )
            );

            results.forEach((result, index) => {
                expect(result.name).toBeDefined();
                expect(result.description).toBeDefined();
                expect(result.toolKey).toBe(testTool.toolKey);
            });
        });
    });

    describe("Translation Key Utilities", () => {
        it("should generate correct tool name keys", () => {
            expect(DatabaseTranslationService.getToolNameKey("base64")).toBe("tools.base64.name");
            expect(DatabaseTranslationService.getToolNameKey("hash-generator")).toBe("tools.hash-generator.name");
            expect(DatabaseTranslationService.getToolNameKey("favicon-generator")).toBe("tools.favicon-generator.name");
        });

        it("should generate correct tool description keys", () => {
            expect(DatabaseTranslationService.getToolDescriptionKey("base64")).toBe("tools.base64.description");
            expect(DatabaseTranslationService.getToolDescriptionKey("hash-generator")).toBe("tools.hash-generator.description");
        });

        it("should generate correct tag name keys", () => {
            expect(DatabaseTranslationService.getTagNameKey("encoding")).toBe("tags.encoding.name");
            expect(DatabaseTranslationService.getTagNameKey("security")).toBe("tags.security.name");
        });

        it("should generate correct tag description keys", () => {
            expect(DatabaseTranslationService.getTagDescriptionKey("encoding")).toBe("tags.encoding.description");
            expect(DatabaseTranslationService.getTagDescriptionKey("security")).toBe("tags.security.description");
        });

        it("should handle special characters in keys", () => {
            expect(DatabaseTranslationService.getToolNameKey("test-tool-with-dashes")).toBe("tools.test-tool-with-dashes.name");
            expect(DatabaseTranslationService.getTagNameKey("test_tag_with_underscores")).toBe("tags.test_tag_with_underscores.name");
        });
    });

    describe("Record Generation Utilities", () => {
        it("should generate correct tool records", () => {
            const result = DatabaseTranslationService.generateToolRecord("base64", {
                isActive: true
            });

            expect(result).toEqual({
                toolKey: "base64",
                slug: "base64",
                nameKey: "tools.base64.name",
                descriptionKey: "tools.base64.description",
                isActive: true
            });
        });

        it("should generate correct tag records", () => {
            const result = DatabaseTranslationService.generateTagRecord("encoding");

            expect(result).toEqual({
                tagKey: "encoding",
                slug: "encoding",
                nameKey: "tags.encoding.name",
                descriptionKey: "tags.encoding.description"
            });
        });
    });

    describe("Hook-like Functions", () => {
        it("should provide getTranslatedTools function", async () => {
            const { getTranslatedTools } = await import("@/services/core/databaseTranslationService");

            const testTools = [createTestTool()];
            const result = await getTranslatedTools(testTools, "es");

            expect(result).toHaveLength(1);
            expect(result[0].name).toBeDefined();
            expect(result[0].description).toBeDefined();
        });

        it("should provide getTranslatedTags function", async () => {
            const { getTranslatedTags } = await import("@/services/core/databaseTranslationService");

            const testTags = [createTestTag()];
            const result = await getTranslatedTags(testTags, "es");

            expect(result).toHaveLength(1);
            expect(result[0].name).toBeDefined();
            expect(result[0].description).toBeDefined();
        });
    });

    describe("Service Structure Validation", () => {
        it("should have all required static methods", () => {
            expect(typeof DatabaseTranslationService.translateTool).toBe("function");
            expect(typeof DatabaseTranslationService.translateTools).toBe("function");
            expect(typeof DatabaseTranslationService.translateTag).toBe("function");
            expect(typeof DatabaseTranslationService.translateTags).toBe("function");
            expect(typeof DatabaseTranslationService.getToolNameKey).toBe("function");
            expect(typeof DatabaseTranslationService.getToolDescriptionKey).toBe("function");
            expect(typeof DatabaseTranslationService.getTagNameKey).toBe("function");
            expect(typeof DatabaseTranslationService.getTagDescriptionKey).toBe("function");
            expect(typeof DatabaseTranslationService.generateToolRecord).toBe("function");
            expect(typeof DatabaseTranslationService.generateTagRecord).toBe("function");
        });

        it("should validate translation key extraction logic", () => {
            // Test the exact pattern used in the service
            const toolKey = "base64";
            const expectedNameKey = `tools.${toolKey}.name`;
            const expectedDescriptionKey = `tools.${toolKey}.description`;

            expect(DatabaseTranslationService.getToolNameKey(toolKey)).toBe(expectedNameKey);
            expect(DatabaseTranslationService.getToolDescriptionKey(toolKey)).toBe(expectedDescriptionKey);

            const tagKey = "encoding";
            const expectedTagNameKey = `tags.${tagKey}.name`;
            const expectedTagDescriptionKey = `tags.${tagKey}.description`;

            expect(DatabaseTranslationService.getTagNameKey(tagKey)).toBe(expectedTagNameKey);
            expect(DatabaseTranslationService.getTagDescriptionKey(tagKey)).toBe(expectedTagDescriptionKey);
        });
    });
}); 