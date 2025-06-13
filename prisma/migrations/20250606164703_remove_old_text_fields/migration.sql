/*
  Warnings:

  - You are about to drop the column `color` on the `Tag` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Tag` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Tag` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Tool` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Tool` table. All the data in the column will be lost.
  - Made the column `nameKey` on table `Tag` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tagKey` on table `Tag` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nameKey` on table `Tool` required. This step will fail if there are existing NULL values in that column.
  - Made the column `toolKey` on table `Tool` required. This step will fail if there are existing NULL values in that column.

*/
-- Back-fill keys so NOT NULL constraint succeeds
UPDATE "Tag" SET "nameKey" = COALESCE("nameKey", "slug"),
                 "tagKey"  = COALESCE("tagKey",  "slug")
WHERE "nameKey" IS NULL
   OR "tagKey"  IS NULL;

UPDATE "Tool" SET "nameKey" = COALESCE("nameKey", "slug"),
                  "toolKey" = COALESCE("toolKey", "slug")
WHERE "nameKey" IS NULL
   OR "toolKey" IS NULL;

-- AlterTable
-- ensure NOT NULL after data backfill
ALTER TABLE "Tag"
    ALTER COLUMN "nameKey" SET NOT NULL,
    ALTER COLUMN "tagKey" SET NOT NULL;

ALTER TABLE "Tool" 
    ALTER COLUMN "nameKey" SET NOT NULL,
    ALTER COLUMN "toolKey" SET NOT NULL;

-- Now remove legacy columns & indexes
DROP INDEX "Tag_name_key";
DROP INDEX "Tool_name_key";

ALTER TABLE "Tag" DROP COLUMN "color", DROP COLUMN "description", DROP COLUMN "name";

ALTER TABLE "Tool" DROP COLUMN "description", DROP COLUMN "name";
