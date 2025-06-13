import { z } from "zod";

/**
 * Canonical schema for `pages.admin.auth` translation namespace.
 */
export const PagesAdminAuthSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    form: z.object({
      token: z.string(),
      tokenPlaceholder: z.string(),
      login: z.string(),
      loginError: z.string(),
    }),
  })
  .strict();

export type PagesAdminAuthMessages = z.infer<typeof PagesAdminAuthSchema>;
