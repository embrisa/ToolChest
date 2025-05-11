import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function seedInitialData() {
    console.log('Start seeding ...');

    // Create common tags
    const encodingTag = await prisma.tag.upsert({
        where: { slug: 'encoding' },
        update: {},
        create: {
            name: 'Encoding',
            slug: 'encoding',
            description: 'Tools for encoding and decoding data',
            color: '#3B82F6', // Blue
        },
    });

    const conversionTag = await prisma.tag.upsert({
        where: { slug: 'conversion' },
        update: {},
        create: {
            name: 'Conversion',
            slug: 'conversion',
            description: 'Tools for converting between different formats',
            color: '#10B981', // Green
        },
    });

    const textTag = await prisma.tag.upsert({
        where: { slug: 'text' },
        update: {},
        create: {
            name: 'Text',
            slug: 'text',
            description: 'Text manipulation tools',
            color: '#6366F1', // Indigo
        },
    });

    console.log(`Created tag with id: ${encodingTag.id}`);
    console.log(`Created tag with id: ${conversionTag.id}`);
    console.log(`Created tag with id: ${textTag.id}`);

    // Create tools and assign tags
    const base64Tool = await prisma.tool.upsert({
        where: { slug: 'base64' },
        update: {},
        create: {
            name: 'Base64 Converter',
            slug: 'base64',
            description: 'Encode or decode text using Base64',
            iconClass: 'fas fa-exchange-alt',
            displayOrder: 1,
            isActive: true,
            tags: {
                create: [
                    { tagId: encodingTag.id },
                    { tagId: conversionTag.id },
                    { tagId: textTag.id },
                ],
            },
        },
    });

    console.log(`Created tool with id: ${base64Tool.id}`);
    console.log('Seeding finished.');
}

async function main() {
    try {
        await seedInitialData();
    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main(); 