-- CreateTable
CREATE TABLE "WalletOrder" (
    "id" TEXT NOT NULL,
    "type" "PaymentType" NOT NULL,
    "chain" INTEGER NOT NULL,
    "order_id" TEXT NOT NULL,

    CONSTRAINT "WalletOrder_pkey" PRIMARY KEY ("id","chain")
);

-- AddForeignKey
ALTER TABLE "WalletOrder" ADD CONSTRAINT "WalletOrder_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
