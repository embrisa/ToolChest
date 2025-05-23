import { injectable, inject } from 'inversify';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { TYPES } from '../config/types';
import { AdminUserDTO, AdminLoginDTO, CreateAdminUserDTO, AdminRole } from '../dto/adminUserDTO';

export interface AdminAuthService {
    authenticateUser(loginData: AdminLoginDTO): Promise<AdminUserDTO | null>;
    createAdminUser(userData: CreateAdminUserDTO): Promise<AdminUserDTO>;
    hashPassword(password: string): Promise<string>;
    verifyPassword(password: string, hash: string): Promise<boolean>;
    updateLastLoginAt(userId: string): Promise<void>;
    getAdminUserById(id: string): Promise<AdminUserDTO | null>;
    getAdminUserByUsername(username: string): Promise<AdminUserDTO | null>;
    isValidSession(userId: string): Promise<boolean>;
}

@injectable()
export class AdminAuthServiceImpl implements AdminAuthService {
    private readonly bcryptRounds: number;

    constructor(
        @inject(TYPES.PrismaClient) private prisma: PrismaClient
    ) {
        this.bcryptRounds = parseInt(process.env.ADMIN_BCRYPT_ROUNDS || '12', 10);
    }

    async authenticateUser(loginData: AdminLoginDTO): Promise<AdminUserDTO | null> {
        try {
            const adminUser = await this.prisma.adminUser.findUnique({
                where: { username: loginData.username }
            });

            if (!adminUser || !adminUser.isActive) {
                return null;
            }

            const isPasswordValid = await this.verifyPassword(loginData.password, adminUser.passwordHash);
            if (!isPasswordValid) {
                return null;
            }

            return this.mapToDTO(adminUser);
        } catch (error) {
            throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async createAdminUser(userData: CreateAdminUserDTO): Promise<AdminUserDTO> {
        try {
            const hashedPassword = await this.hashPassword(userData.password);

            const adminUser = await this.prisma.adminUser.create({
                data: {
                    username: userData.username,
                    email: userData.email,
                    passwordHash: hashedPassword,
                    role: userData.role || AdminRole.ADMIN,
                    isActive: userData.isActive !== undefined ? userData.isActive : true,
                }
            });

            return this.mapToDTO(adminUser);
        } catch (error) {
            throw new Error(`Failed to create admin user: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async hashPassword(password: string): Promise<string> {
        try {
            return await bcrypt.hash(password, this.bcryptRounds);
        } catch (error) {
            throw new Error(`Password hashing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async verifyPassword(password: string, hash: string): Promise<boolean> {
        try {
            return await bcrypt.compare(password, hash);
        } catch (error) {
            throw new Error(`Password verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async updateLastLoginAt(userId: string): Promise<void> {
        try {
            await this.prisma.adminUser.update({
                where: { id: userId },
                data: { lastLoginAt: new Date() }
            });
        } catch (error) {
            throw new Error(`Failed to update last login time: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getAdminUserById(id: string): Promise<AdminUserDTO | null> {
        try {
            const adminUser = await this.prisma.adminUser.findUnique({
                where: { id }
            });

            return adminUser ? this.mapToDTO(adminUser) : null;
        } catch (error) {
            throw new Error(`Failed to get admin user by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getAdminUserByUsername(username: string): Promise<AdminUserDTO | null> {
        try {
            const adminUser = await this.prisma.adminUser.findUnique({
                where: { username }
            });

            return adminUser ? this.mapToDTO(adminUser) : null;
        } catch (error) {
            throw new Error(`Failed to get admin user by username: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async isValidSession(userId: string): Promise<boolean> {
        try {
            const adminUser = await this.prisma.adminUser.findUnique({
                where: { id: userId },
                select: { isActive: true }
            });

            return adminUser?.isActive || false;
        } catch (error) {
            return false;
        }
    }

    private mapToDTO(adminUser: any): AdminUserDTO {
        return {
            id: adminUser.id,
            username: adminUser.username,
            email: adminUser.email,
            role: adminUser.role as AdminRole,
            isActive: adminUser.isActive,
            lastLoginAt: adminUser.lastLoginAt,
            createdAt: adminUser.createdAt,
            updatedAt: adminUser.updatedAt
        };
    }
} 