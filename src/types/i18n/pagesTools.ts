import { z } from "zod";

/**
 * Canonical schema for `pages.tools` translation namespace.
 */
export const PagesToolsSchema = z
  .object({
    page: z.object({
      title: z.string(),
      subtitle: z.string(),
      loading: z.string(),
      toolsAvailable: z.string(),
      availableTools: z.string(),
      description: z.string(),
    }),
    stats: z.object({
      allToolsFree: z.string(),
      clientSideProcessing: z.string(),
    }),
    states: z.object({
      noToolsAvailable: z.string(),
      noToolsDescription: z.string(),
      loadingGrid: z.string(),
    }),
    features: z.object({
      privacy: z.object({
        title: z.string(),
        description: z.string(),
      }),
      free: z.object({
        title: z.string(),
        description: z.string(),
      }),
      fast: z.object({
        title: z.string(),
        description: z.string(),
      }),
    }),
  })
  .strict();

export type PagesToolsMessages = z.infer<typeof PagesToolsSchema>;
