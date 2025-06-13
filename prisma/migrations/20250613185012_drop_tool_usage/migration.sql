/*
  Warnings:

  - You are about to drop the `ToolUsage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE IF EXISTS "ToolUsage" DROP CONSTRAINT IF EXISTS "ToolUsage_toolId_fkey";

-- DropTable
DROP TABLE IF EXISTS "ToolUsage";
