/*
  Warnings:

  - The values [ADMIN,CORE,MEMBER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('MASTER_ADMIN', 'BOARD', 'SENIOR_CORE', 'JUNIOR_CORE');
ALTER TABLE "public"."Member" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "Member" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "Member" ALTER COLUMN "role" SET DEFAULT 'JUNIOR_CORE';
COMMIT;

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "mustChangePwd" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "role" SET DEFAULT 'JUNIOR_CORE';

-- CreateIndex
CREATE INDEX "Loan_item_id_idx" ON "Loan"("item_id");

-- CreateIndex
CREATE INDEX "Loan_member_id_idx" ON "Loan"("member_id");
