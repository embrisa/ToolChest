import { PrismaClient } from "@prisma/client";
import { RelationshipService } from "@/services/admin/relationshipService";

const prisma = new PrismaClient({
  datasources: { db: { url: "file:./test.db" } },
});
const service = new RelationshipService(prisma);

afterAll(async () => {
  await prisma.$disconnect();
});

describe("RelationshipService", () => {
  test("getAllRelationships returns all tool-tag pairs", async () => {
    const relationships = await service.getAllRelationships();
    expect(relationships.length).toBeGreaterThanOrEqual(7);
  });

  test("previewBulkOperation assign shows changes", async () => {
    const tool = await prisma.tool.findFirst({
      where: { slug: "markdown-to-pdf" },
    });
    const tag = await prisma.tag.findFirst({ where: { slug: "security" } });
    const preview = await service.previewBulkOperation({
      type: "assign",
      toolIds: [tool!.id],
      tagIds: [tag!.id],
      requiresConfirmation: false,
      estimatedChanges: 1,
    });
    expect(preview.summary.totalTools).toBe(1);
    expect(preview.toolsToUpdate[0].addedTags.length).toBeGreaterThanOrEqual(1);
  });
});
