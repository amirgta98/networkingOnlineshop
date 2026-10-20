-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "InvoiceType" AS ENUM ('UNOFFICIAL', 'OFFICIAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'ISSUED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "InvoicePaymentStatus" AS ENUM ('UNPAID', 'PAID');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "invoices" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invoice_number" VARCHAR(50) NOT NULL,
    "tracking_code" VARCHAR(50) NOT NULL,
    "user_id" UUID,
    "type" "InvoiceType" NOT NULL DEFAULT 'UNOFFICIAL',
    "status" "InvoiceStatus" NOT NULL DEFAULT 'ISSUED',
    "payment_status" "InvoicePaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "payment_method" VARCHAR(50),
    "subtotal" BIGINT NOT NULL DEFAULT 0,
    "tax_rate_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "tax_amount" BIGINT NOT NULL DEFAULT 0,
    "discount_amount" BIGINT NOT NULL DEFAULT 0,
    "shipping_cost" BIGINT NOT NULL DEFAULT 0,
    "total_amount" BIGINT NOT NULL DEFAULT 0,
    "customer_name" VARCHAR(255),
    "customer_phone" VARCHAR(50),
    "customer_address" TEXT,
    "customer_postal_code" VARCHAR(20),
    "company_name" VARCHAR(255),
    "registration_number" VARCHAR(50),
    "national_id" VARCHAR(20),
    "economic_code" VARCHAR(30),
    "legal_postal_code" VARCHAR(20),
    "legal_phone" VARCHAR(50),
    "legal_address" TEXT,
    "tax_system_id" VARCHAR(50),
    "official_approved_at" TIMESTAMPTZ,
    "official_approved_by" VARCHAR(255),
    "rejection_reason" TEXT,
    "admin_notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "invoice_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invoice_id" UUID NOT NULL,
    "product_id" UUID,
    "title" VARCHAR(255) NOT NULL,
    "sku" VARCHAR(100),
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" BIGINT NOT NULL DEFAULT 0,
    "total_price" BIGINT NOT NULL DEFAULT 0,
    "tax_amount" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "invoices_invoice_number_key" ON "invoices"("invoice_number");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_invoices_user_id" ON "invoices"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_invoices_status" ON "invoices"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_invoices_type" ON "invoices"("type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_invoices_number" ON "invoices"("invoice_number");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_invoice_items_invoice_id" ON "invoice_items"("invoice_id");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
