import { z } from "zod";

/**
 * Canonical schema for `pages.admin.loading` translation namespace.
 */
export const PagesAdminLoadingSchema = z
    .object({
        panel: z.string(),
        dashboard: z.string(),
        analytics: z.string(),
    })
    .strict();

export type PagesAdminLoadingMessages = z.infer<
    typeof PagesAdminLoadingSchema
>; 