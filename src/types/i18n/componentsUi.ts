import { z } from "zod";

/**
 * Canonical schema for `components.ui` translation namespace.
 * We ensure category names exist; internal keys are flexible via record.
 */
export const ComponentsUiSchema = z
    .object({
        buttons: z.record(z.string()),
        alerts: z.record(z.string()),
        modals: z.record(z.string()),
        tooltips: z.record(z.string()),
        progress: z.record(z.string()),
        fileUpload: z.record(z.string()),
        toast: z.record(z.string()),
        pagination: z.record(z.string()),
        table: z.record(z.string()),
    })
    .strict();

export type ComponentsUiMessages = z.infer<typeof ComponentsUiSchema>; 