import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedAdminUser() {
    try {
        console.log('🌱 Seeding admin user...');

        // Check if admin user already exists
        const existingAdmin = await prisma.adminUser.findFirst({
            where: { role: 'SUPER_ADMIN' }
        });

        if (existingAdmin) {
            console.log('✅ Super admin user already exists');
            return;
        }

        // Create default super admin user
        const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 12);

        const adminUser = await prisma.adminUser.create({
            data: {
                username: 'admin',
                email: 'admin@toolchest.local',
                passwordHash: hashedPassword,
                role: 'SUPER_ADMIN',
                isActive: true
            }
        });

        console.log('✅ Created super admin user:');
        console.log(`   Username: ${adminUser.username}`);
        console.log(`   Email: ${adminUser.email}`);
        console.log(`   Password: ${defaultPassword}`);
        console.log('   ⚠️  Please change the default password after first login!');

    } catch (error) {
        console.error('❌ Error seeding admin user:', error);
        throw error;
    }
}

export { seedAdminUser };

// Allow running this script directly
if (require.main === module) {
    seedAdminUser()
        .then(() => {
            console.log('🎉 Admin user seeding completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Admin user seeding failed:', error);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
} 