/*
  Warnings:

  - You are about to drop the column `private_key` on the `wallet` table. All the data in the column will be lost.
  - The `status` column on the `wallet` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[phrase]` on the table `wallet` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phrase` to the `wallet` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WalletStatus" AS ENUM ('FREE', 'BUSY');

-- DropIndex
DROP INDEX "wallet_private_key_key";

-- AlterTable
ALTER TABLE "wallet" DROP COLUMN "private_key",
ADD COLUMN     "phrase" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "WalletStatus" NOT NULL DEFAULT 'BUSY';

-- CreateIndex
CREATE UNIQUE INDEX "wallet_phrase_key" ON "wallet"("phrase");
