import type { ToolMetricEntry } from "@/types/api/metrics";

type ActionBudgetMap = Partial<Record<ToolMetricEntry["action"], number>>;

/**
 * Budgets derived from Sprint-003/004 decisions.
 * Values are in milliseconds and should reflect cold desktop targets.
 */
export const TOOL_METRIC_BUDGETS: Record<string, ActionBudgetMap> = {
  base64: {
    load: 1_000,
    encode: 800,
    decode: 800,
  },
  "hash-generator": {
    load: 1_000,
    hash: 800,
  },
  "jwt-decoder": {
    load: 1_000,
    decode: 800,
  },
  "format-converter": {
    load: 1_200,
    convert: 1_200,
  },
  "markdown-to-pdf": {
    load: 1_200,
    generate: 2_000,
  },
  "favicon-generator": {
    load: 1_200,
    generate: 1_500,
  },
};

export function getBudget(
  toolSlug: string | undefined,
  action: ToolMetricEntry["action"],
): number | undefined {
  if (!toolSlug) return undefined;
  return TOOL_METRIC_BUDGETS[toolSlug]?.[action];
}

