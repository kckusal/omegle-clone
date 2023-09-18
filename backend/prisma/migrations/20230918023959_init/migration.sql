-- CreateTable
CREATE TABLE "Connection" (
    "id" SERIAL NOT NULL,
    "socket_id" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,

    CONSTRAINT "Connection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
    "initiator_id" INTEGER NOT NULL,
    "joiner_id" INTEGER NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_initiator_id_fkey" FOREIGN KEY ("initiator_id") REFERENCES "Connection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_joiner_id_fkey" FOREIGN KEY ("joiner_id") REFERENCES "Connection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
