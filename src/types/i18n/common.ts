import { z } from "zod";

// A reusable schema for sections in `tools.*.info` objects.
// Every section has an optional `title` (some sections like `features` omit it)
// and an `items` array of strings.
export const ItemsSectionSchema = z.object({
  title: z.string().optional(),
  items: z.array(z.string()),
});

export type ItemsSection = z.infer<typeof ItemsSectionSchema>;

/**
 * Canonical schema for `common` translation namespace (messages/common/<locale>.json).
 * At this granularity we only freeze the top-level categories; sub-entries may vary so
 * we allow free-form string values through `z.record(z.string())`.
 */
export const CommonMessagesSchema = z
  .object({
    actions: z.record(z.string()),
    ui: z.object({
      status: z.record(z.string()),
      actions: z.record(z.string()).optional(),
      confirmations: z.record(z.string()).optional(),
      labels: z.record(z.string()).optional(),
    }),
    status: z.record(z.string()),
    validation: z.record(z.string()),
    errors: z.record(z.string()),
    navigation: z.record(z.string()),
    time: z.record(z.string()),
    units: z.record(z.string()),
    privacy: z.record(z.string()),
  })
  .strict();

export type CommonMessages = z.infer<typeof CommonMessagesSchema>;
