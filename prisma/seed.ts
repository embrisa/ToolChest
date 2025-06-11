// @ts-nocheck
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // --- 1. Upsert Tags ---
  const tagsData = [
    {
      tagKey: "encoding",
      nameKey: "tags.encoding.name",
      slug: "encoding",
      descriptionKey: "tags.encoding.description",
      displayOrder: 1,
    },
    {
      tagKey: "security",
      nameKey: "tags.security.name",
      slug: "security",
      descriptionKey: "tags.security.description",
      displayOrder: 2,
    },
    {
      tagKey: "generation",
      nameKey: "tags.generation.name",
      slug: "generation",
      descriptionKey: "tags.generation.description",
      displayOrder: 3,
    },
    {
      tagKey: "conversion",
      nameKey: "tags.conversion.name",
      slug: "conversion",
      descriptionKey: "tags.conversion.description",
      displayOrder: 4,
    },
    {
      tagKey: "design",
      nameKey: "tags.design.name",
      slug: "design",
      descriptionKey: "tags.design.description",
      displayOrder: 5,
    },
    {
      tagKey: "document",
      nameKey: "tags.document.name",
      slug: "document",
      descriptionKey: "tags.document.description",
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
  console.log(`Upserted ${tagsData.length} tags.`);

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
  console.log(`Upserted ${toolsData.length} tools.`);

  // --- 3. Fetch Created Records ---
  const createdTools = await prisma.tool.findMany();
  const createdTags = await prisma.tag.findMany();

  // --- 4. Create Tool-Tag Relationships ---
  const toolTagRelations = [
    { toolSlug: "base64", tagSlugs: ["encoding", "conversion"] },
    { toolSlug: "hash-generator", tagSlugs: ["security", "generation"] },
    { toolSlug: "favicon-generator", tagSlugs: ["generation", "design"] },
    { toolSlug: "markdown-to-pdf", tagSlugs: ["conversion", "document"] },
  ];

  for (const relation of toolTagRelations) {
    const tool = createdTools.find((t) => t.slug === relation.toolSlug);
    if (!tool) {
      console.warn(`Tool with slug "${relation.toolSlug}" not found. Skipping relation.`);
      continue;
    }

    for (const tagSlug of relation.tagSlugs) {
      const tag = createdTags.find((t) => t.slug === tagSlug);
      if (!tag) {
        console.warn(`Tag with slug "${tagSlug}" not found. Skipping relation.`);
        continue;
      }

      await prisma.toolTag.upsert({
        where: {
          toolId_tagId: {
            toolId: tool.id,
            tagId: tag.id,
          },
        },
        update: {},
        create: {
          toolId: tool.id,
          tagId: tag.id,
        },
      });
    }
  }
  console.log("Upserted tool-tag relationships.");

  // --- 5. Create Initial Usage Stats ---
  for (const tool of createdTools) {
    await prisma.toolUsageStats.upsert({
      where: { toolId: tool.id },
      update: {},
      create: {
        toolId: tool.id,
        usageCount: Math.floor(Math.random() * 2500) + 50, // Add random usage
        lastUsed: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Random date in last 30 days
      },
    });
  }
  console.log(`Upserted usage stats for ${createdTools.length} tools.`);

  console.log("✅ Database seeded successfully!");
  console.log(`   Tools: ${createdTools.map((t) => t.toolKey).join(", ")}`);
  console.log(`   Tags: ${createdTags.map((t) => t.tagKey).join(", ")}`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
