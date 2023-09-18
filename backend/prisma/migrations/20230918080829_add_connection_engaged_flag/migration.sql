/*
  Warnings:

  - Added the required column `is_engaged` to the `Connection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Connection" ADD COLUMN     "is_engaged" BOOLEAN NOT NULL;
