const { execSync } = require('child_process')
const path = require('path')

module.exports = async () => {
    console.log('🧪 Setting up global test environment...')

    // Set test environment variables
    process.env.NODE_ENV = 'test'
    process.env.DATABASE_URL = 'file:./test.db'
    process.env.ADMIN_SECRET_TOKEN = 'test-admin-token'

    try {
        // Clean up any existing test database
        const testDbPath = path.join(__dirname, '../../test.db')
        try {
            const fs = require('fs')
            if (fs.existsSync(testDbPath)) {
                fs.unlinkSync(testDbPath)
                console.log('✅ Cleaned up existing test database')
            }
        } catch (error) {
            // Database file might not exist, which is fine
        }

        // Run database migrations for test database
        console.log('🗄️  Setting up test database...')
        execSync('npx prisma migrate deploy', {
            stdio: 'pipe',
            env: {
                ...process.env,
                DATABASE_URL: 'file:./test.db'
            }
        })

        // Generate Prisma client
        execSync('npx prisma generate', {
            stdio: 'pipe'
        })

        // Seed test database with sample data
        console.log('🌱 Seeding test database...')
        await seedTestDatabase()

        console.log('✅ Global test setup completed successfully')

    } catch (error) {
        console.error('❌ Global test setup failed:', error.message)
        throw error
    }
}

async function seedTestDatabase() {
    // Import Prisma client for seeding
    const { PrismaClient } = require('@prisma/client')

    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: 'file:./test.db'
            }
        }
    })

    try {
        // Clean existing data
        await prisma.toolUsage.deleteMany()
        await prisma.toolUsageStats.deleteMany()
        await prisma.toolTag.deleteMany()
        await prisma.tool.deleteMany()
        await prisma.tag.deleteMany()

        // Create test tags
        const testTags = await Promise.all([
            prisma.tag.create({
                data: {
                    name: 'Encoding',
                    slug: 'encoding',
                    description: 'Text and data encoding tools',
                    color: '#3B82F6'
                }
            }),
            prisma.tag.create({
                data: {
                    name: 'Security',
                    slug: 'security',
                    description: 'Security and cryptography tools',
                    color: '#EF4444'
                }
            }),
            prisma.tag.create({
                data: {
                    name: 'Development',
                    slug: 'development',
                    description: 'Development and programming tools',
                    color: '#10B981'
                }
            }),
            prisma.tag.create({
                data: {
                    name: 'Design',
                    slug: 'design',
                    description: 'Design and graphics tools',
                    color: '#8B5CF6'
                }
            })
        ])

        // Create test tools
        const testTools = await Promise.all([
            prisma.tool.create({
                data: {
                    name: 'Base64 Encoder/Decoder',
                    slug: 'base64',
                    description: 'Encode and decode Base64 text and files',
                    iconClass: 'hero-document-text',
                    displayOrder: 1,
                    usageCount: 150,
                    isActive: true
                }
            }),
            prisma.tool.create({
                data: {
                    name: 'Hash Generator',
                    slug: 'hash-generator',
                    description: 'Generate MD5, SHA-1, SHA-256, SHA-512 hashes',
                    iconClass: 'hero-key',
                    displayOrder: 2,
                    usageCount: 89,
                    isActive: true
                }
            }),
            prisma.tool.create({
                data: {
                    name: 'Favicon Generator',
                    slug: 'favicon-generator',
                    description: 'Generate favicons in multiple sizes and formats',
                    iconClass: 'hero-photo',
                    displayOrder: 3,
                    usageCount: 67,
                    isActive: true
                }
            }),
            prisma.tool.create({
                data: {
                    name: 'Markdown to PDF',
                    slug: 'markdown-to-pdf',
                    description: 'Convert Markdown to styled PDF documents',
                    iconClass: 'hero-document-duplicate',
                    displayOrder: 4,
                    usageCount: 45,
                    isActive: true
                }
            })
        ])

        // Create tool-tag relationships
        await Promise.all([
            // Base64 - Encoding, Development
            prisma.toolTag.create({
                data: { toolId: testTools[0].id, tagId: testTags[0].id }
            }),
            prisma.toolTag.create({
                data: { toolId: testTools[0].id, tagId: testTags[2].id }
            }),

            // Hash Generator - Security, Development
            prisma.toolTag.create({
                data: { toolId: testTools[1].id, tagId: testTags[1].id }
            }),
            prisma.toolTag.create({
                data: { toolId: testTools[1].id, tagId: testTags[2].id }
            }),

            // Favicon Generator - Design, Development
            prisma.toolTag.create({
                data: { toolId: testTools[2].id, tagId: testTags[3].id }
            }),
            prisma.toolTag.create({
                data: { toolId: testTools[2].id, tagId: testTags[2].id }
            }),

            // Markdown to PDF - Development
            prisma.toolTag.create({
                data: { toolId: testTools[3].id, tagId: testTags[2].id }
            })
        ])

        // Create test usage statistics
        await Promise.all(
            testTools.map(tool =>
                prisma.toolUsageStats.create({
                    data: {
                        toolId: tool.id,
                        usageCount: tool.usageCount,
                        lastUsed: new Date()
                    }
                })
            )
        )

        console.log('✅ Test database seeded successfully')
        console.log(`   - Created ${testTags.length} tags`)
        console.log(`   - Created ${testTools.length} tools`)
        console.log(`   - Created tool-tag relationships`)
        console.log(`   - Created usage statistics`)

    } catch (error) {
        console.error('❌ Test database seeding failed:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
} 