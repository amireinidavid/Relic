-- DropForeignKey
ALTER TABLE "FlashSale" DROP CONSTRAINT "FlashSale_productId_fkey";

-- AddForeignKey
ALTER TABLE "FlashSale" ADD CONSTRAINT "FlashSale_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
