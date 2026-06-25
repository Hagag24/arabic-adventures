-- CreateTable
CREATE TABLE "ActivitySourceMapping" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "activityId" TEXT NOT NULL,
    "sourceItemKey" TEXT NOT NULL,
    "sourcePage" INTEGER,
    "implementationStatus" TEXT NOT NULL,
    "mergeReason" TEXT,
    CONSTRAINT "ActivitySourceMapping_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ActivitySourceMapping_sourceItemKey_key" ON "ActivitySourceMapping"("sourceItemKey");

-- CreateIndex
CREATE INDEX "ActivitySourceMapping_activityId_idx" ON "ActivitySourceMapping"("activityId");
