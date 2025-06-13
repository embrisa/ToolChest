const { execSync } = require("child_process");
const path = require("path");

module.exports = async () => {
  console.log("🧪 Setting up global test environment...");

  // Set test environment variables for SQLite
  process.env.NODE_ENV = "test";
  process.env.DATABASE_PROVIDER = "sqlite";
  process.env.DATABASE_URL = "file:./test.db";
  process.env.ADMIN_SECRET_TOKEN = "test-admin-token";

  try {
    // Clean up any existing test database
    const testDbPath = path.join(__dirname, "../../test.db");
    try {
      const fs = require("fs");
      if (fs.existsSync(testDbPath)) {
        fs.unlinkSync(testDbPath);
        console.log("✅ Cleaned up existing test database");
      }
    } catch (error) {
      // Database file might not exist, which is fine
    }

    // Generate Prisma client with SQLite provider
    console.log("🔧 Generating Prisma client for SQLite...");
    execSync("npx prisma generate --schema=prisma/schema.test.prisma", {
      stdio: "pipe",
      env: {
        ...process.env,
        DATABASE_URL: "file:./test.db",
      },
    });

    // Run database migrations for test database
    console.log("🗄️  Setting up test database...");
    execSync(
      "npx prisma db push --force-reset --schema=prisma/schema.test.prisma",
      {
        stdio: "pipe",
        env: {
          ...process.env,
          DATABASE_URL: "file:./test.db",
        },
      },
    );

    // Seed test database with sample data
    console.log("🌱 Seeding test database...");
    await seedTestDatabase();

    console.log("✅ Global test setup completed successfully");
  } catch (error) {
    console.error("❌ Global test setup failed:", error.message);
    throw error;
  }
};

async function seedTestDatabase() {
  // Import Prisma client for seeding
  const { PrismaClient } = require("@prisma/client");

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "file:./test.db",
      },
    },
  });

  try {
    // Clean existing data
    await prisma.toolUsageStats.deleteMany();
    await prisma.toolTag.deleteMany();
    await prisma.tool.deleteMany();
    await prisma.tag.deleteMany();

    // Create test tags
    const testTags = await Promise.all([
      prisma.tag.create({
        data: {
          nameKey: "tags.encoding.name",
          tagKey: "encoding",
          slug: "encoding",
          descriptionKey: "tags.encoding.description",
          iconClass: "hero-code-bracket",
          displayOrder: 1,
          isActive: true,
        },
      }),
      prisma.tag.create({
        data: {
          nameKey: "tags.security.name",
          tagKey: "security",
          slug: "security",
          descriptionKey: "tags.security.description",
          iconClass: "hero-shield-check",
          displayOrder: 2,
          isActive: true,
        },
      }),
      prisma.tag.create({
        data: {
          nameKey: "tags.development.name",
          tagKey: "development",
          slug: "development",
          descriptionKey: "tags.development.description",
          iconClass: "hero-code-bracket-square",
          displayOrder: 3,
          isActive: true,
        },
      }),
      prisma.tag.create({
        data: {
          nameKey: "tags.design.name",
          tagKey: "design",
          slug: "design",
          descriptionKey: "tags.design.description",
          iconClass: "hero-paint-brush",
          displayOrder: 4,
          isActive: true,
        },
      }),
    ]);

    // Create test tools
    const testTools = await Promise.all([
      prisma.tool.create({
        data: {
          nameKey: "tools.base64.name",
          toolKey: "base64",
          slug: "base64",
          descriptionKey: "tools.base64.description",
          iconClass: "hero-document-text",
          displayOrder: 1,
          usageCount: 150,
          isActive: true,
          isFeatured: true,
        },
      }),
      prisma.tool.create({
        data: {
          nameKey: "tools.hash-generator.name",
          toolKey: "hash-generator",
          slug: "hash-generator",
          descriptionKey: "tools.hash-generator.description",
          iconClass: "hero-key",
          displayOrder: 2,
          usageCount: 89,
          isActive: true,
          isFeatured: false,
        },
      }),
      prisma.tool.create({
        data: {
          nameKey: "tools.favicon-generator.name",
          toolKey: "favicon-generator",
          slug: "favicon-generator",
          descriptionKey: "tools.favicon-generator.description",
          iconClass: "hero-photo",
          displayOrder: 3,
          usageCount: 67,
          isActive: true,
          isFeatured: false,
        },
      }),
      prisma.tool.create({
        data: {
          nameKey: "tools.markdown-to-pdf.name",
          toolKey: "markdown-to-pdf",
          slug: "markdown-to-pdf",
          descriptionKey: "tools.markdown-to-pdf.description",
          iconClass: "hero-document-duplicate",
          displayOrder: 4,
          usageCount: 45,
          isActive: true,
          isFeatured: false,
        },
      }),
    ]);

    // Create tool-tag relationships
    await Promise.all([
      // Base64 - Encoding, Development
      prisma.toolTag.create({
        data: { toolId: testTools[0].id, tagId: testTags[0].id },
      }),
      prisma.toolTag.create({
        data: { toolId: testTools[0].id, tagId: testTags[2].id },
      }),

      // Hash Generator - Security, Development
      prisma.toolTag.create({
        data: { toolId: testTools[1].id, tagId: testTags[1].id },
      }),
      prisma.toolTag.create({
        data: { toolId: testTools[1].id, tagId: testTags[2].id },
      }),

      // Favicon Generator - Design, Development
      prisma.toolTag.create({
        data: { toolId: testTools[2].id, tagId: testTags[3].id },
      }),
      prisma.toolTag.create({
        data: { toolId: testTools[2].id, tagId: testTags[2].id },
      }),

      // Markdown to PDF - Development
      prisma.toolTag.create({
        data: { toolId: testTools[3].id, tagId: testTags[2].id },
      }),
    ]);

    // Create test usage statistics
    await Promise.all(
      testTools.map((tool) =>
        prisma.toolUsageStats.create({
          data: {
            toolId: tool.id,
            usageCount: tool.usageCount,
            lastUsed: new Date(),
          },
        }),
      ),
    );

    console.log("✅ Test database seeded successfully");
    console.log(`   - Created ${testTags.length} tags`);
    console.log(`   - Created ${testTools.length} tools`);
    console.log(`   - Created tool-tag relationships`);
    console.log(`   - Created usage statistics`);
  } catch (error) {
    console.error("❌ Test database seeding failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
