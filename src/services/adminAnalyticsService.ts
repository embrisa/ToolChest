import { injectable, inject } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { TYPES } from '../config/types';

export interface UsageStatistics {
    totalTools: number;
    activeTools: number;
    inactiveTools: number;
    totalTags: number;
    tagsInUse: number;
    totalUsage: number;
    averageUsagePerTool: number;
    toolsWithoutTags: number;
    averageTagsPerTool: number;
}

export interface ToolUsageTrend {
    toolId: string;
    toolName: string;
    slug: string;
    iconClass: string | null;
    totalUsage: number;
    dailyUsage: Array<{
        date: string;
        usage: number;
    }>;
}

export interface TagUsageStats {
    tagId: string;
    tagName: string;
    color: string | null;
    toolCount: number;
    totalUsage: number;
    tools: Array<{
        toolId: string;
        toolName: string;
        usage: number;
    }>;
}

export interface DashboardMetrics {
    overview: UsageStatistics;
    topTools: Array<{
        id: string;
        name: string;
        slug: string;
        iconClass: string | null;
        totalUsage: number;
        isActive: boolean;
    }>;
    topTags: Array<{
        id: string;
        name: string;
        color: string | null;
        toolCount: number;
        totalUsage: number;
    }>;
    recentActivity: Array<{
        date: string;
        totalUsage: number;
        uniqueTools: number;
    }>;
    usageTrends: Array<{
        date: string;
        usage: number;
    }>;
}

export interface AdminAnalyticsService {
    getDashboardMetrics(): Promise<DashboardMetrics>;
    getUsageStatistics(): Promise<UsageStatistics>;
    getToolUsageTrends(days?: number): Promise<ToolUsageTrend[]>;
    getTagUsageStats(): Promise<TagUsageStats[]>;
    getUsageByDateRange(startDate: Date, endDate: Date): Promise<Array<{ date: string; usage: number; uniqueTools: number }>>;
    getTopToolsByUsage(limit?: number): Promise<Array<{ id: string; name: string; slug: string; iconClass: string | null; totalUsage: number; isActive: boolean }>>;
    getTopTagsByUsage(limit?: number): Promise<Array<{ id: string; name: string; color: string | null; toolCount: number; totalUsage: number }>>;
}

@injectable()
export class AdminAnalyticsServiceImpl implements AdminAnalyticsService {
    constructor(
        @inject(TYPES.PrismaClient) private prisma: PrismaClient
    ) { }

    async getDashboardMetrics(): Promise<DashboardMetrics> {
        const [overview, topTools, topTags, recentActivity, usageTrends] = await Promise.all([
            this.getUsageStatistics(),
            this.getTopToolsByUsage(5),
            this.getTopTagsByUsage(5),
            this.getRecentActivity(7),
            this.getUsageTrends(30)
        ]);

        return {
            overview,
            topTools,
            topTags,
            recentActivity,
            usageTrends
        };
    }

    async getUsageStatistics(): Promise<UsageStatistics> {
        const [
            totalTools,
            activeTools,
            totalTags,
            tagsInUse,
            toolsWithoutTags,
            usageStats,
            tagAssignments
        ] = await Promise.all([
            this.prisma.tool.count(),
            this.prisma.tool.count({ where: { isActive: true } }),
            this.prisma.tag.count(),
            this.prisma.tag.count({
                where: {
                    tools: {
                        some: {}
                    }
                }
            }),
            this.prisma.tool.count({
                where: {
                    tags: {
                        none: {}
                    }
                }
            }),
            this.prisma.toolUsageStats.aggregate({
                _sum: { usageCount: true },
                _count: true
            }),
            this.prisma.toolTag.count()
        ]);

        const totalUsage = usageStats._sum.usageCount || 0;
        const averageUsagePerTool = totalTools > 0 ? totalUsage / totalTools : 0;
        const averageTagsPerTool = totalTools > 0 ? tagAssignments / totalTools : 0;

        return {
            totalTools,
            activeTools,
            inactiveTools: totalTools - activeTools,
            totalTags,
            tagsInUse,
            totalUsage,
            averageUsagePerTool: Math.round(averageUsagePerTool * 100) / 100,
            toolsWithoutTags,
            averageTagsPerTool: Math.round(averageTagsPerTool * 100) / 100
        };
    }

    async getToolUsageTrends(days: number = 30): Promise<ToolUsageTrend[]> {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const tools = await this.prisma.tool.findMany({
            include: {
                toolUsageStats: {
                    where: {
                        lastUsed: {
                            gte: startDate
                        }
                    },
                    orderBy: {
                        lastUsed: 'asc'
                    }
                }
            }
        });

        return tools.map(tool => {
            const dailyUsage = this.aggregateUsageByDay(tool.toolUsageStats, days);
            const totalUsage = tool.toolUsageStats.reduce((sum: number, stat: any) => sum + stat.usageCount, 0);

            return {
                toolId: tool.id,
                toolName: tool.name,
                slug: tool.slug,
                iconClass: tool.iconClass,
                totalUsage,
                dailyUsage
            };
        });
    }

