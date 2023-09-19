/*
  Warnings:

  - The primary key for the `Session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[connection1_socket_id]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[connection2_socket_id]` on the table `Session` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Session" DROP CONSTRAINT "Session_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "Session_connection1_socket_id_key" ON "Session"("connection1_socket_id");

-- CreateIndex
CREATE UNIQUE INDEX "Session_connection2_socket_id_key" ON "Session"("connection2_socket_id");
