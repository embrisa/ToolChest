import { Response, NextFunction } from 'express';
import { AdminAuthRequest } from './adminAuthMiddleware';
import { appContainer } from '../config/inversify.config';
import { AdminAuditService } from '../services/adminAuditService';
import { TYPES } from '../config/types';

export interface AuditableRequest extends AdminAuthRequest {
    auditData?: {
        action: string;
        tableName: string;
        recordId: string;
        oldValues?: Record<string, any>;
        newValues?: Record<string, any>;
    };
}

export const adminAuditMiddleware = (action: string, tableName: string) => {
    return async (req: AuditableRequest, res: Response, next: NextFunction): Promise<void> => {
        // Store original json method
        const originalJson = res.json;
        const originalSend = res.send;

        // Override response methods to capture audit data after request completion
        res.json = function (data: any) {
            // Log audit action if request was successful
            if (res.statusCode < 400 && req.adminUser && req.auditData) {
                setImmediate(async () => {
                    try {
                        const auditService = appContainer.get<AdminAuditService>(TYPES.AdminAuditService);
                        await auditService.logAction({
                            adminUserId: req.adminUser!.id,
                            action: req.auditData!.action,
                            tableName: req.auditData!.tableName,
                            recordId: req.auditData!.recordId,
                            oldValues: req.auditData!.oldValues,
                            newValues: req.auditData!.newValues,
                            ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
                            userAgent: req.get('User-Agent') || 'unknown'
                        });
                    } catch (error) {
                        console.error('Failed to log audit action:', error);
                    }
                });
            }
            return originalJson.call(this, data);
        };

        res.send = function (data: any) {
            // Log audit action if request was successful
            if (res.statusCode < 400 && req.adminUser && req.auditData) {
                setImmediate(async () => {
                    try {
                        const auditService = appContainer.get<AdminAuditService>(TYPES.AdminAuditService);
                        await auditService.logAction({
                            adminUserId: req.adminUser!.id,
                            action: req.auditData!.action,
                            tableName: req.auditData!.tableName,
                            recordId: req.auditData!.recordId,
                            oldValues: req.auditData!.oldValues,
                            newValues: req.auditData!.newValues,
                            ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
                            userAgent: req.get('User-Agent') || 'unknown'
                        });
                    } catch (error) {
                        console.error('Failed to log audit action:', error);
                    }
                });
            }
            return originalSend.call(this, data);
        };

        // Set default audit data
        req.auditData = {
            action,
            tableName,
            recordId: 'unknown',
            oldValues: undefined,
            newValues: undefined
        };

        next();
    };
};

// Helper function to set audit data in controllers
export const setAuditData = (
    req: AuditableRequest,
    recordId: string,
    newValues?: Record<string, any>,
    oldValues?: Record<string, any>
): void => {
    if (req.auditData) {
        req.auditData.recordId = recordId;
        req.auditData.newValues = newValues;
        req.auditData.oldValues = oldValues;
    }
}; 