    async getTagUsageStats(): Promise<TagUsageStats[]> {
        const tags = await this.prisma.tag.findMany({
            include: {
                tools: {
                    include: {
                        tool: {
                            include: {
                                toolUsageStats: true
                            }
                        }
                    }
                }
            }
        });

        return tags.map(tag => {
            const tools = tag.tools.map(toolTag => {
                const usage = toolTag.tool.toolUsageStats.reduce((sum, stat) => sum + stat.usageCount, 0);
                return {
                    toolId: toolTag.tool.id,
                    toolName: toolTag.tool.name,
                    usage
                };
            });

            const totalUsage = tools.reduce((sum, tool) => sum + tool.usage, 0);

            return {
                tagId: tag.id,
                tagName: tag.name,
                color: tag.color,
                toolCount: tag.tools.length,
                totalUsage,
                tools: tools.sort((a, b) => b.usage - a.usage)
            };
        });
    }

    async getUsageByDateRange(startDate: Date, endDate: Date): Promise<Array<{ date: string; usage: number; uniqueTools: number }>> {
        const usageStats = await this.prisma.toolUsageStats.findMany({
            where: {
                lastUsed: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                tool: true
            }
        });

        // Group by date
        const dailyStats = new Map<string, { usage: number; tools: Set<string> }>();

        usageStats.forEach(stat => {
            const date = stat.lastUsed.toISOString().split('T')[0];
            if (!dailyStats.has(date)) {
                dailyStats.set(date, { usage: 0, tools: new Set() });
            }
            const dayStats = dailyStats.get(date)!;
            dayStats.usage += stat.usageCount;
            dayStats.tools.add(stat.toolId);
        });

        return Array.from(dailyStats.entries()).map(([date, stats]) => ({
            date,
            usage: stats.usage,
            uniqueTools: stats.tools.size
        })).sort((a, b) => a.date.localeCompare(b.date));
    }

    async getTopToolsByUsage(limit: number = 10): Promise<Array<{ id: string; name: string; slug: string; iconClass: string | null; totalUsage: number; isActive: boolean }>> {
        const tools = await this.prisma.tool.findMany({
            include: {
                toolUsageStats: true
            }
        });

        return tools
            .map(tool => ({
                id: tool.id,
                name: tool.name,
                slug: tool.slug,
                iconClass: tool.iconClass,
                isActive: tool.isActive,
                totalUsage: tool.toolUsageStats.reduce((sum, stat) => sum + stat.usageCount, 0)
            }))
            .sort((a, b) => b.totalUsage - a.totalUsage)
            .slice(0, limit);
    }

    async getTopTagsByUsage(limit: number = 10): Promise<Array<{ id: string; name: string; color: string | null; toolCount: number; totalUsage: number }>> {
        const tagStats = await this.getTagUsageStats();

        return tagStats
            .sort((a, b) => b.totalUsage - a.totalUsage)
            .slice(0, limit)
            .map(tag => ({
                id: tag.tagId,
                name: tag.tagName,
                color: tag.color,
                toolCount: tag.toolCount,
                totalUsage: tag.totalUsage
            }));
    }

    private async getRecentActivity(days: number): Promise<Array<{ date: string; totalUsage: number; uniqueTools: number }>> {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const dailyUsage = await this.getUsageByDateRange(startDate, new Date());
        return dailyUsage.map(day => ({
            date: day.date,
            totalUsage: day.usage,
            uniqueTools: day.uniqueTools
        }));
    }

    private async getUsageTrends(days: number): Promise<Array<{ date: string; usage: number }>> {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const dailyUsage = await this.getUsageByDateRange(startDate, new Date());

        return dailyUsage.map(day => ({
            date: day.date,
            usage: day.usage
        }));
    }

    private aggregateUsageByDay(usageStats: any[], days: number): Array<{ date: string; usage: number }> {
        const dailyUsage = new Map<string, number>();

        // Initialize all days with 0 usage
        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            dailyUsage.set(dateStr, 0);
        }

        // Aggregate actual usage
        usageStats.forEach(stat => {
            const date = stat.lastUsed.toISOString().split('T')[0];
            if (dailyUsage.has(date)) {
                dailyUsage.set(date, dailyUsage.get(date)! + stat.usageCount);
            }
        });

        return Array.from(dailyUsage.entries())
            .map(([date, usage]) => ({ date, usage }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }
} 