-- AlterTable
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_receipt_url" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_receipt_number" VARCHAR(100);

-- AlterTable
ALTER TABLE "payment_transactions" ADD COLUMN IF NOT EXISTS "receipt_url" TEXT;
ALTER TABLE "payment_transactions" ADD COLUMN IF NOT EXISTS "receipt_number" VARCHAR(100);
