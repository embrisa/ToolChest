import { z } from "zod";
import { ItemsSectionSchema } from "./common";

/**
 * Canonical schema for `tools.base64.info` translation namespace.
 */
export const ToolsBase64InfoSchema = z
    .object({
        title: z.string(),
        description: z.string(),
        keyFeatures: ItemsSectionSchema,
        securityAndPrivacy: ItemsSectionSchema,
        useCases: ItemsSectionSchema,
    })
    .strict();

export type ToolsBase64InfoMessages = z.infer<typeof ToolsBase64InfoSchema>; 