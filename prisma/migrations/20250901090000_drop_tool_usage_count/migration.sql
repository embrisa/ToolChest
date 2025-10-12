-- Remove legacy usageCount column from Tool; usage stats now live in ToolUsageStats
ALTER TABLE "Tool"
  DROP COLUMN IF EXISTS "usageCount";
