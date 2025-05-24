#!/usr/bin/env node

/**
 * Standalone script to create an admin user
 * Usage: node create-admin-user.js
 * 
 * This script can be run independently without the full application setup
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
    try {
        console.log('🔧 Creating admin user...');

        // Check if admin user already exists
        const existingAdmin = await prisma.adminUser.findFirst({
            where: {
                OR: [
                    { username: 'admin' },
                    { role: 'SUPER_ADMIN' }
                ]
            }
        });

        if (existingAdmin) {
            console.log('✅ Admin user already exists:');
            console.log(`   ID: ${existingAdmin.id}`);
            console.log(`   Username: ${existingAdmin.username}`);
            console.log(`   Email: ${existingAdmin.email}`);
            console.log(`   Role: ${existingAdmin.role}`);
            return existingAdmin;
        }

        // Create new admin user
        const password = 'admin123'; // Default password
        const hashedPassword = await bcrypt.hash(password, 12);

        const adminUser = await prisma.adminUser.create({
            data: {
                username: 'admin',
                email: 'admin@toolchest.local',
                passwordHash: hashedPassword,
                role: 'SUPER_ADMIN',
                isActive: true
            }
        });

        console.log('✅ Successfully created admin user:');
        console.log(`   ID: ${adminUser.id}`);
        console.log(`   Username: ${adminUser.username}`);
        console.log(`   Email: ${adminUser.email}`);
        console.log(`   Role: ${adminUser.role}`);
        console.log(`   Password: ${password}`);
        console.log('');
        console.log('🚨 IMPORTANT: Change the default password after first login!');
        console.log('');
        console.log('You can now restore authentication by reverting the changes to:');
        console.log('   src/middleware/adminAuthMiddleware.ts');

        return adminUser;

    } catch (error) {
        console.error('❌ Error creating admin user:', error);

        if (error.code === 'P2002') {
            console.log('💡 This might be a unique constraint error - user may already exist');
        }

        throw error;
    }
}

// Run the script
createAdminUser()
    .then(() => {
        console.log('🎉 Admin user creation completed');
    })
    .catch((error) => {
        console.error('💥 Admin user creation failed:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 