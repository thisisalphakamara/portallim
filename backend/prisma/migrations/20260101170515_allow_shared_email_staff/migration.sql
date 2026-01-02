/*
  Warnings:

  - A unique constraint covering the columns `[staff_identifier]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nationalId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email,nationalId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email,passportNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "staff_identifier" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_staff_identifier_key" ON "User"("staff_identifier");

-- CreateIndex
CREATE UNIQUE INDEX "User_nationalId_key" ON "User"("nationalId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_nationalId_key" ON "User"("email", "nationalId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_passportNumber_key" ON "User"("email", "passportNumber");
