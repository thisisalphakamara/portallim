-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "calendarYear" TEXT,
ADD COLUMN     "sessionPeriod" TEXT;

-- CreateIndex
CREATE INDEX "Submission_calendarYear_sessionPeriod_idx" ON "Submission"("calendarYear", "sessionPeriod");
