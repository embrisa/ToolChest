import { z } from "zod";
import { ItemsSectionSchema } from "./common";

/**
 * Canonical schema for `tools.markdown-to-pdf.info` translation namespace.
 */
export const ToolsMarkdownToPdfInfoSchema = z
    .object({
        title: z.string(),
        description: z.string(),
        keyFeatures: ItemsSectionSchema,
        supportedFeatures: ItemsSectionSchema,
        pdfTemplates: ItemsSectionSchema,
        howToUse: ItemsSectionSchema,
        features: z.object({
            title: z.string().optional(),
            items: z.array(z.string()),
        }),
    })
    .strict();

export type ToolsMarkdownToPdfInfoMessages = z.infer<
    typeof ToolsMarkdownToPdfInfoSchema
>; 