-- Idempotent sync of tables, enums, columns, indexes, and foreign keys present in schema.prisma
-- covering payment configs, affiliate system, internet plans/orders, site contact settings, and missing columns.

DO $$ BEGIN
  CREATE TYPE "AffiliatePartnerStatus" AS ENUM ('PENDING_APPROVAL', 'ACTIVE', 'INACTIVE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "AffiliateCommissionStatus" AS ENUM ('PENDING', 'APPROVED', 'READY_FOR_PAYMENT', 'PAID', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "NightTrafficType" AS ENUM ('NORMAL', 'HALF_PRICE', 'FREE_BUSINESS');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "InternetOrderStatus" AS ENUM ('PENDING', 'ACTIVE', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable: payment_gateway_configs
CREATE TABLE IF NOT EXISTS "payment_gateway_configs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "merchant_id" VARCHAR(255) NOT NULL,
    "terminal_id" VARCHAR(100),
    "api_key" VARCHAR(255),
    "is_sandbox" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_gateway_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable: payment_bank_accounts
CREATE TABLE IF NOT EXISTS "payment_bank_accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "bank_name" VARCHAR(100) NOT NULL,
    "account_owner" VARCHAR(150) NOT NULL,
    "card_number" VARCHAR(30) NOT NULL,
    "sheba_number" VARCHAR(40) NOT NULL,
    "account_number" VARCHAR(50),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable: payment_settings
CREATE TABLE IF NOT EXISTS "payment_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" VARCHAR(100) NOT NULL,
    "value" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable: affiliate_settings
CREATE TABLE IF NOT EXISTS "affiliate_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "default_discount_percent" DECIMAL(5,2) NOT NULL DEFAULT 8.00,
    "default_static_ip_commission" BIGINT NOT NULL DEFAULT 150000,
    "default_internet_commission" BIGINT NOT NULL DEFAULT 400000,
    "is_affiliate_system_enabled" BOOLEAN NOT NULL DEFAULT true,
    "is_product_discount_enabled" BOOLEAN NOT NULL DEFAULT true,
    "is_static_ip_commission_enabled" BOOLEAN NOT NULL DEFAULT true,
    "is_internet_commission_enabled" BOOLEAN NOT NULL DEFAULT true,
    "eligible_product_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "eligible_category_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "affiliate_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable: affiliate_partners
CREATE TABLE IF NOT EXISTS "affiliate_partners" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "partner_code" VARCHAR(50) NOT NULL,
    "status" "AffiliatePartnerStatus" NOT NULL DEFAULT 'ACTIVE',
    "custom_discount_percent" DECIMAL(5,2),
    "custom_static_ip_commission" BIGINT,
    "custom_internet_commission" BIGINT,
    "is_discount_enabled" BOOLEAN NOT NULL DEFAULT true,
    "is_commission_enabled" BOOLEAN NOT NULL DEFAULT true,
    "total_sales" BIGINT NOT NULL DEFAULT 0,
    "total_orders" INTEGER NOT NULL DEFAULT 0,
    "total_commission" BIGINT NOT NULL DEFAULT 0,
    "paid_commission" BIGINT NOT NULL DEFAULT 0,
    "approved_commission" BIGINT NOT NULL DEFAULT 0,
    "notes" TEXT,
    "joined_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "affiliate_partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable: affiliate_commissions
CREATE TABLE IF NOT EXISTS "affiliate_commissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "partner_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "order_number" VARCHAR(50) NOT NULL,
    "product_type" VARCHAR(50) NOT NULL,
    "product_title" VARCHAR(255) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_commission" BIGINT NOT NULL DEFAULT 0,
    "total_commission" BIGINT NOT NULL DEFAULT 0,
    "status" "AffiliateCommissionStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "affiliate_commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable: affiliate_payouts
CREATE TABLE IF NOT EXISTS "affiliate_payouts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "partner_id" UUID NOT NULL,
    "amount" BIGINT NOT NULL,
    "tracking_code" VARCHAR(100) NOT NULL,
    "payment_method" VARCHAR(50) NOT NULL DEFAULT 'SATNA_PAYA',
    "description" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    "paid_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "affiliate_payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable: internet_plans
CREATE TABLE IF NOT EXISTS "internet_plans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "badge" VARCHAR(100),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "internationalTraffic" INTEGER,
    "domesticTraffic" INTEGER,
    "nightTraffic" "NightTrafficType" NOT NULL DEFAULT 'NORMAL',
    "features" JSONB NOT NULL DEFAULT '[]',
    "monthlyPrice" BIGINT NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "discountThreeMonths" INTEGER NOT NULL DEFAULT 0,
    "discountSixMonths" INTEGER NOT NULL DEFAULT 0,
    "discountYearly" INTEGER NOT NULL DEFAULT 20,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "internet_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable: internet_settings
CREATE TABLE IF NOT EXISTS "internet_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" VARCHAR(100) NOT NULL,
    "value" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "internet_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable: internet_orders
CREATE TABLE IF NOT EXISTS "internet_orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tracking_code" VARCHAR(50) NOT NULL,
    "user_id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "site_id" UUID,
    "service_duration_months" INTEGER NOT NULL DEFAULT 12,
    "has_static_ip" BOOLEAN NOT NULL DEFAULT false,
    "include_modem" BOOLEAN NOT NULL DEFAULT false,
    "include_installation" BOOLEAN NOT NULL DEFAULT true,
    "base_amount" BIGINT NOT NULL,
    "discount_amount" BIGINT NOT NULL DEFAULT 0,
    "static_ip_amount" BIGINT NOT NULL DEFAULT 0,
    "addons_amount" BIGINT NOT NULL DEFAULT 0,
    "final_amount" BIGINT NOT NULL,
    "partner_commission" BIGINT NOT NULL DEFAULT 0,
    "status" "InternetOrderStatus" NOT NULL DEFAULT 'PENDING',
    "full_name" VARCHAR(150) NOT NULL,
    "company_name" VARCHAR(200),
    "phone_number" VARCHAR(50) NOT NULL,
    "national_code" VARCHAR(50),
    "province" VARCHAR(100) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "address" TEXT NOT NULL,
    "landline_number" VARCHAR(50),
    "notes" TEXT,
    "payment_method" VARCHAR(50) DEFAULT 'online_gateway',
    "payment_receipt_number" VARCHAR(100),
    "payment_receipt_url" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "internet_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable: site_contact_settings
CREATE TABLE IF NOT EXISTS "site_contact_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "recruitment_telegram" VARCHAR(100) DEFAULT '@ghoghnoos_academy',
    "recruitment_phone" VARCHAR(50) DEFAULT '09134761097',
    "recruitment_email" VARCHAR(255) DEFAULT 'careers@ghoghnoos.academy',
    "main_phone" VARCHAR(50) DEFAULT '09134761097',
    "support_phone_1" VARCHAR(50) DEFAULT '09224761097',
    "support_phone_2" VARCHAR(50) DEFAULT '09354761097',
    "emergency_phone" VARCHAR(50) DEFAULT '09004761097',
    "general_email" VARCHAR(255) DEFAULT 'info@ghoghnoos.academy',
    "whatsapp_number" VARCHAR(50) DEFAULT '09134761097',
    "instagram_url" VARCHAR(255) DEFAULT 'https://instagram.com/ghoghnoos_academy',
    "linkedin_url" VARCHAR(255) DEFAULT 'https://linkedin.com/company/ghoghnoos-academy',
    "youtube_url" VARCHAR(255) DEFAULT 'https://youtube.com/@ghoghnoos_academy',
    "aparat_url" VARCHAR(255) DEFAULT 'https://aparat.com/ghoghnoos_academy',
    "telegram_channel_url" VARCHAR(255) DEFAULT 'https://t.me/ghoghnoos_academy',
    "address" TEXT DEFAULT 'تهران، خیابان ولیعصر، بالاتر از تقاطع میرداماد، مجتمع تجاری و اداری پایتخت، برج شماره ۲، طبقه ۷، واحد ۷۰۴',
    "postal_code" VARCHAR(20) DEFAULT '1969764321',
    "google_maps_url" TEXT DEFAULT 'https://maps.google.com/?q=35.7592,51.4116',
    "neshan_url" TEXT DEFAULT 'https://neshan.org/maps/@35.7592,51.4116,16z',
    "balad_url" TEXT DEFAULT 'https://balad.ir/location?latitude=35.7592&longitude=51.4116',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_contact_settings_pkey" PRIMARY KEY ("id")
);

