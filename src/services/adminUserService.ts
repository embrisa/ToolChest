import { injectable, inject } from 'inversify';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { TYPES } from '../config/types';
import { AdminUserDTO, CreateAdminUserDTO, UpdateAdminUserDTO, AdminRole } from '../dto/adminUserDTO';
import { AdminAuditService } from './adminAuditService';

export interface AdminUserService {
    getAllUsers(): Promise<AdminUserDTO[]>;
    getUserById(id: string): Promise<AdminUserDTO | null>;
    getUserByUsername(username: string): Promise<AdminUserDTO | null>;
    getUserByEmail(email: string): Promise<AdminUserDTO | null>;
    createUser(data: CreateAdminUserDTO, adminUserId: string, ipAddress: string, userAgent: string): Promise<AdminUserDTO>;
    updateUser(id: string, data: UpdateAdminUserDTO, adminUserId: string, ipAddress: string, userAgent: string): Promise<AdminUserDTO>;
    deleteUser(id: string, adminUserId: string, ipAddress: string, userAgent: string): Promise<void>;
    toggleUserStatus(id: string, adminUserId: string, ipAddress: string, userAgent: string): Promise<AdminUserDTO>;
    getUsersWithPagination(page: number, limit: number, search?: string, role?: AdminRole, isActive?: boolean): Promise<{ users: AdminUserDTO[], total: number, totalPages: number }>;
    changePassword(id: string, newPassword: string, adminUserId: string, ipAddress: string, userAgent: string): Promise<void>;
    getUsersStats(): Promise<{ total: number, active: number, inactive: number, byRole: Record<AdminRole, number> }>;
}

@injectable()
export class AdminUserServiceImpl implements AdminUserService {
    private readonly bcryptRounds: number;

    constructor(
        @inject(TYPES.PrismaClient) private prisma: PrismaClient,
        @inject(TYPES.AdminAuditService) private auditService: AdminAuditService
    ) {
        this.bcryptRounds = parseInt(process.env.ADMIN_BCRYPT_ROUNDS || '12', 10);
    }

