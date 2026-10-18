-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING_FINANCIAL', 'PROCESSING_WAREHOUSE', 'SHIPPING', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RfqStatus" AS ENUM ('PENDING_QUOTE', 'QUOTED', 'EXPIRED', 'CONVERTED');

-- CreateEnum
CREATE TYPE "AuthenticityStatus" AS ENUM ('GENUINE', 'COUNTERFEIT', 'INVALID_CODE', 'EXPIRED');

-- CreateTable
CREATE TABLE "carts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cart_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_number" VARCHAR(50) NOT NULL,
    "tracking_code" VARCHAR(50) NOT NULL,
    "user_id" UUID NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING_FINANCIAL',
    "customer_type" VARCHAR(20) NOT NULL DEFAULT 'retail',
    "customer_name" VARCHAR(255) NOT NULL,
    "company_name" VARCHAR(255),
    "national_code" VARCHAR(20),
    "phone_number" VARCHAR(50) NOT NULL,
    "total_amount" BIGINT NOT NULL DEFAULT 0,
    "discount_amount" BIGINT NOT NULL DEFAULT 0,
    "vat_tax_amount" BIGINT NOT NULL DEFAULT 0,
    "payable_amount" BIGINT NOT NULL DEFAULT 0,
    "payment_method" VARCHAR(50) NOT NULL DEFAULT 'online_gateway',
    "shipping_carrier" VARCHAR(50),
    "shipping_cost" BIGINT NOT NULL DEFAULT 0,
    "delivery_notes" TEXT,
    "shipping_address" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "product_id" UUID,
    "sku" VARCHAR(100) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "brand" VARCHAR(100),
    "model" VARCHAR(100),
    "unit_price" BIGINT NOT NULL DEFAULT 0,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "total_price" BIGINT NOT NULL DEFAULT 0,
    "warranty" VARCHAR(100),
    "serial_numbers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rfq_inquiries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rfq_number" VARCHAR(50) NOT NULL,
    "user_id" UUID NOT NULL,
    "project_title" VARCHAR(255) NOT NULL,
    "company_name" VARCHAR(255),
    "client_phone" VARCHAR(50) NOT NULL,
    "client_email" VARCHAR(255),
    "status" "RfqStatus" NOT NULL DEFAULT 'PENDING_QUOTE',
    "urgent" BOOLEAN NOT NULL DEFAULT false,
    "deadline_hours" INTEGER NOT NULL DEFAULT 48,
    "discount_percent" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "validity_days" INTEGER NOT NULL DEFAULT 7,
    "estimated_value" BIGINT NOT NULL DEFAULT 0,
    "final_quoted_amount" BIGINT,
    "quotation_issued_at" TIMESTAMPTZ,
    "project_location" VARCHAR(255),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rfq_inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rfq_inquiry_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rfq_id" UUID NOT NULL,
    "product_id" UUID,
    "sku" VARCHAR(100) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "brand" VARCHAR(100),
    "category" VARCHAR(100),
    "requested_qty" INTEGER NOT NULL DEFAULT 1,
    "unit_price" BIGINT NOT NULL DEFAULT 0,
    "stock_status" VARCHAR(50) NOT NULL DEFAULT 'available',
    "suggested_alternative" VARCHAR(255),
    "specs_summary" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rfq_inquiry_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authenticity_inquiries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "serial_number" VARCHAR(100) NOT NULL,
    "hologram_code" VARCHAR(100),
    "product_name" VARCHAR(255) NOT NULL,
    "brand" VARCHAR(100) NOT NULL,
    "model" VARCHAR(100),
    "warranty_type" VARCHAR(100),
    "status" "AuthenticityStatus" NOT NULL DEFAULT 'GENUINE',
    "is_authentic" BOOLEAN NOT NULL DEFAULT true,
    "start_date" TIMESTAMPTZ,
    "end_date" TIMESTAMPTZ,
    "inquiry_ip" VARCHAR(45),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "authenticity_inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "carts_user_id_key" ON "carts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cart_id_product_id_key" ON "cart_items"("cart_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");

-- CreateIndex
CREATE UNIQUE INDEX "orders_tracking_code_key" ON "orders"("tracking_code");

-- CreateIndex
CREATE INDEX "idx_orders_user_id" ON "orders"("user_id");

-- CreateIndex
CREATE INDEX "idx_orders_status" ON "orders"("status");

-- CreateIndex
CREATE INDEX "idx_order_items_order_id" ON "order_items"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "rfq_inquiries_rfq_number_key" ON "rfq_inquiries"("rfq_number");

-- CreateIndex
CREATE INDEX "idx_rfq_user_id" ON "rfq_inquiries"("user_id");

-- CreateIndex
CREATE INDEX "idx_rfq_items_rfq_id" ON "rfq_inquiry_items"("rfq_id");

-- CreateIndex
CREATE INDEX "idx_authenticity_user_id" ON "authenticity_inquiries"("user_id");

-- CreateIndex
CREATE INDEX "idx_authenticity_serial" ON "authenticity_inquiries"("serial_number");

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfq_inquiries" ADD CONSTRAINT "rfq_inquiries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfq_inquiry_items" ADD CONSTRAINT "rfq_inquiry_items_rfq_id_fkey" FOREIGN KEY ("rfq_id") REFERENCES "rfq_inquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "authenticity_inquiries" ADD CONSTRAINT "authenticity_inquiries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
