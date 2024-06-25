/*
  Warnings:

  - You are about to drop the column `destination_price` on the `Order` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[order_number]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `amount_out` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "destination_price",
ADD COLUMN     "amount_out" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "order_number" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_order_number_key" ON "Order"("order_number");