    async getAllUsers(): Promise<AdminUserDTO[]> {
        try {
            const users = await this.prisma.adminUser.findMany({
                orderBy: { createdAt: 'desc' }
            });

            return users.map(user => this.mapToDTO(user));
        } catch (error) {
            throw new Error(`Failed to get admin users: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getUserById(id: string): Promise<AdminUserDTO | null> {
        try {
            const user = await this.prisma.adminUser.findUnique({
                where: { id }
            });

            return user ? this.mapToDTO(user) : null;
        } catch (error) {
            throw new Error(`Failed to get admin user by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getUserByUsername(username: string): Promise<AdminUserDTO | null> {
        try {
            const user = await this.prisma.adminUser.findUnique({
                where: { username }
            });

            return user ? this.mapToDTO(user) : null;
        } catch (error) {
            throw new Error(`Failed to get admin user by username: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getUserByEmail(email: string): Promise<AdminUserDTO | null> {
        try {
            const user = await this.prisma.adminUser.findUnique({
                where: { email }
            });

            return user ? this.mapToDTO(user) : null;
        } catch (error) {
            throw new Error(`Failed to get admin user by email: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async createUser(
        data: CreateAdminUserDTO,
        adminUserId: string,
        ipAddress: string,
        userAgent: string
    ): Promise<AdminUserDTO> {
        try {
            // Check for existing username
            const existingUsername = await this.getUserByUsername(data.username);
            if (existingUsername) {
                throw new Error('Username already exists');
            }

            // Check for existing email
            const existingEmail = await this.getUserByEmail(data.email);
            if (existingEmail) {
                throw new Error('Email already exists');
            }

            // Hash password
            const hashedPassword = await this.hashPassword(data.password);

            // Create user
            const user = await this.prisma.adminUser.create({
                data: {
                    username: data.username,
                    email: data.email,
                    passwordHash: hashedPassword,
                    role: data.role || AdminRole.ADMIN,
                    isActive: data.isActive !== undefined ? data.isActive : true,
                }
            });

            // Log the action
            await this.auditService.logAction({
                adminUserId,
                action: 'CREATE',
                tableName: 'AdminUser',
                recordId: user.id,
                newValues: this.sanitizeForAudit(user),
                ipAddress,
                userAgent
            });

            return this.mapToDTO(user);
        } catch (error) {
            throw new Error(`Failed to create admin user: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async updateUser(
        id: string,
        data: UpdateAdminUserDTO,
        adminUserId: string,
        ipAddress: string,
        userAgent: string
    ): Promise<AdminUserDTO> {
        try {
            // Get existing user for audit log
            const existingUser = await this.prisma.adminUser.findUnique({
                where: { id }
            });

            if (!existingUser) {
                throw new Error('User not found');
            }

            // Check for unique constraints if username or email is being updated
            if (data.username && data.username !== existingUser.username) {
                const existingUsername = await this.getUserByUsername(data.username);
                if (existingUsername && existingUsername.id !== id) {
                    throw new Error('Username already exists');
                }
            }

            if (data.email && data.email !== existingUser.email) {
                const existingEmail = await this.getUserByEmail(data.email);
                if (existingEmail && existingEmail.id !== id) {
                    throw new Error('Email already exists');
                }
            }

            // Prepare update data
            const updateData: any = {};
            if (data.username !== undefined) updateData.username = data.username;
            if (data.email !== undefined) updateData.email = data.email;
            if (data.role !== undefined) updateData.role = data.role;
            if (data.isActive !== undefined) updateData.isActive = data.isActive;

            // Hash new password if provided
            if (data.password) {
                updateData.passwordHash = await this.hashPassword(data.password);
            }

            // Update user
            const updatedUser = await this.prisma.adminUser.update({
                where: { id },
                data: updateData
            });

            // Log the action
            await this.auditService.logAction({
                adminUserId,
                action: 'UPDATE',
                tableName: 'AdminUser',
                recordId: id,
                oldValues: this.sanitizeForAudit(existingUser),
                newValues: this.sanitizeForAudit(updatedUser),
                ipAddress,
                userAgent
            });

            return this.mapToDTO(updatedUser);
        } catch (error) {
            throw new Error(`Failed to update admin user: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async deleteUser(
        id: string,
        adminUserId: string,
        ipAddress: string,
        userAgent: string
    ): Promise<void> {
        try {
            // Prevent self-deletion
            if (id === adminUserId) {
                throw new Error('Cannot delete your own account');
            }

            // Get existing user for audit log
            const existingUser = await this.prisma.adminUser.findUnique({
                where: { id }
            });

            if (!existingUser) {
                throw new Error('User not found');
            }

            // Check if this is the last super admin
            if (existingUser.role === AdminRole.SUPER_ADMIN) {
                const superAdminCount = await this.prisma.adminUser.count({
                    where: {
                        role: AdminRole.SUPER_ADMIN,
                        isActive: true,
                        id: { not: id }
                    }
                });

                if (superAdminCount === 0) {
                    throw new Error('Cannot delete the last active super admin');
                }
            }

            // Delete related audit logs first
            await this.prisma.adminAuditLog.deleteMany({
                where: { adminUserId: id }
            });

            // Delete the user
            await this.prisma.adminUser.delete({
                where: { id }
            });

            // Log the action
            await this.auditService.logAction({
                adminUserId,
                action: 'DELETE',
                tableName: 'AdminUser',
                recordId: id,
                oldValues: this.sanitizeForAudit(existingUser),
                ipAddress,
                userAgent
            });
        } catch (error) {
            throw new Error(`Failed to delete admin user: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async toggleUserStatus(
        id: string,
        adminUserId: string,
        ipAddress: string,
        userAgent: string
    ): Promise<AdminUserDTO> {
        try {
            // Prevent self-deactivation
            if (id === adminUserId) {
                throw new Error('Cannot deactivate your own account');
            }

            const existingUser = await this.getUserById(id);
            if (!existingUser) {
                throw new Error('User not found');
            }

            // Check if this is the last active super admin being deactivated
            if (existingUser.role === AdminRole.SUPER_ADMIN && existingUser.isActive) {
                const activeSuperAdminCount = await this.prisma.adminUser.count({
                    where: {
                        role: AdminRole.SUPER_ADMIN,
                        isActive: true,
                        id: { not: id }
                    }
                });

                if (activeSuperAdminCount === 0) {
                    throw new Error('Cannot deactivate the last active super admin');
                }
            }

            return this.updateUser(
                id,
                { isActive: !existingUser.isActive },
                adminUserId,
                ipAddress,
                userAgent
            );
        } catch (error) {
            throw new Error(`Failed to toggle user status: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getUsersWithPagination(
        page: number,
        limit: number,
        search?: string,
        role?: AdminRole,
        isActive?: boolean
    ): Promise<{ users: AdminUserDTO[], total: number, totalPages: number }> {
        try {
            const offset = (page - 1) * limit;

            // Build where clause
            const where: any = {};

            if (search) {
                where.OR = [
                    { username: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } }
                ];
            }

            if (role) {
                where.role = role;
            }

            if (isActive !== undefined) {
                where.isActive = isActive;
            }

            // Get total count
            const total = await this.prisma.adminUser.count({ where });

            // Get users
            const users = await this.prisma.adminUser.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: offset,
                take: limit
            });

            const totalPages = Math.ceil(total / limit);

            return {
                users: users.map(user => this.mapToDTO(user)),
                total,
                totalPages
            };
        } catch (error) {
            throw new Error(`Failed to get users with pagination: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async changePassword(
        id: string,
        newPassword: string,
        adminUserId: string,
        ipAddress: string,
        userAgent: string
    ): Promise<void> {
        try {
            const existingUser = await this.getUserById(id);
            if (!existingUser) {
                throw new Error('User not found');
            }

            await this.updateUser(
                id,
                { password: newPassword },
                adminUserId,
                ipAddress,
                userAgent
            );
        } catch (error) {
            throw new Error(`Failed to change password: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getUsersStats(): Promise<{ total: number, active: number, inactive: number, byRole: Record<AdminRole, number> }> {
        try {
            const [total, active, roleStats] = await Promise.all([
                this.prisma.adminUser.count(),
                this.prisma.adminUser.count({ where: { isActive: true } }),
                this.prisma.adminUser.groupBy({
                    by: ['role'],
                    _count: { _all: true }
                })
            ]);

            const byRole: Record<AdminRole, number> = {
                [AdminRole.SUPER_ADMIN]: 0,
                [AdminRole.ADMIN]: 0,
                [AdminRole.READ_ONLY]: 0
            };

            roleStats.forEach(stat => {
                byRole[stat.role as AdminRole] = stat._count._all;
            });

            return {
                total,
                active,
                inactive: total - active,
                byRole
            };
        } catch (error) {
            throw new Error(`Failed to get user statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, this.bcryptRounds);
    }

    private mapToDTO(user: any): AdminUserDTO {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role as AdminRole,
            isActive: user.isActive,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }

    private sanitizeForAudit(user: any): any {
        const { passwordHash, ...sanitized } = user;
        return sanitized;
    }
} 