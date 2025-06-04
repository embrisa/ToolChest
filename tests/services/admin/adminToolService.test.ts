import { PrismaClient } from "@prisma/client";
import { AdminToolService } from "@/services/admin/adminToolService";

const prisma = new PrismaClient({
  datasources: { db: { url: "file:./test.db" } },
});
const service = new AdminToolService(prisma);

afterAll(async () => {
  await prisma.$disconnect();
});

describe("AdminToolService", () => {
  test("generateSlugFromName converts names to slugs", () => {
    expect(service.generateSlugFromName("My Tool Name")).toBe("my-tool-name");
  });

  test("checkSlugAvailable detects existing slug", async () => {
    const available = await service.checkSlugAvailable("base64");
    expect(available).toBe(false);
  });

  test("checkSlugAvailable allows new slug", async () => {
    const available = await service.checkSlugAvailable("unique-slug");
    expect(available).toBe(true);
  });
});
