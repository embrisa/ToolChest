import { PrismaClient } from "@prisma/client";
import { ToolService } from "@/services/tools/toolService";

const prisma = new PrismaClient({
  datasources: { db: { url: "file:./test.db" } },
});
const service = new ToolService(prisma);

afterAll(async () => {
  await prisma.$disconnect();
});

describe("ToolService integration", () => {
  test("getAllTools returns seeded tools", async () => {
    const tools = await service.getAllTools();
    expect(tools.length).toBeGreaterThanOrEqual(4);
  });

  test("getToolBySlug returns a tool", async () => {
    const tool = await service.getToolBySlug("base64");
    expect(tool?.slug).toBe("base64");
  });

  test("getToolsByTag returns tools for tag", async () => {
    const tools = await service.getToolsByTag("development");
    expect(tools.length).toBeGreaterThanOrEqual(4);
  });

  test("getAllTags returns seeded tags", async () => {
    const tags = await service.getAllTags();
    expect(tags.length).toBeGreaterThanOrEqual(4);
  });

  test("getTagBySlug returns tag", async () => {
    const tag = await service.getTagBySlug("development");
    expect(tag?.slug).toBe("development");
  });

  test("pagination works for tools", async () => {
    const tools = await service.getToolsPaginated(0, 2);
    expect(tools).toHaveLength(2);
  });
});
