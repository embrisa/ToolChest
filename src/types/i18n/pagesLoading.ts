import { z } from "zod";

/**
 * Canonical schema for `pages.loading` translation namespace.
 */
export const PagesLoadingSchema = z
  .object({
    page: z.object({
      message: z.string(),
      application: z.string(),
      pleaseWait: z.string(),
    }),
    components: z.object({
      tools: z.string(),
      tags: z.string(),
      search: z.string(),
      processing: z.string(),
      saving: z.string(),
      uploading: z.string(),
    }),
    admin: z.object({
      panel: z.string(),
      dashboard: z.string(),
      analytics: z.string(),
    }),
    skeleton: z.object({
      toolCard: z.string(),
      toolGrid: z.string(),
      tagFilters: z.string(),
    }),
  })
  .strict();

export type PagesLoadingMessages = z.infer<typeof PagesLoadingSchema>;
