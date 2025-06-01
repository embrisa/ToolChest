import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create tags first
  const encodingTag = await prisma.tag.upsert({
    where: { slug: "encoding" },
    update: {},
    create: {
      name: "Encoding",
      slug: "encoding",
      description: "Text and data encoding tools",
      color: "#0ea5e9",
    },
  });

  const securityTag = await prisma.tag.upsert({
    where: { slug: "security" },
    update: {},
    create: {
      name: "Security",
      slug: "security",
      description: "Security and cryptography tools",
      color: "#d946ef",
    },
  });

  const designTag = await prisma.tag.upsert({
    where: { slug: "design" },
    update: {},
    create: {
      name: "Design",
      slug: "design",
      description: "Design and graphics tools",
      color: "#22c55e",
    },
  });

  const documentTag = await prisma.tag.upsert({
    where: { slug: "document" },
    update: {},
    create: {
      name: "Document",
      slug: "document",
      description: "Document processing tools",
      color: "#f59e0b",
    },
  });

  // Create tools
  const base64Tool = await prisma.tool.upsert({
    where: { slug: "base64" },
    update: {},
    create: {
      name: "Base64 Encoder/Decoder",
      slug: "base64",
      description:
        "Encode and decode text and files to/from Base64 format with URL-safe options",
      iconClass: "fas fa-code",
      displayOrder: 1,
      isActive: true,
    },
  });

  const hashTool = await prisma.tool.upsert({
    where: { slug: "hash-generator" },
    update: {},
    create: {
      name: "Hash Generator",
      slug: "hash-generator",
      description:
        "Generate MD5, SHA-1, SHA-256, SHA-512 hashes for text and files",
      iconClass: "fas fa-fingerprint",
      displayOrder: 2,
      isActive: true,
    },
  });

  const faviconTool = await prisma.tool.upsert({
    where: { slug: "favicon-generator" },
    update: {},
    create: {
      name: "Favicon Generator",
      slug: "favicon-generator",
      description: "Create favicons in all standard sizes from any image",
      iconClass: "fas fa-image",
      displayOrder: 3,
      isActive: true,
    },
  });

  const markdownTool = await prisma.tool.upsert({
    where: { slug: "markdown-to-pdf" },
    update: {},
    create: {
      name: "Markdown to PDF",
      slug: "markdown-to-pdf",
      description:
        "Convert Markdown to professional PDFs with syntax highlighting",
      iconClass: "fas fa-file-pdf",
      displayOrder: 4,
      isActive: true,
    },
  });

  // Create tool-tag relationships
  await prisma.toolTag.upsert({
    where: {
      toolId_tagId: {
        toolId: base64Tool.id,
        tagId: encodingTag.id,
      },
    },
    update: {},
    create: {
      toolId: base64Tool.id,
      tagId: encodingTag.id,
    },
  });

  await prisma.toolTag.upsert({
    where: {
      toolId_tagId: {
        toolId: hashTool.id,
        tagId: securityTag.id,
      },
    },
    update: {},
    create: {
      toolId: hashTool.id,
      tagId: securityTag.id,
    },
  });

  await prisma.toolTag.upsert({
    where: {
      toolId_tagId: {
        toolId: hashTool.id,
        tagId: encodingTag.id,
      },
    },
    update: {},
    create: {
      toolId: hashTool.id,
      tagId: encodingTag.id,
    },
  });

  await prisma.toolTag.upsert({
    where: {
      toolId_tagId: {
        toolId: faviconTool.id,
        tagId: designTag.id,
      },
    },
    update: {},
    create: {
      toolId: faviconTool.id,
      tagId: designTag.id,
    },
  });

  await prisma.toolTag.upsert({
    where: {
      toolId_tagId: {
        toolId: markdownTool.id,
        tagId: documentTag.id,
      },
    },
    update: {},
    create: {
      toolId: markdownTool.id,
      tagId: documentTag.id,
    },
  });

  // Create initial usage stats
  await prisma.toolUsageStats.upsert({
    where: { toolId: base64Tool.id },
    update: {},
    create: {
      toolId: base64Tool.id,
      usageCount: 0,
      lastUsed: new Date(),
    },
  });

  await prisma.toolUsageStats.upsert({
    where: { toolId: hashTool.id },
    update: {},
    create: {
      toolId: hashTool.id,
      usageCount: 0,
      lastUsed: new Date(),
    },
  });

  await prisma.toolUsageStats.upsert({
    where: { toolId: faviconTool.id },
    update: {},
    create: {
      toolId: faviconTool.id,
      usageCount: 0,
      lastUsed: new Date(),
    },
  });

  await prisma.toolUsageStats.upsert({
    where: { toolId: markdownTool.id },
    update: {},
    create: {
      toolId: markdownTool.id,
      usageCount: 0,
      lastUsed: new Date(),
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log(
    `Created tools: ${[base64Tool, hashTool, faviconTool, markdownTool].map((t) => t.name).join(", ")}`,
  );
  console.log(
    `Created tags: ${[encodingTag, securityTag, designTag, documentTag].map((t) => t.name).join(", ")}`,
  );
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
