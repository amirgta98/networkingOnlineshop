-- Ensure Payment enums exist before creating payment_transactions
DO $$ BEGIN
  CREATE TYPE "PaymentGatewayType" AS ENUM ('ZARINPAL_SANDBOX', 'ZARINPAL', 'SAMAN', 'MELLAT');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "PaymentRecordStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "PaymentTargetType" AS ENUM ('ORDER', 'WALLET', 'INVOICE', 'INTERNET_ORDER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Ensure payment_transactions exists on fresh databases before altering it
CREATE TABLE IF NOT EXISTS "payment_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "type" "PaymentTargetType" NOT NULL,
    "target_id" VARCHAR(100) NOT NULL,
    "amount" BIGINT NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'IRT',
    "gateway" "PaymentGatewayType" NOT NULL DEFAULT 'ZARINPAL_SANDBOX',
    "status" "PaymentRecordStatus" NOT NULL DEFAULT 'PENDING',
    "authority" VARCHAR(100) NOT NULL,
    "ref_id" VARCHAR(100),
    "card_pan" VARCHAR(50),
    "card_hash" VARCHAR(255),
    "tracking_code" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "receipt_url" TEXT,
    "receipt_number" VARCHAR(100),
    "callback_url" TEXT,
    "error_message" TEXT,
    "verified_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_receipt_url" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_receipt_number" VARCHAR(100);

-- AlterTable
ALTER TABLE "payment_transactions" ADD COLUMN IF NOT EXISTS "receipt_url" TEXT;
ALTER TABLE "payment_transactions" ADD COLUMN IF NOT EXISTS "receipt_number" VARCHAR(100);

-- Indexes & ForeignKey
CREATE UNIQUE INDEX IF NOT EXISTS "payment_transactions_authority_key" ON "payment_transactions"("authority");
CREATE UNIQUE INDEX IF NOT EXISTS "payment_transactions_tracking_code_key" ON "payment_transactions"("tracking_code");
CREATE INDEX IF NOT EXISTS "idx_payments_user_id" ON "payment_transactions"("user_id");
CREATE INDEX IF NOT EXISTS "idx_payments_authority" ON "payment_transactions"("authority");
CREATE INDEX IF NOT EXISTS "idx_payments_target_id" ON "payment_transactions"("target_id");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payment_transactions_user_id_fkey') THEN
    ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
