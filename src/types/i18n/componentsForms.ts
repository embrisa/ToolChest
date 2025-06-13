import { z } from "zod";

/**
 * Canonical schema for `components.forms` translation namespace.
 */
export const ComponentsFormsSchema = z
  .object({
    labels: z.record(z.string()),
    placeholders: z.record(z.string()),
    validation: z.record(z.string()),
    help: z.record(z.string()),
    actions: z.record(z.string()),
    states: z.record(z.string()),
  })
  .strict();

export type ComponentsFormsMessages = z.infer<typeof ComponentsFormsSchema>;
