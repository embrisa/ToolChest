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

    // Set up E2E test database
    console.log("🗄️  Setting up E2E test database...");
    execSync("npx prisma migrate deploy", {
      stdio: "pipe",
      env: {
        ...process.env,
        DATABASE_URL: "file:./test-e2e.db",
      },
    });

    // Generate Prisma client
    execSync("npx prisma generate", {
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
    await prisma.toolUsage.deleteMany();
    await prisma.toolUsageStats.deleteMany();
    await prisma.toolTag.deleteMany();
    await prisma.tool.deleteMany();
    await prisma.tag.deleteMany();

    // Create comprehensive test data for E2E testing
    const testTags = await Promise.all([
      prisma.tag.create({
        data: {
          name: "Encoding",
          slug: "encoding",
          description: "Text and data encoding tools",
          color: "#3B82F6",
        },
      }),
      prisma.tag.create({
        data: {
          name: "Security",
          slug: "security",
          description: "Security and cryptography tools",
          color: "#EF4444",
        },
      }),
      prisma.tag.create({
        data: {
          name: "Development",
          slug: "development",
          description: "Development and programming tools",
          color: "#10B981",
        },
      }),
      prisma.tag.create({
        data: {
          name: "Design",
          slug: "design",
          description: "Design and graphics tools",
          color: "#8B5CF6",
        },
      }),
      prisma.tag.create({
        data: {
          name: "Conversion",
          slug: "conversion",
          description: "File and format conversion tools",
          color: "#F59E0B",
        },
      }),
    ]);

    // Create test tools with realistic data
    const testTools = await Promise.all([
      prisma.tool.create({
        data: {
          name: "Base64 Encoder/Decoder",
          slug: "base64",
          description:
            "Encode and decode Base64 text and files with support for URL-safe encoding",
          iconClass: "hero-document-text",
          displayOrder: 1,
          usageCount: 1250,
          isActive: true,
        },
      }),
      prisma.tool.create({
        data: {
          name: "Hash Generator",
          slug: "hash-generator",
          description:
            "Generate MD5, SHA-1, SHA-256, SHA-512 hashes for text and files",
          iconClass: "hero-key",
          displayOrder: 2,
          usageCount: 890,
          isActive: true,
        },
      }),
      prisma.tool.create({
        data: {
          name: "Favicon Generator",
          slug: "favicon-generator",
          description:
            "Generate favicons in multiple sizes and formats from any image",
          iconClass: "hero-photo",
          displayOrder: 3,
          usageCount: 670,
          isActive: true,
        },
      }),
      prisma.tool.create({
        data: {
          name: "Markdown to PDF",
          slug: "markdown-to-pdf",
          description:
            "Convert Markdown documents to styled PDF files with custom themes",
          iconClass: "hero-document-duplicate",
          displayOrder: 4,
          usageCount: 450,
          isActive: true,
        },
      }),
    ]);

    // Create comprehensive tool-tag relationships
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

      // Favicon Generator - Design, Development, Conversion
      prisma.toolTag.create({
        data: { toolId: testTools[2].id, tagId: testTags[3].id },
      }),
      prisma.toolTag.create({
        data: { toolId: testTools[2].id, tagId: testTags[2].id },
      }),
      prisma.toolTag.create({
        data: { toolId: testTools[2].id, tagId: testTags[4].id },
      }),

      // Markdown to PDF - Development, Conversion
      prisma.toolTag.create({
        data: { toolId: testTools[3].id, tagId: testTags[2].id },
      }),
      prisma.toolTag.create({
        data: { toolId: testTools[3].id, tagId: testTags[4].id },
      }),
    ]);

    // Create usage statistics
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

    // Create some sample usage records for analytics testing
    const now = new Date();
    const usageRecords = [];

    for (const tool of testTools) {
      for (let i = 0; i < 10; i++) {
        const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000); // Last 10 days
        usageRecords.push(
          prisma.toolUsage.create({
            data: {
              toolId: tool.id,
              timestamp,
              metadata: {
                success: true,
                processingTime: Math.floor(Math.random() * 1000) + 100,
                inputSize: Math.floor(Math.random() * 10000) + 1000,
              },
            },
          }),
        );
      }
    }

    await Promise.all(usageRecords);

    console.log("✅ E2E test database seeded successfully");
    console.log(`   - Created ${testTags.length} tags`);
    console.log(`   - Created ${testTools.length} tools`);
    console.log(`   - Created ${usageRecords.length} usage records`);
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
