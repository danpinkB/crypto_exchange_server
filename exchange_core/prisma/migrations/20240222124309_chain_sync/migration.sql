-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "expired_at" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ChainSync" (
    "chain" INTEGER NOT NULL,
    "block" BIGINT NOT NULL,

    CONSTRAINT "ChainSync_pkey" PRIMARY KEY ("chain")
);
