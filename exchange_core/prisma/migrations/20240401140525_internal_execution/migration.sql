-- CreateEnum
CREATE TYPE "TxStatus" AS ENUM ('CREATED', 'COMPLETED');

-- CreateTable
CREATE TABLE "Tx" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "TxStatus" NOT NULL DEFAULT 'CREATED',

    CONSTRAINT "Tx_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TxLog" (
    "id" SERIAL NOT NULL,
    "tx_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TxLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TxLogMapping" (
    "tx_log_id" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "TxLogMapping_pkey" PRIMARY KEY ("tx_log_id","label")
);

-- CreateIndex
CREATE INDEX "Tx_name_idx" ON "Tx"("name");

-- AddForeignKey
ALTER TABLE "TxLog" ADD CONSTRAINT "TxLog_tx_id_fkey" FOREIGN KEY ("tx_id") REFERENCES "Tx"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TxLogMapping" ADD CONSTRAINT "TxLogMapping_tx_log_id_fkey" FOREIGN KEY ("tx_log_id") REFERENCES "TxLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
