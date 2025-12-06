import { z } from "zod";

export const ToolMetricActionSchema = z.enum([
  "load",
  "convert",
  "hash",
  "decode",
  "encode",
  "generate",
  "download",
  "upload",
]);

export const ToolMetricSizeBucketSchema = z.enum([
  "<1mb",
  "1-5mb",
  "5-9mb",
  ">9mb-rejected",
]);

export const ToolMetricErrorCategorySchema = z.enum([
  "validation",
  "processing-error",
  "exception",
  "timeout",
  "network",
  "cancelled",
  "unknown",
]);

const SampleIdSchema = z
  .string()
  .min(8)
  .max(64)
  .regex(/^[a-zA-Z0-9._-]+$/);

export const ToolMetricEntrySchema = z
  .object({
    toolSlug: z.string().min(1).max(64),
    action: ToolMetricActionSchema,
    durationMs: z.number().int().nonnegative().max(600_000),
    success: z.boolean(),
    errorCategory: ToolMetricErrorCategorySchema.optional(),
    inputSizeBucket: ToolMetricSizeBucketSchema.optional(),
    workerUsed: z.boolean().optional(),
    offline: z.boolean().optional(),
    sampleRate: z.number().min(0).max(1).optional(),
    sampleId: SampleIdSchema,
    ts: z.string().datetime().optional(),
  })
  .strict();

export const ToolMetricsPayloadSchema = z.object({
  events: z.array(ToolMetricEntrySchema).min(1).max(50),
}).strict();

export type ToolMetricEntry = z.infer<typeof ToolMetricEntrySchema>;
export type ToolMetricsPayload = z.infer<typeof ToolMetricsPayloadSchema>;

