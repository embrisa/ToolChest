-- CreateTable: ToolDailyVisit for unique IP-per-day deduplication
CREATE TABLE IF NOT EXISTS "ToolDailyVisit" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "ipHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToolDailyVisit_pkey" PRIMARY KEY ("id")
);

-- Unique per tool + day + ipHash
CREATE UNIQUE INDEX IF NOT EXISTS "unique_tool_visit_per_ip_per_day"
  ON "ToolDailyVisit"("toolId", "visitDate", "ipHash");

-- Index for faster cleanup/queries by date
CREATE INDEX IF NOT EXISTS "ToolDailyVisit_visitDate_idx" ON "ToolDailyVisit"("visitDate");

-- Foreign key to Tool
ALTER TABLE "ToolDailyVisit"
  ADD CONSTRAINT IF NOT EXISTS "ToolDailyVisit_toolId_fkey"
  FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

