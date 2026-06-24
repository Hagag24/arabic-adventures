-- CreateTable
CREATE TABLE "Activity" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Activity_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Activity_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "JourneyStage" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Activity_audioAssetId_fkey" FOREIGN KEY ("audioAssetId") REFERENCES "AudioAsset" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActivityOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "activityId" TEXT NOT NULL,
    "optionKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "secondaryText" TEXT,
    "displayOrder" INTEGER NOT NULL,
    "mediaKey" TEXT,
    CONSTRAINT "ActivityOption_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActivityAnswerKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "activityId" TEXT NOT NULL,
    "answerData" JSONB NOT NULL,
    "acceptedAlternatives" JSONB,
    "modelAnswer" TEXT,
    "explanation" TEXT,
    CONSTRAINT "ActivityAnswerKey_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AudioAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assetKey" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerVoiceId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "spokenText" TEXT NOT NULL,
    "ssmlText" TEXT,
    "durationSeconds" REAL NOT NULL,
    "fileHash" TEXT NOT NULL,
    "generationVersion" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reviewedAt" DATETIME,
    "pronunciationOverrides" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PlayerSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "publicTokenHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ActivityAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerSessionId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "responseData" JSONB,
    "responseHash" TEXT,
    "isCorrect" BOOLEAN,
    "score" REAL,
    "storagePolicy" TEXT NOT NULL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityAttempt_playerSessionId_fkey" FOREIGN KEY ("playerSessionId") REFERENCES "PlayerSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ActivityAttempt_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JourneyProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerSessionId" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "lastActivityId" TEXT,
    "objectiveCorrect" INTEGER NOT NULL DEFAULT 0,
    "objectiveTotal" INTEGER NOT NULL DEFAULT 0,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "JourneyProgress_playerSessionId_fkey" FOREIGN KEY ("playerSessionId") REFERENCES "PlayerSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "JourneyProgress_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActivityProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerSessionId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "attemptsCount" INTEGER NOT NULL DEFAULT 0,
    "bestScore" REAL,
    "completedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ActivityProgress_playerSessionId_fkey" FOREIGN KEY ("playerSessionId") REFERENCES "PlayerSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ActivityProgress_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Activity_stageId_idx" ON "Activity"("stageId");

-- CreateIndex
CREATE INDEX "Activity_journeyId_idx" ON "Activity"("journeyId");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_journeyId_slug_key" ON "Activity"("journeyId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_stageId_displayOrder_key" ON "Activity"("stageId", "displayOrder");

-- CreateIndex
CREATE INDEX "ActivityOption_activityId_idx" ON "ActivityOption"("activityId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityOption_activityId_optionKey_key" ON "ActivityOption"("activityId", "optionKey");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityOption_activityId_displayOrder_key" ON "ActivityOption"("activityId", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityAnswerKey_activityId_key" ON "ActivityAnswerKey"("activityId");

-- CreateIndex
CREATE INDEX "ActivityAnswerKey_activityId_idx" ON "ActivityAnswerKey"("activityId");

-- CreateIndex
CREATE UNIQUE INDEX "AudioAsset_assetKey_key" ON "AudioAsset"("assetKey");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerSession_publicTokenHash_key" ON "PlayerSession"("publicTokenHash");

-- CreateIndex
CREATE INDEX "ActivityAttempt_playerSessionId_activityId_idx" ON "ActivityAttempt"("playerSessionId", "activityId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityAttempt_playerSessionId_activityId_attemptNumber_key" ON "ActivityAttempt"("playerSessionId", "activityId", "attemptNumber");

-- CreateIndex
CREATE INDEX "JourneyProgress_playerSessionId_idx" ON "JourneyProgress"("playerSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "JourneyProgress_playerSessionId_journeyId_key" ON "JourneyProgress"("playerSessionId", "journeyId");

-- CreateIndex
CREATE INDEX "ActivityProgress_playerSessionId_idx" ON "ActivityProgress"("playerSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityProgress_playerSessionId_activityId_key" ON "ActivityProgress"("playerSessionId", "activityId");
