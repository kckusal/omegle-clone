/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Session_connection1_socket_id_key";

-- DropIndex
DROP INDEX "Session_connection2_socket_id_key";

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "Session_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Session_id_key" ON "Session"("id");
