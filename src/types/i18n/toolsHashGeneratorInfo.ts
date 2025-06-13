import { z } from "zod";
import { ItemsSectionSchema } from "./common";

/**
 * Canonical schema for `tools.hash-generator.info` translation namespace.
 */
export const ToolsHashGeneratorInfoSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    useCases: ItemsSectionSchema,
    securityGuidelines: ItemsSectionSchema,
    supportedAlgorithms: ItemsSectionSchema,
  })
  .strict();

export type ToolsHashGeneratorInfoMessages = z.infer<
  typeof ToolsHashGeneratorInfoSchema
>;
