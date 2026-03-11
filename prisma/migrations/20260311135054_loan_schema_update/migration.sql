/*
  Warnings:

  - Made the column `purpose` on table `Loan` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Loan" ALTER COLUMN "purpose" SET NOT NULL;
