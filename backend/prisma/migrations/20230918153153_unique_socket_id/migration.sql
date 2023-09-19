/*
  Warnings:

  - A unique constraint covering the columns `[socket_id]` on the table `Connection` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Connection_socket_id_key" ON "Connection"("socket_id");
