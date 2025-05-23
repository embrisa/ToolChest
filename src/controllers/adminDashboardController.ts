import { Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../config/types';
import { ToolService } from '../services/toolService';
import { AdminToolService } from '../services/adminToolService';
import { AdminTagService } from '../services/adminTagService';
import { AdminAuthRequest } from '../middleware/adminAuthMiddleware';
import { DashboardMetricsDTO } from '../dto/adminAuditLogDTO';

@injectable()
export class AdminDashboardController {
    constructor(
        @inject(TYPES.ToolService) private toolService: ToolService,
        @inject(TYPES.AdminToolService) private adminToolService: AdminToolService,
        @inject(TYPES.AdminTagService) private adminTagService: AdminTagService
    ) { }

    // GET /admin/dashboard - Show main dashboard
    showDashboard = async (req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Get basic metrics for dashboard
            const metrics = await this.getDashboardMetrics();

            res.render('admin/pages/dashboard', {
                title: 'Admin Dashboard - ToolChest',
                layout: 'layouts/admin-layout',
                adminUser: req.adminUser,
                currentPath: req.path,
                metrics
            });
        } catch (error) {
            next(error);
        }
    };

    private async getDashboardMetrics(): Promise<DashboardMetricsDTO> {
        try {
            // Get metrics from admin services
            const [allTools, allTags] = await Promise.all([
                this.adminToolService.getAllToolsForAdmin(),
                this.adminTagService.getAllTagsForAdmin()
            ]);

            const activeTools = allTools.filter(tool => tool.isActive);
            const totalUsage = allTools.reduce((sum, tool) => sum + (tool.usageCount || 0), 0);

            return {
                totalActiveTools: activeTools.length,
                totalTags: allTags.length,
                recentToolUsage: totalUsage,
                systemHealth: 'healthy' as const
            };
        } catch (error) {
            console.error('Error getting dashboard metrics:', error);
            return {
                totalActiveTools: 0,
                totalTags: 0,
                recentToolUsage: 0,
                systemHealth: 'error' as const
            };
        }
    }
} 