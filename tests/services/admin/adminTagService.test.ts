import { PrismaClient } from "@prisma/client";
import { AdminTagService } from "@/services/admin/adminTagService";

const prisma = new PrismaClient({
  datasources: { db: { url: "file:./test.db" } },
});
const service = new AdminTagService(prisma);

afterAll(async () => {
  await prisma.$disconnect();
});

describe("AdminTagService", () => {
  test("generateSlugFromName converts names to slugs", () => {
    expect(service.generateSlugFromName("Some Tag")).toBe("some-tag");
  });

  test("checkSlugAvailable detects existing slug", async () => {
    const available = await service.checkSlugAvailable("encoding");
    expect(available).toBe(false);
  });

  test("checkSlugAvailable allows new slug", async () => {
    const available = await service.checkSlugAvailable("new-tag");
    expect(available).toBe(true);
  });
});
