-- AlterTable
ALTER TABLE "Receipt" ADD COLUMN     "stripeCheckoutId" TEXT,
ADD COLUMN     "paypalOrderId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_stripeCheckoutId_key" ON "Receipt"("stripeCheckoutId");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_paypalOrderId_key" ON "Receipt"("paypalOrderId");
