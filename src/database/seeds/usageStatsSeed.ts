import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedUsageStats() {
    console.log('Start seeding usage statistics...');

    // Get all tools
    const tools = await prisma.tool.findMany();

    if (tools.length === 0) {
        console.log('No tools found. Please run the main seed first.');
        return;
    }

    // Create random usage statistics for each tool
    for (const tool of tools) {
        // Generate random usage count between 10 and 500
        const usageCount = Math.floor(Math.random() * 490) + 10;

        // Create usage statistics with random last used date (within last 30 days)
        const daysAgo = Math.floor(Math.random() * 30);
        const lastUsed = new Date();
        lastUsed.setDate(lastUsed.getDate() - daysAgo);

        await prisma.toolUsageStats.upsert({
            where: { toolId: tool.id },
            update: {
                usageCount,
                lastUsed,
            },
            create: {
                toolId: tool.id,
                usageCount,
                lastUsed,
            },
        });

        console.log(`Created usage stats for ${tool.name}: ${usageCount} uses`);
    }

    console.log('Usage statistics seeding finished.');
}

async function main() {
    try {
        await seedUsageStats();
    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main(); 