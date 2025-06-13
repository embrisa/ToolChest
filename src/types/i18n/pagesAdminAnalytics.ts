import { z } from "zod";

/**
 * Canonical schema for `pages.admin.analytics` translation namespace.
 * This namespace lives inside messages/pages/admin/<locale>.json
 */
export const PagesAdminAnalyticsSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    charts: z.object({
      usageOverTime: z.string(),
      topTools: z.string(),
      userMetrics: z.string(),
    }),
  })
  .strict();

export type PagesAdminAnalyticsMessages = z.infer<
  typeof PagesAdminAnalyticsSchema
>;
