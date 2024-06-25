-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "destination_price" DECIMAL(65,30) NOT NULL DEFAULT 0,
ALTER COLUMN "expired_at" DROP DEFAULT;
