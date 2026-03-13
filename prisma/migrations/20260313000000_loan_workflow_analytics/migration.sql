-- Drop old LoanStatus enum and recreate with new values
-- First drop the default and alter the column

-- Step 1: Drop the existing Loan table foreign keys and recreate
-- Step 2: Rename old enum, create new one, migrate column, drop old

BEGIN;
CREATE TYPE "LoanStatus_new" AS ENUM ('REQUESTED', 'APPROVED', 'CLOSED', 'REJECTED');
ALTER TABLE "Loan" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Loan" ALTER COLUMN "status" TYPE "LoanStatus_new" USING (
  CASE "status"::text
    WHEN 'BORROWED' THEN 'APPROVED'
    WHEN 'RETURNED' THEN 'CLOSED'
    WHEN 'LOST'     THEN 'CLOSED'
    WHEN 'DAMAGED'  THEN 'CLOSED'
    ELSE 'REQUESTED'
  END::"LoanStatus_new"
);
ALTER TYPE "LoanStatus" RENAME TO "LoanStatus_old";
ALTER TYPE "LoanStatus_new" RENAME TO "LoanStatus";
DROP TYPE "LoanStatus_old";
ALTER TABLE "Loan" ALTER COLUMN "status" SET DEFAULT 'REQUESTED';
COMMIT;

-- AlterTable Loan: add new columns, make due_date nullable, rename borrow_date
ALTER TABLE "Loan"
  ADD COLUMN "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "approved_at"  TIMESTAMP(3),
  ADD COLUMN "closed_at"    TIMESTAMP(3),
  ADD COLUMN "approved_by"  INTEGER;

-- Copy existing borrow_date into requested_at (if it exists)
UPDATE "Loan" SET "requested_at" = "borrow_date" WHERE "borrow_date" IS NOT NULL;

-- Make due_date nullable (was NOT NULL before)
ALTER TABLE "Loan" ALTER COLUMN "due_date" DROP NOT NULL;

-- Drop old columns no longer needed
ALTER TABLE "Loan"
  DROP COLUMN IF EXISTS "borrow_date",
  DROP COLUMN IF EXISTS "return_date",
  DROP COLUMN IF EXISTS "damage_notes";

-- AddForeignKey for approved_by
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_approved_by_fkey"
  FOREIGN KEY ("approved_by") REFERENCES "Member"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable ActivityLog
CREATE TABLE "ActivityLog" (
    "id"         SERIAL NOT NULL,
    "action"     TEXT NOT NULL,
    "actor_id"   INTEGER NOT NULL,
    "target_id"  INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);
