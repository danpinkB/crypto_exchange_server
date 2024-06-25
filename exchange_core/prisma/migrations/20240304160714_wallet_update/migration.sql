/*
  Warnings:

  - The primary key for the `wallet` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `address` on the `wallet` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `wallet` table. All the data in the column will be lost.
  - Added the required column `wallet_id` to the `WalletOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WalletOrder" ADD COLUMN     "wallet_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "wallet" DROP CONSTRAINT "wallet_pkey",
DROP COLUMN "address",
DROP COLUMN "status",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "wallet_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "WalletOrder" ADD CONSTRAINT "WalletOrder_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
