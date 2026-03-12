/*
  Warnings:

  - Added the required column `updated_at` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Loan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Member` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Loan" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
