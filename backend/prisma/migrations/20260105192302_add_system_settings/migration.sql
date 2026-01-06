-- DropIndex
DROP INDEX "AuditLog_performedBy_idx";

-- DropIndex
DROP INDEX "AuditLog_targetUser_idx";

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL,
    "currentAcademicYear" TEXT NOT NULL,
    "currentSession" TEXT NOT NULL,
    "isRegistrationOpen" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);
