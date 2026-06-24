/*
  Warnings:

  - Made the column `sourceItemKey` on table `Activity` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Activity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "journeyId" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "instruction" TEXT NOT NULL,
    "prompt" TEXT,
    "skillTags" JSONB NOT NULL,
    "isGraded" BOOLEAN NOT NULL DEFAULT true,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "isSensitive" BOOLEAN NOT NULL DEFAULT false,
    "storagePolicy" TEXT NOT NULL,
    "audioAssetId" TEXT,
    "configuration" JSONB,
    "correctFeedback" TEXT,
    "incorrectFeedback" TEXT,
    "completionFeedback" TEXT,
    "displayOrder" INTEGER NOT NULL,
    "sourceItemKey" TEXT NOT NULL,
    "instructionNarrationKey" TEXT,
    "promptNarrationKey" TEXT,
    "correctFeedbackNarrationKey" TEXT,
    "incorrectFeedbackNarrationKey" TEXT,
    "completionFeedbackNarrationKey" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Activity_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Activity_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "JourneyStage" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Activity_audioAssetId_fkey" FOREIGN KEY ("audioAssetId") REFERENCES "AudioAsset" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Activity" ("audioAssetId", "completionFeedback", "completionFeedbackNarrationKey", "configuration", "correctFeedback", "correctFeedbackNarrationKey", "createdAt", "displayOrder", "id", "incorrectFeedback", "incorrectFeedbackNarrationKey", "instruction", "instructionNarrationKey", "isGraded", "isPublished", "isSensitive", "journeyId", "prompt", "promptNarrationKey", "skillTags", "slug", "sourceItemKey", "stageId", "storagePolicy", "title", "type", "updatedAt") SELECT "audioAssetId", "completionFeedback", "completionFeedbackNarrationKey", "configuration", "correctFeedback", "correctFeedbackNarrationKey", "createdAt", "displayOrder", "id", "incorrectFeedback", "incorrectFeedbackNarrationKey", "instruction", "instructionNarrationKey", "isGraded", "isPublished", "isSensitive", "journeyId", "prompt", "promptNarrationKey", "skillTags", "slug", "sourceItemKey", "stageId", "storagePolicy", "title", "type", "updatedAt" FROM "Activity";
DROP TABLE "Activity";
ALTER TABLE "new_Activity" RENAME TO "Activity";
CREATE UNIQUE INDEX "Activity_sourceItemKey_key" ON "Activity"("sourceItemKey");
CREATE INDEX "Activity_stageId_idx" ON "Activity"("stageId");
CREATE INDEX "Activity_journeyId_idx" ON "Activity"("journeyId");
CREATE UNIQUE INDEX "Activity_journeyId_slug_key" ON "Activity"("journeyId", "slug");
CREATE UNIQUE INDEX "Activity_stageId_displayOrder_key" ON "Activity"("stageId", "displayOrder");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
