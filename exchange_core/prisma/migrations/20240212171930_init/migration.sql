-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('crypto', 'fiat', 'card');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('placed', 'received', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('pickup', 'online', 'delivery');

-- CreateTable
CREATE TABLE "OperationMethod" (
    "source" "PaymentType" NOT NULL,
    "destination" "PaymentType" NOT NULL,
    "is_active" BOOLEAN NOT NULL,

    CONSTRAINT "OperationMethod_pkey" PRIMARY KEY ("source","destination")
);

-- CreateTable
CREATE TABLE "PaymentInstrument" (
    "id" SERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "icon" TEXT,
    "name" TEXT NOT NULL,
    "precision" INTEGER NOT NULL DEFAULT 1,
    "type" "PaymentType" NOT NULL,

    CONSTRAINT "PaymentInstrument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentInstrumentMapping" (
    "instrument_id" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "PaymentInstrumentMapping_pkey" PRIMARY KEY ("instrument_id","label")
);

-- CreateTable
CREATE TABLE "OperationMethodChain" (
    "source_id" INTEGER NOT NULL,
    "destination_id" INTEGER NOT NULL,
    "comission_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "min_amount" DECIMAL(65,30) NOT NULL,
    "max_amount" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "OperationMethodChain_pkey" PRIMARY KEY ("source_id","destination_id")
);

-- CreateTable
CREATE TABLE "Comission" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "Comission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "source_id" INTEGER NOT NULL,
    "destination_id" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "type" "OrderType" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "expired_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recepient_address" TEXT,
    "info_id" INTEGER NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderInfo" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "supposed_visit_date" TIMESTAMP(3),
    "address" TEXT,

    CONSTRAINT "OrderInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderLog" (
    "id" SERIAL NOT NULL,
    "order_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "status" "OrderStatus" NOT NULL,

    CONSTRAINT "OrderLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderLogMapping" (
    "log_id" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "OrderLogMapping_pkey" PRIMARY KEY ("log_id","label")
);

-- CreateTable
CREATE TABLE "wallet" (
    "address" TEXT NOT NULL,
    "private_key" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "wallet_pkey" PRIMARY KEY ("address")
);

-- CreateIndex
CREATE INDEX "PaymentInstrument_symbol_type_idx" ON "PaymentInstrument"("symbol", "type");

-- CreateIndex
CREATE INDEX "PaymentInstrumentMapping_label_value_idx" ON "PaymentInstrumentMapping"("label", "value");

-- CreateIndex
CREATE UNIQUE INDEX "Order_info_id_key" ON "Order"("info_id");

-- CreateIndex
CREATE INDEX "Order_recepient_address_status_idx" ON "Order"("recepient_address", "status");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_private_key_key" ON "wallet"("private_key");

-- AddForeignKey
ALTER TABLE "PaymentInstrumentMapping" ADD CONSTRAINT "PaymentInstrumentMapping_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "PaymentInstrument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationMethodChain" ADD CONSTRAINT "OperationMethodChain_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "PaymentInstrument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationMethodChain" ADD CONSTRAINT "OperationMethodChain_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "PaymentInstrument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationMethodChain" ADD CONSTRAINT "OperationMethodChain_comission_id_fkey" FOREIGN KEY ("comission_id") REFERENCES "Comission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_source_id_destination_id_fkey" FOREIGN KEY ("source_id", "destination_id") REFERENCES "OperationMethodChain"("source_id", "destination_id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_info_id_fkey" FOREIGN KEY ("info_id") REFERENCES "OrderInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderLog" ADD CONSTRAINT "OrderLog_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderLogMapping" ADD CONSTRAINT "OrderLogMapping_log_id_fkey" FOREIGN KEY ("log_id") REFERENCES "OrderLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
