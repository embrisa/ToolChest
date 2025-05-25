import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../config/types';
import { AdminAnalyticsService } from '../services/adminAnalyticsService';
import { AdminAuditService } from '../services/adminAuditService';
import { AdminAuthRequest } from '../middleware/adminAuthMiddleware';

export interface IAdminAnalyticsController {
    showAnalyticsDashboard(req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void>;
    getUsageStatistics(req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void>;
    getToolUsageTrends(req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void>;
    getTagUsageStats(req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void>;
    getUsageByDateRange(req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void>;
    exportAnalyticsData(req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void>;
    showDetailedToolAnalytics(req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void>;
    showDetailedTagAnalytics(req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void>;
}

@injectable()
export class AdminAnalyticsControllerImpl implements IAdminAnalyticsController {
    constructor(
        @inject(TYPES.AdminAnalyticsService) private analyticsService: AdminAnalyticsService,
        @inject(TYPES.AdminAuditService) private auditService: AdminAuditService
    ) { }

    async showAnalyticsDashboard(req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const dashboardMetrics = await this.analyticsService.getDashboardMetrics();

            res.render('admin/pages/analytics/dashboard', {
                title: 'Analytics Dashboard',
                layout: 'layouts/admin-layout',
                adminUser: req.adminUser,
                currentPath: req.path,
                breadcrumbs: [
                    { label: 'Dashboard', url: '/admin/dashboard' },
                    { label: 'Analytics', url: '/admin/analytics' }
                ],
                metrics: dashboardMetrics,
            });
        } catch (error) {
            next(error);
        }
    }

    async getUsageStatistics(req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const usageStats = await this.analyticsService.getUsageStatistics();

            if (req.headers['hx-request']) {
                res.render('admin/components/usage-statistics', { stats: usageStats });
            } else {
                res.json(usageStats);
            }
        } catch (error) {
            next(error);
        }
    }

    async getToolUsageTrends(req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const days = parseInt(req.query.days as string) || 30;
            const toolUsageTrends = await this.analyticsService.getToolUsageTrends(days);

            if (req.headers['hx-request']) {
                res.render('admin/components/tool-usage-trends', {
                    trends: toolUsageTrends,
                    days
                });
            } else {
                res.json(toolUsageTrends);
            }
        } catch (error) {
            next(error);
        }
    }

    async getTagUsageStats(req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const tagUsageStats = await this.analyticsService.getTagUsageStats();

            if (req.headers['hx-request']) {
                res.render('admin/components/tag-usage-stats', { tagStats: tagUsageStats });
            } else {
                res.json(tagUsageStats);
            }
        } catch (error) {
            next(error);
        }
    }

    async getUsageByDateRange(req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();

            const usageData = await this.analyticsService.getUsageByDateRange(startDate, endDate);

            // Log the analytics access
            await this.auditService.logAction({
                adminUserId: req.adminUser!.id,
                action: 'VIEW_ANALYTICS',
                tableName: 'Analytics',
                recordId: 'date-range-usage',
                newValues: { startDate, endDate, resultCount: usageData.length },
                ipAddress: req.ip || 'unknown',
                userAgent: req.get('User-Agent') || 'unknown',
            });

            if (req.headers['hx-request']) {
                res.render('admin/components/date-range-usage', {
                    usageData,
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0]
                });
            } else {
                res.json(usageData);
            }
        } catch (error) {
            next(error);
        }
    }

    async exportAnalyticsData(req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const format = req.query.format as string || 'json';
            const type = req.query.type as string || 'overview';

            let data: any;
            let filename: string;

            switch (type) {
                case 'overview':
                    data = await this.analyticsService.getDashboardMetrics();
                    filename = `analytics-overview-${new Date().toISOString().split('T')[0]}`;
                    break;
                case 'tools':
                    data = await this.analyticsService.getToolUsageTrends();
                    filename = `tool-usage-trends-${new Date().toISOString().split('T')[0]}`;
                    break;
                case 'tags':
                    data = await this.analyticsService.getTagUsageStats();
                    filename = `tag-usage-stats-${new Date().toISOString().split('T')[0]}`;
                    break;
                default:
                    data = await this.analyticsService.getUsageStatistics();
                    filename = `usage-statistics-${new Date().toISOString().split('T')[0]}`;
            }

            // Log the export action
            await this.auditService.logAction({
                adminUserId: req.adminUser!.id,
                action: 'EXPORT_ANALYTICS',
                tableName: 'Analytics',
                recordId: `export-${type}`,
                newValues: { format, type, filename },
                ipAddress: req.ip || 'unknown',
                userAgent: req.get('User-Agent') || 'unknown',
            });

            if (format === 'csv') {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
                res.send(this.convertToCSV(data));
            } else {
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
                res.json(data);
            }
        } catch (error) {
            next(error);
        }
    }

    async showDetailedToolAnalytics(req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const days = parseInt(req.query.days as string) || 30;
            const [toolTrends, topTools] = await Promise.all([
                this.analyticsService.getToolUsageTrends(days),
                this.analyticsService.getTopToolsByUsage(20)
            ]);

            res.render('admin/pages/analytics/tools', {
                title: 'Tool Analytics',
                layout: 'layouts/admin-layout',
                adminUser: req.adminUser,
                currentPath: req.path,
                breadcrumbs: [
                    { label: 'Dashboard', url: '/admin/dashboard' },
                    { label: 'Analytics', url: '/admin/analytics' },
                    { label: 'Tools', url: '/admin/analytics/tools' }
                ],
                toolTrends,
                topTools,
                days
            });
        } catch (error) {
            next(error);
        }
    }

    async showDetailedTagAnalytics(req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const [tagStats, topTags] = await Promise.all([
                this.analyticsService.getTagUsageStats(),
                this.analyticsService.getTopTagsByUsage(20)
            ]);

            res.render('admin/pages/analytics/tags', {
                title: 'Tag Analytics',
                layout: 'layouts/admin-layout',
                adminUser: req.adminUser,
                currentPath: req.path,
                breadcrumbs: [
                    { label: 'Dashboard', url: '/admin/dashboard' },
                    { label: 'Analytics', url: '/admin/analytics' },
                    { label: 'Tags', url: '/admin/analytics/tags' }
                ],
                tagStats,
                topTags
            });
        } catch (error) {
            next(error);
        }
    }

    private convertToCSV(data: any): string {
        if (!data || typeof data !== 'object') {
            return '';
        }

        // Handle different data structures
        if (Array.isArray(data)) {
            if (data.length === 0) return '';

            const headers = Object.keys(data[0]);
            const csvHeaders = headers.join(',');
            const csvRows = data.map(row =>
                headers.map(header => {
                    const value = row[header];
                    if (value === null || value === undefined) return '';
                    if (typeof value === 'string' && value.includes(',')) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                }).join(',')
            );

            return [csvHeaders, ...csvRows].join('\n');
        } else {
            // Convert object to key-value CSV
            const entries = Object.entries(data);
            return entries.map(([key, value]) => `"${key}","${value}"`).join('\n');
        }
    }
} 