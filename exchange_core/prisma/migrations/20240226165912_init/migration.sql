/*
  Warnings:

  - You are about to alter the column `block` on the `ChainSync` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to drop the column `status` on the `OrderLog` table. All the data in the column will be lost.
  - Added the required column `type` to the `OrderLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChainSync" ALTER COLUMN "block" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "OrderLog" DROP COLUMN "status",
ADD COLUMN     "type" TEXT NOT NULL;