-- AlterTable: missing columns on existing tables
ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "affiliate_discount_amount" BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "affiliate_partner_id" UUID;

ALTER TABLE "organizations"
  ADD COLUMN IF NOT EXISTS "field_of_activity" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "official_gazette_file_name" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "official_gazette_file_url" TEXT,
  ADD COLUMN IF NOT EXISTS "requested_credit_limit" DECIMAL(15,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS "tax_clearance_file_name" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "tax_clearance_file_url" TEXT;

ALTER TABLE "partner_applications"
  ADD COLUMN IF NOT EXISTS "official_gazette_file_name" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "official_gazette_file_url" TEXT,
  ADD COLUMN IF NOT EXISTS "tax_clearance_file_name" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "tax_clearance_file_url" TEXT;

ALTER TABLE "user_bank_accounts"
  ADD COLUMN IF NOT EXISTS "card_number" VARCHAR(30);

ALTER TABLE "wallet_withdrawals"
  ADD COLUMN IF NOT EXISTS "account_holder" VARCHAR(150),
  ADD COLUMN IF NOT EXISTS "bank_name" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "card_number" VARCHAR(30),
  ADD COLUMN IF NOT EXISTS "shaba_number" VARCHAR(34),
  ADD COLUMN IF NOT EXISTS "tracking_code" VARCHAR(100);

ALTER TABLE "wallet_withdrawals"
  ALTER COLUMN "bank_account_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "payment_settings_key_key" ON "payment_settings"("key");
CREATE UNIQUE INDEX IF NOT EXISTS "affiliate_partners_user_id_key" ON "affiliate_partners"("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "affiliate_partners_partner_code_key" ON "affiliate_partners"("partner_code");
CREATE INDEX IF NOT EXISTS "idx_affiliate_partners_status" ON "affiliate_partners"("status");
CREATE INDEX IF NOT EXISTS "idx_affiliate_partners_code" ON "affiliate_partners"("partner_code");
CREATE INDEX IF NOT EXISTS "idx_affiliate_commissions_partner_id" ON "affiliate_commissions"("partner_id");
CREATE INDEX IF NOT EXISTS "idx_affiliate_commissions_order_id" ON "affiliate_commissions"("order_id");
CREATE INDEX IF NOT EXISTS "idx_affiliate_commissions_status" ON "affiliate_commissions"("status");
CREATE UNIQUE INDEX IF NOT EXISTS "affiliate_payouts_tracking_code_key" ON "affiliate_payouts"("tracking_code");
CREATE INDEX IF NOT EXISTS "idx_affiliate_payouts_partner_id" ON "affiliate_payouts"("partner_id");
CREATE INDEX IF NOT EXISTS "idx_internet_plans_is_active" ON "internet_plans"("isActive");
CREATE INDEX IF NOT EXISTS "idx_internet_plans_sort_order" ON "internet_plans"("sortOrder");
CREATE UNIQUE INDEX IF NOT EXISTS "internet_settings_key_key" ON "internet_settings"("key");
CREATE UNIQUE INDEX IF NOT EXISTS "internet_orders_tracking_code_key" ON "internet_orders"("tracking_code");
CREATE INDEX IF NOT EXISTS "idx_internet_orders_user_id" ON "internet_orders"("user_id");
CREATE INDEX IF NOT EXISTS "idx_internet_orders_tracking_code" ON "internet_orders"("tracking_code");
CREATE INDEX IF NOT EXISTS "idx_internet_orders_status" ON "internet_orders"("status");
CREATE INDEX IF NOT EXISTS "idx_orders_affiliate_partner_id" ON "orders"("affiliate_partner_id");

-- AddForeignKey (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_affiliate_partner_id_fkey') THEN
    ALTER TABLE "orders" ADD CONSTRAINT "orders_affiliate_partner_id_fkey" FOREIGN KEY ("affiliate_partner_id") REFERENCES "affiliate_partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'affiliate_partners_user_id_fkey') THEN
    ALTER TABLE "affiliate_partners" ADD CONSTRAINT "affiliate_partners_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'affiliate_commissions_partner_id_fkey') THEN
    ALTER TABLE "affiliate_commissions" ADD CONSTRAINT "affiliate_commissions_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "affiliate_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'affiliate_commissions_order_id_fkey') THEN
    ALTER TABLE "affiliate_commissions" ADD CONSTRAINT "affiliate_commissions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'affiliate_payouts_partner_id_fkey') THEN
    ALTER TABLE "affiliate_payouts" ADD CONSTRAINT "affiliate_payouts_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "affiliate_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'internet_orders_user_id_fkey') THEN
    ALTER TABLE "internet_orders" ADD CONSTRAINT "internet_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'internet_orders_plan_id_fkey') THEN
    ALTER TABLE "internet_orders" ADD CONSTRAINT "internet_orders_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "internet_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'internet_orders_site_id_fkey') THEN
    ALTER TABLE "internet_orders" ADD CONSTRAINT "internet_orders_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "user_addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
