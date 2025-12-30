-- AlterTable
ALTER TABLE "Module" ADD COLUMN "semester" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Module" ADD COLUMN "yearLevel" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "Module_semester_yearLevel_idx" ON "Module"("semester", "yearLevel");


