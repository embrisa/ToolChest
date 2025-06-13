import { z } from "zod";

/**
 * Canonical schema for `components.layout` translation namespace.
 */
export const ComponentsLayoutSchema = z
  .object({
    header: z.object({
      brand: z.string(),
      navigation: z.record(z.string()),
      mobile: z.object({
        toggleMenu: z.string(),
        openMenu: z.string(),
        closeMenu: z.string(),
      }),
    }),
    footer: z.object({
      copyright: z.string(),
      links: z.record(z.string()),
      description: z.string(),
    }),
    breadcrumbs: z.record(z.string()),
    localeSwitcher: z.object({
      label: z.string(),
      current: z.string(),
      selectLanguage: z.string(),
      languages: z.record(z.string()),
    }),
  })
  .strict();

export type ComponentsLayoutMessages = z.infer<typeof ComponentsLayoutSchema>;
