export interface AdminAuditLogDTO {
    id: string;
    adminUserId: string;
    adminUsername?: string;
    action: string;
    tableName: string;
    recordId: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    ipAddress: string;
    userAgent: string;
    createdAt: Date;
}

export interface CreateAdminAuditLogDTO {
    adminUserId: string;
    action: string;
    tableName: string;
    recordId: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    ipAddress: string;
    userAgent: string;
}

export interface DashboardMetricsDTO {
    totalActiveTools: number;
    totalTags: number;
    recentToolUsage: number;
    systemHealth: 'healthy' | 'warning' | 'error';
} 