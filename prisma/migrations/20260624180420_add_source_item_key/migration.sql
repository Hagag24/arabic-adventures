-- AlterTable
ALTER TABLE "Activity" ADD COLUMN "completionFeedbackNarrationKey" TEXT;
ALTER TABLE "Activity" ADD COLUMN "correctFeedbackNarrationKey" TEXT;
ALTER TABLE "Activity" ADD COLUMN "incorrectFeedbackNarrationKey" TEXT;
ALTER TABLE "Activity" ADD COLUMN "instructionNarrationKey" TEXT;
ALTER TABLE "Activity" ADD COLUMN "promptNarrationKey" TEXT;
ALTER TABLE "Activity" ADD COLUMN "sourceItemKey" TEXT;

-- AlterTable
ALTER TABLE "ActivityOption" ADD COLUMN "narrationKey" TEXT;

-- CreateIndex
CREATE INDEX "Activity_sourceItemKey_idx" ON "Activity"("sourceItemKey");
