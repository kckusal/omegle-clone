/*
  Warnings:

  - The primary key for the `Connection` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Connection` table. All the data in the column will be lost.
  - The primary key for the `Session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `initiator_id` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `joiner_id` on the `Session` table. All the data in the column will be lost.
  - Added the required column `connection1_socket_id` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `connection2_socket_id` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_initiator_id_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_joiner_id_fkey";

-- AlterTable
ALTER TABLE "Connection" DROP CONSTRAINT "Connection_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Connection_pkey" PRIMARY KEY ("socket_id");

-- AlterTable
ALTER TABLE "Session" DROP CONSTRAINT "Session_pkey",
DROP COLUMN "id",
DROP COLUMN "initiator_id",
DROP COLUMN "is_active",
DROP COLUMN "joiner_id",
ADD COLUMN     "connection1_socket_id" TEXT NOT NULL,
ADD COLUMN     "connection2_socket_id" TEXT NOT NULL,
ADD CONSTRAINT "Session_pkey" PRIMARY KEY ("connection1_socket_id", "connection2_socket_id");
