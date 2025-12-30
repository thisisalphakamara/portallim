/*
  Warnings:

  - The values [PENDING_FACULTY_ADMIN] on the enum `ApprovalStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [FACULTY_ADMIN] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/

-- First, update any submissions with PENDING_FACULTY_ADMIN status to PENDING_FINANCE
-- (since Year Leader now goes directly to Finance)
UPDATE "Submission" SET "status" = 'PENDING_FINANCE' WHERE "status"::text = 'PENDING_FACULTY_ADMIN';

-- Update any users with FACULTY_ADMIN role to YEAR_LEADER (or you can delete them)
-- Note: You may want to review these users first before running this migration
UPDATE "User" SET "role" = 'YEAR_LEADER' WHERE "role"::text = 'FACULTY_ADMIN';

-- AlterEnum for ApprovalStatus
BEGIN;
CREATE TYPE "ApprovalStatus_new" AS ENUM ('NOT_STARTED', 'PENDING_YEAR_LEADER', 'PENDING_FINANCE', 'PENDING_REGISTRAR', 'APPROVED', 'REJECTED');
ALTER TABLE "Submission" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Submission" ALTER COLUMN "status" TYPE "ApprovalStatus_new" USING ("status"::text::"ApprovalStatus_new");
ALTER TYPE "ApprovalStatus" RENAME TO "ApprovalStatus_old";
ALTER TYPE "ApprovalStatus_new" RENAME TO "ApprovalStatus";
DROP TYPE "ApprovalStatus_old";
ALTER TABLE "Submission" ALTER COLUMN "status" SET DEFAULT 'PENDING_YEAR_LEADER';
COMMIT;

-- AlterEnum for Role
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('STUDENT', 'YEAR_LEADER', 'FINANCE_OFFICER', 'REGISTRAR', 'SYSTEM_ADMIN');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
COMMIT;
