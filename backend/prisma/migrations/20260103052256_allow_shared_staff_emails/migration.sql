-- DropIndex
DROP INDEX "User_email_nationalId_key";

-- DropIndex
DROP INDEX "User_email_passportNumber_key";

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");
