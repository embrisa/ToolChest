import { z } from "zod";

/**
 * Canonical schema for `pages.admin.navigation` translation namespace.
 */
export const PagesAdminNavigationSchema = z
    .object({
        dashboard: z.string(),
        tools: z.string(),
        tags: z.string(),
        relationships: z.string(),
        analytics: z.string(),
        monitoring: z.string(),
        logout: z.string(),
        viewSite: z.string(),
    })
    .strict();

export type PagesAdminNavigationMessages = z.infer<
    typeof PagesAdminNavigationSchema
>; 