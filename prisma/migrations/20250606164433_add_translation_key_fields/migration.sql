/*
  Warnings:

  - A unique constraint covering the columns `[nameKey]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tagKey]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nameKey]` on the table `Tool` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[toolKey]` on the table `Tool` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "descriptionKey" TEXT,
ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "iconClass" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "nameKey" TEXT,
ADD COLUMN     "tagKey" TEXT,
ALTER COLUMN "name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Tool" ADD COLUMN     "descriptionKey" TEXT,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nameKey" TEXT,
ADD COLUMN     "toolKey" TEXT,
ALTER COLUMN "name" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Tag_nameKey_key" ON "Tag"("nameKey");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_tagKey_key" ON "Tag"("tagKey");

-- CreateIndex
CREATE UNIQUE INDEX "Tool_nameKey_key" ON "Tool"("nameKey");

-- CreateIndex
CREATE UNIQUE INDEX "Tool_toolKey_key" ON "Tool"("toolKey");
