import { chromium, FullConfig } from "@playwright/test";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

async function globalSetup(config: FullConfig) {
  console.log("🎭 Setting up Playwright E2E test environment...");

  // Set test environment variables
  Object.assign(process.env, {
    NODE_ENV: process.env.NODE_ENV || "test",
    DATABASE_URL: "file:./test-e2e.db",
    ADMIN_SECRET_TOKEN: "test-admin-token-e2e",
  });

  try {
    // Clean up any existing E2E test database
    const testDbPath = path.join(__dirname, "../test-e2e.db");
    try {
      if (fs.existsSync(testDbPath)) {
        fs.unlinkSync(testDbPath);
        console.log("✅ Cleaned up existing E2E test database");
      }
    } catch (error) {
      // Database file might not exist, which is fine
    }

    // Set up E2E test database using the SQLite test schema
    console.log("🗄️  Setting up E2E test database...");
    execSync(
      "npx prisma db push --force-reset --schema=prisma/schema.test.prisma",
      {
        stdio: "pipe",
        env: {
          ...process.env,
          DATABASE_URL: "file:./test-e2e.db",
        },
      },
    );

    // Generate Prisma client using the test schema
    execSync("npx prisma generate --schema=prisma/schema.test.prisma", {
      stdio: "pipe",
    });

    // Seed E2E test database
    console.log("🌱 Seeding E2E test database...");
    await seedE2EDatabase();

    // Set up browser context for auth testing
    console.log("🔐 Setting up admin authentication context...");
    await setupAdminAuth();

    console.log("✅ Playwright global setup completed successfully");
  } catch (error) {
    console.error("❌ Playwright global setup failed:", error);
    throw error;
  }
}

async function seedE2EDatabase() {
  const { PrismaClient } = await import("@prisma/client");

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "file:./test-e2e.db",
      },
    },
  });

  try {
    // Clean existing data
    await prisma.toolUsageStats.deleteMany();
    await prisma.toolTag.deleteMany();
    await prisma.tool.deleteMany();
    await prisma.tag.deleteMany();

    // --- 1. Upsert Tags ---
    const tagsData = [
      {
        tagKey: "encoding",
        nameKey: "database.tags.encoding",
        slug: "encoding",
        descriptionKey: "database.tags.encoding.description",
        displayOrder: 1,
      },
      {
        tagKey: "security",
        nameKey: "database.tags.security",
        slug: "security",
        descriptionKey: "database.tags.security.description",
        displayOrder: 2,
      },
      {
        tagKey: "generation",
        nameKey: "database.tags.generation",
        slug: "generation",
        descriptionKey: "database.tags.generation.description",
        displayOrder: 3,
      },
      {
        tagKey: "conversion",
        nameKey: "database.tags.conversion",
        slug: "conversion",
        descriptionKey: "database.tags.conversion.description",
        displayOrder: 4,
      },
      {
        tagKey: "design",
        nameKey: "database.tags.design",
        slug: "design",
        descriptionKey: "database.tags.design.description",
        displayOrder: 5,
      },
      {
        tagKey: "document",
        nameKey: "database.tags.document",
        slug: "document",
        descriptionKey: "database.tags.document.description",
        displayOrder: 6,
      },
    ];

    for (const tag of tagsData) {
      await prisma.tag.upsert({
        where: { slug: tag.slug },
        update: {},
        create: tag,
      });
    }

    // --- 2. Upsert Tools ---
    const toolsData = [
      {
        toolKey: "base64",
        nameKey: "tools.base64.name",
        slug: "base64",
        descriptionKey: "tools.base64.description",
        displayOrder: 1,
        iconClass: "🔗",
      },
      {
        toolKey: "hash-generator",
        nameKey: "tools.hash-generator.name",
        slug: "hash-generator",
        descriptionKey: "tools.hash-generator.description",
        displayOrder: 2,
        iconClass: "🔐",
      },
      {
        toolKey: "favicon-generator",
        nameKey: "tools.favicon-generator.name",
        slug: "favicon-generator",
        descriptionKey: "tools.favicon-generator.description",
        displayOrder: 3,
        iconClass: "🎨",
      },
      {
        toolKey: "markdown-to-pdf",
        nameKey: "tools.markdown-to-pdf.name",
        slug: "markdown-to-pdf",
        descriptionKey: "tools.markdown-to-pdf.description",
        displayOrder: 4,
        iconClass: "📄",
      },
    ];

    for (const tool of toolsData) {
      await prisma.tool.upsert({
        where: { slug: tool.slug },
        update: {},
        create: tool,
      });
    }

    const createdTools = await prisma.tool.findMany();
    const createdTags = await prisma.tag.findMany();

    // --- 3. Create Tool-Tag Relationships ---
    const toolTagRelations = [
      { toolSlug: "base64", tagSlugs: ["encoding", "conversion"] },
      { toolSlug: "hash-generator", tagSlugs: ["security", "generation"] },
      { toolSlug: "favicon-generator", tagSlugs: ["generation", "design"] },
      { toolSlug: "markdown-to-pdf", tagSlugs: ["conversion", "document"] },
    ];

    for (const relation of toolTagRelations) {
      const tool = createdTools.find((t) => t.slug === relation.toolSlug);
      if (!tool) continue;
      for (const tagSlug of relation.tagSlugs) {
        const tag = createdTags.find((t) => t.slug === tagSlug);
        if (!tag) continue;
        await prisma.toolTag.upsert({
          where: { toolId_tagId: { toolId: tool.id, tagId: tag.id } },
          update: {},
          create: { toolId: tool.id, tagId: tag.id },
        });
      }
    }

    // --- 4. Create Initial Usage Stats ---
    for (const tool of createdTools) {
      await prisma.toolUsageStats.upsert({
        where: { toolId: tool.id },
        update: {},
        create: {
          toolId: tool.id,
          usageCount: Math.floor(Math.random() * 2500) + 50,
          lastUsed: new Date(
            Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
          ),
        },
      });
    }

    console.log("✅ E2E test database seeded successfully");
  } catch (error) {
    console.error("❌ E2E test database seeding failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function setupAdminAuth() {
  // Set up admin authentication context for tests
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the app to establish a session
    await page.goto("http://localhost:3000");

    // Set admin auth cookie directly for E2E tests
    await page.context().addCookies([
      {
        name: "admin-auth",
        value: "test-admin-token-e2e",
        domain: "localhost",
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      },
    ]);

    // Save authentication state for reuse in tests
    await page.context().storageState({ path: "e2e/auth/admin-auth.json" });

    console.log("✅ Admin authentication context saved");
  } catch (error) {
    console.error("❌ Failed to setup admin auth:", error);
    // Don't throw error, tests can still run without pre-saved auth
  } finally {
    await browser.close();
  }
}

export default globalSetup;
