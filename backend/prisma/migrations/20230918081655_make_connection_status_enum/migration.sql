/*
  Warnings:

  - You are about to drop the column `is_engaged` on the `Connection` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ConnectionStatus" AS ENUM ('available', 'handshaking', 'engaged');

-- AlterTable
ALTER TABLE "Connection" DROP COLUMN "is_engaged",
ADD COLUMN     "status" "ConnectionStatus" NOT NULL DEFAULT 'available';
