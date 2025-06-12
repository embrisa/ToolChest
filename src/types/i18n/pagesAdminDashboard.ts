import { z } from "zod";

/**
 * Canonical schema for `pages.admin.dashboard` translation namespace.
 */
export const PagesAdminDashboardSchema = z
    .object({
        title: z.string(),
        description: z.string(),
        stats: z.object({
            totalTools: z.string(),
            totalTags: z.string(),
            totalUsage: z.string(),
            thisMonth: z.string(),
            applicationStats: z.string(),
        }),
        usage: z.object({
            title: z.string(),
            table: z.object({
                tool: z.string(),
                usageCount: z.string(),
                change: z.string(),
                actions: z.string(),
            }),
        }),
        quickActions: z.object({
            title: z.string(),
            viewAnalytics: z.string(),
            manageTools: z.string(),
            manageTags: z.string(),
            viewSite: z.string(),
            systemHealth: z.string(),
            addTool: z.string(),
            addTag: z.string(),
            manageRelationships: z.string(),
            createToolDescription: z.string(),
            createTagDescription: z.string(),
            manageRelationshipsDescription: z.string(),
            viewSiteDescription: z.string(),
        }),
    })
    .strict();

export type PagesAdminDashboardMessages = z.infer<
    typeof PagesAdminDashboardSchema
>; 