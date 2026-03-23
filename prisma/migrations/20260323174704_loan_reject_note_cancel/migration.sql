-- AlterEnum
ALTER TYPE "LoanStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "Loan" ADD COLUMN     "cancelled_at" TIMESTAMP(3),
ADD COLUMN     "rejected_at" TIMESTAMP(3),
ADD COLUMN     "rejected_by" INTEGER,
ADD COLUMN     "rejection_note" TEXT;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_rejected_by_fkey" FOREIGN KEY ("rejected_by") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
