-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "PaymentInstrument"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "PaymentInstrument"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
