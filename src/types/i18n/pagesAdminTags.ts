import { z } from "zod";

/**
 * Canonical schema for `pages.admin.tags` translation namespace.
 */
export const PagesAdminTagsSchema = z
    .object({
        title: z.string(),
        description: z.string(),
        actions: z.object({
            createTag: z.string(),
            editTag: z.string(),
            deleteTag: z.string(),
            bulkActions: z.string(),
        }),
        table: z.object({
            name: z.string(),
            slug: z.string(),
            color: z.string(),
            toolCount: z.string(),
            description: z.string(),
            actions: z.string(),
        }),
        emptyState: z.object({
            description: z.string(),
        }),
    })
    .strict();

export type PagesAdminTagsMessages = z.infer<typeof PagesAdminTagsSchema>; 