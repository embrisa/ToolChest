import { z } from "zod";

/**
 * Canonical schema for `tools.common` translation namespace – shared UI strings across tool pages.
 */
export const ToolsCommonSchema = z
  .object({
    ui: z.object({
      modes: z.record(z.string()),
      inputTypes: z.record(z.string()),
      actions: z.record(z.string()),
      status: z.record(z.string()),
      placeholders: z.record(z.string()),
    }),
    validation: z.record(z.string()),
    privacy: z.record(z.string()),
    features: z.record(z.string()),
    errors: z.record(z.string()),
  })
  .strict();

export type ToolsCommonMessages = z.infer<typeof ToolsCommonSchema>;
