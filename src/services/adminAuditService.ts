import { injectable, inject } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { TYPES } from '../config/types';
import { AdminAuditLogDTO, CreateAdminAuditLogDTO } from '../dto/adminAuditLogDTO';

export interface AdminAuditService {
    logAction(auditData: CreateAdminAuditLogDTO): Promise<AdminAuditLogDTO>;
    getAuditLogs(limit?: number, offset?: number): Promise<AdminAuditLogDTO[]>;
    getAuditLogsByUser(adminUserId: string, limit?: number, offset?: number): Promise<AdminAuditLogDTO[]>;
    getAuditLogsByTable(tableName: string, limit?: number, offset?: number): Promise<AdminAuditLogDTO[]>;
}

@injectable()
export class AdminAuditServiceImpl implements AdminAuditService {
    constructor(
        @inject(TYPES.PrismaClient) private prisma: PrismaClient
    ) { }

    async logAction(auditData: CreateAdminAuditLogDTO): Promise<AdminAuditLogDTO> {
        try {
            const auditLog = await this.prisma.adminAuditLog.create({
                data: {
                    adminUserId: auditData.adminUserId,
                    action: auditData.action,
                    tableName: auditData.tableName,
                    recordId: auditData.recordId,
                    oldValues: auditData.oldValues,
                    newValues: auditData.newValues,
                    ipAddress: auditData.ipAddress,
                    userAgent: auditData.userAgent,
                },
                include: {
                    adminUser: {
                        select: {
                            username: true
                        }
                    }
                }
            });

            return this.mapToDTO(auditLog);
        } catch (error) {
            throw new Error(`Failed to log audit action: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getAuditLogs(limit: number = 50, offset: number = 0): Promise<AdminAuditLogDTO[]> {
        try {
            const auditLogs = await this.prisma.adminAuditLog.findMany({
                include: {
                    adminUser: {
                        select: {
                            username: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: offset,
                take: limit
            });

            return auditLogs.map(log => this.mapToDTO(log));
        } catch (error) {
            throw new Error(`Failed to get audit logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getAuditLogsByUser(adminUserId: string, limit: number = 50, offset: number = 0): Promise<AdminAuditLogDTO[]> {
        try {
            const auditLogs = await this.prisma.adminAuditLog.findMany({
                where: { adminUserId },
                include: {
                    adminUser: {
                        select: {
                            username: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: offset,
                take: limit
            });

            return auditLogs.map(log => this.mapToDTO(log));
        } catch (error) {
            throw new Error(`Failed to get audit logs by user: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getAuditLogsByTable(tableName: string, limit: number = 50, offset: number = 0): Promise<AdminAuditLogDTO[]> {
        try {
            const auditLogs = await this.prisma.adminAuditLog.findMany({
                where: { tableName },
                include: {
                    adminUser: {
                        select: {
                            username: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: offset,
                take: limit
            });

            return auditLogs.map(log => this.mapToDTO(log));
        } catch (error) {
            throw new Error(`Failed to get audit logs by table: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private mapToDTO(auditLog: any): AdminAuditLogDTO {
        return {
            id: auditLog.id,
            adminUserId: auditLog.adminUserId,
            adminUsername: auditLog.adminUser?.username,
            action: auditLog.action,
            tableName: auditLog.tableName,
            recordId: auditLog.recordId,
            oldValues: auditLog.oldValues as Record<string, any>,
            newValues: auditLog.newValues as Record<string, any>,
            ipAddress: auditLog.ipAddress,
            userAgent: auditLog.userAgent,
            createdAt: auditLog.createdAt
        };
    }
} 