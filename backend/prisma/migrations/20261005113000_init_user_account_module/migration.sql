-- ============================================================================
-- Migration: 20261005113000_init_user_account_module
-- Description: Production-Ready User, Profile, Security, RBAC, Organizations,
--              Bank Accounts, Addresses, Wallet, Loyalty, and Favorites Module.
-- ============================================================================

-- 1. ENUMS FOR USER & ACCOUNT SUBSYSTEM
DO $$ BEGIN
    CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "TwoFactorMethod" AS ENUM ('PIN', 'TOTP', 'SMS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "OrganizationMemberRole" AS ENUM ('OWNER', 'CEO', 'PURCHASING_MANAGER', 'ACCOUNTANT', 'TECHNICAL_MANAGER', 'MEMBER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "OrganizationStatus" AS ENUM ('PENDING_VERIFICATION', 'VERIFIED', 'SUSPENDED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "AddressType" AS ENUM ('CENTRAL_OFFICE', 'CENTRAL_WAREHOUSE', 'NETWORK_PROJECT_SITE', 'PERSONAL_RESIDENCE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "WalletTransactionType" AS ENUM ('DEPOSIT', 'PURCHASE', 'REFUND', 'WITHDRAWAL', 'CASHBACK', 'ADJUSTMENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "LoyaltyTransactionType" AS ENUM ('EARN', 'REDEEM', 'REFUND', 'EXPIRE', 'ADJUSTMENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. ENHANCE USERS TABLE
ALTER TABLE "users" 
    ADD COLUMN IF NOT EXISTS "phone" VARCHAR(20),
    ADD COLUMN IF NOT EXISTS "phone_verified_at" TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS "email_verified_at" TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN IF NOT EXISTS "archived_at" TIMESTAMPTZ;

-- Allow email to be nullable if mobile-first OTP login is used
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;

-- Ensure unique constraint on phone if column exists
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_users_phone') THEN
        ALTER TABLE "users" ADD CONSTRAINT "uq_users_phone" UNIQUE ("phone");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_user_has_identifier') THEN
        ALTER TABLE "users" ADD CONSTRAINT "chk_user_has_identifier" CHECK ("phone" IS NOT NULL OR "email" IS NOT NULL);
    END IF;
END $$;


-- 3. USER PROFILES
CREATE TABLE IF NOT EXISTS "user_profiles" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "national_code" VARCHAR(20),
    "national_code_verified" BOOLEAN NOT NULL DEFAULT false,
    "avatar_url" TEXT,
    "avatar_storage_key" VARCHAR(255),
    "bio" VARCHAR(500),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_user_profiles_user_id" UNIQUE ("user_id"),
    CONSTRAINT "uq_user_profiles_national_code" UNIQUE ("national_code")
);

-- 4. USER SECURITIES (Passwords, PIN, 2FA, Lockouts)
CREATE TABLE IF NOT EXISTS "user_securities" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "password_hash" VARCHAR(255),
    "security_pin_hash" VARCHAR(255),
    "pin_failed_attempts" INT NOT NULL DEFAULT 0,
    "pin_locked_until" TIMESTAMPTZ,
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_method" "TwoFactorMethod" NOT NULL DEFAULT 'PIN',
    "two_factor_secret" VARCHAR(255),
    "last_password_changed_at" TIMESTAMPTZ,
    "last_pin_changed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_user_securities_user_id" UNIQUE ("user_id"),
    CONSTRAINT "chk_pin_failed_attempts" CHECK ("pin_failed_attempts" >= 0)
);

-- 5. USER SESSIONS (Device Tracking & Revocation)
CREATE TABLE IF NOT EXISTS "user_sessions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "refresh_token_hash" VARCHAR(255) NOT NULL,
    "device_name" VARCHAR(150),
    "browser" VARCHAR(100),
    "os" VARCHAR(100),
    "ip_address" VARCHAR(45),
    "location" VARCHAR(150),
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "last_active_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. ROLE-BASED ACCESS CONTROL (RBAC)
CREATE TABLE IF NOT EXISTS "roles" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_roles_code" UNIQUE ("code")
);

CREATE TABLE IF NOT EXISTS "permissions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "code" VARCHAR(100) NOT NULL,
    "module" VARCHAR(50) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_permissions_code" UNIQUE ("code")
);

CREATE TABLE IF NOT EXISTS "role_permissions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "role_id" UUID NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE,
    "permission_id" UUID NOT NULL REFERENCES "permissions"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_role_permission" UNIQUE ("role_id", "permission_id")
);

CREATE TABLE IF NOT EXISTS "user_roles" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "role_id" UUID NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE,
    "assigned_by" UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "assigned_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_user_role" UNIQUE ("user_id", "role_id")
);

-- 7. ORGANIZATIONS / CORPORATE CLIENTS (B2B)
CREATE TABLE IF NOT EXISTS "organizations" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "legal_name" VARCHAR(255) NOT NULL,
    "brand_name" VARCHAR(255),
    "economic_code" VARCHAR(50),
    "national_company_id" VARCHAR(50),
    "registration_number" VARCHAR(50),
    "established_year" VARCHAR(10),
    "company_type" VARCHAR(50),
    "office_phone" VARCHAR(50),
    "office_address" TEXT,
    "postal_code" VARCHAR(20),
    "tax_file_status" VARCHAR(50),
    "credit_limit" NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    "credit_balance" NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    "status" "OrganizationStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "verified_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_organizations_economic_code" UNIQUE ("economic_code"),
    CONSTRAINT "uq_organizations_national_company_id" UNIQUE ("national_company_id"),
    CONSTRAINT "chk_org_credit_limit" CHECK ("credit_limit" >= 0)
);

CREATE TABLE IF NOT EXISTS "organization_members" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "role" "OrganizationMemberRole" NOT NULL DEFAULT 'MEMBER',
    "title" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_org_member" UNIQUE ("organization_id", "user_id")
);

-- 8. BANK ACCOUNTS
CREATE TABLE IF NOT EXISTS "user_bank_accounts" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "bank_name" VARCHAR(100) NOT NULL,
    "account_holder_name" VARCHAR(150) NOT NULL,
    "account_number" VARCHAR(50),
    "iban" VARCHAR(34) NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. NOTIFICATION SETTINGS
CREATE TABLE IF NOT EXISTS "user_notification_settings" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "order_shipping_sms" BOOLEAN NOT NULL DEFAULT true,
    "official_invoice_sms" BOOLEAN NOT NULL DEFAULT true,
    "new_device_login_alert" BOOLEAN NOT NULL DEFAULT true,
    "newsletter" BOOLEAN NOT NULL DEFAULT false,
    "email_notifications" BOOLEAN NOT NULL DEFAULT true,
    "push_notifications" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_user_notif_settings_user" UNIQUE ("user_id")
);

-- 10. USER ADDRESSES
CREATE TABLE IF NOT EXISTS "user_addresses" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "title" VARCHAR(100) NOT NULL,
    "type" "AddressType" NOT NULL DEFAULT 'CENTRAL_OFFICE',
    "recipient_first_name" VARCHAR(100) NOT NULL,
    "recipient_last_name" VARCHAR(100) NOT NULL,
    "recipient_mobile" VARCHAR(20) NOT NULL,
    "province" VARCHAR(100) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "detailed_address" TEXT NOT NULL,
    "plaque" VARCHAR(30) NOT NULL,
    "unit" VARCHAR(30),
    "postal_code" VARCHAR(20) NOT NULL,
    "latitude" DECIMAL(10, 7),
    "longitude" DECIMAL(11, 7),
    "delivery_notes" VARCHAR(500),
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 11. FINANCIAL ENGINE: WALLET & TRANSACTIONS
CREATE TABLE IF NOT EXISTS "wallets" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "balance" NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    "locked_balance" NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'IRT',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_wallets_user_id" UNIQUE ("user_id"),
    CONSTRAINT "chk_wallet_balance_positive" CHECK ("balance" >= 0),
    CONSTRAINT "chk_wallet_locked_balance" CHECK ("locked_balance" >= 0 AND "locked_balance" <= "balance")
);

CREATE TABLE IF NOT EXISTS "wallet_transactions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "wallet_id" UUID NOT NULL REFERENCES "wallets"("id") ON DELETE RESTRICT,
    "type" "WalletTransactionType" NOT NULL,
    "amount" NUMERIC(15, 2) NOT NULL,
    "balance_before" NUMERIC(15, 2) NOT NULL,
    "balance_after" NUMERIC(15, 2) NOT NULL,
    "tracking_code" VARCHAR(100) NOT NULL,
    "reference_type" VARCHAR(50),
    "reference_id" VARCHAR(100),
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_wallet_tx_tracking_code" UNIQUE ("tracking_code"),
    CONSTRAINT "chk_wallet_tx_amount" CHECK ("amount" > 0)
);

CREATE TABLE IF NOT EXISTS "wallet_withdrawals" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "wallet_id" UUID NOT NULL REFERENCES "wallets"("id") ON DELETE RESTRICT,
    "bank_account_id" UUID NOT NULL REFERENCES "user_bank_accounts"("id") ON DELETE RESTRICT,
    "amount" NUMERIC(15, 2) NOT NULL,
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'PENDING',
    "payout_reference" VARCHAR(100),
    "rejection_reason" VARCHAR(500),
    "requested_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMPTZ,
    "processed_by" UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chk_withdrawal_amount" CHECK ("amount" > 0)
);

-- 12. FAVORITES (WISHLIST)
CREATE TABLE IF NOT EXISTS "user_favorites" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "product_id" UUID NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_user_favorite" UNIQUE ("user_id", "product_id")
);

-- 13. LOYALTY & CUSTOMER CLUB
CREATE TABLE IF NOT EXISTS "loyalty_tiers" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "code" VARCHAR(50) NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "min_points" INT NOT NULL DEFAULT 0,
    "cashback_percent" NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    "sort_order" INT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_loyalty_tiers_code" UNIQUE ("code"),
    CONSTRAINT "chk_loyalty_min_points" CHECK ("min_points" >= 0),
    CONSTRAINT "chk_loyalty_cashback_cap" CHECK ("cashback_percent" >= 0.00 AND "cashback_percent" <= 100.00)
);

CREATE TABLE IF NOT EXISTS "loyalty_accounts" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "current_tier_id" UUID NOT NULL REFERENCES "loyalty_tiers"("id") ON DELETE RESTRICT,
    "points_balance" INT NOT NULL DEFAULT 0,
    "lifetime_points" INT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_loyalty_accounts_user_id" UNIQUE ("user_id"),
    CONSTRAINT "chk_loyalty_balance" CHECK ("points_balance" >= 0),
    CONSTRAINT "chk_loyalty_lifetime" CHECK ("lifetime_points" >= 0)
);

CREATE TABLE IF NOT EXISTS "loyalty_transactions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL REFERENCES "loyalty_accounts"("id") ON DELETE RESTRICT,
    "type" "LoyaltyTransactionType" NOT NULL,
    "points" INT NOT NULL,
    "points_before" INT NOT NULL,
    "points_after" INT NOT NULL,
    "reference_type" VARCHAR(50),
    "reference_id" VARCHAR(100),
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chk_loyalty_tx_points" CHECK ("points" > 0)
);

CREATE TABLE IF NOT EXISTS "loyalty_tier_history" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL REFERENCES "loyalty_accounts"("id") ON DELETE CASCADE,
    "tier_id" UUID NOT NULL REFERENCES "loyalty_tiers"("id") ON DELETE RESTRICT,
    "reason" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 14. PARTIAL UNIQUE INDEXES (POSTGRESQL SPECIFIC)
-- ============================================================================

-- Exactly ONE default address per user
CREATE UNIQUE INDEX IF NOT EXISTS "uq_user_single_default_address"
ON "user_addresses" ("user_id")
WHERE "is_default" = true;

-- Exactly ONE default bank account per user
CREATE UNIQUE INDEX IF NOT EXISTS "uq_user_single_default_bank_account"
ON "user_bank_accounts" ("user_id")
WHERE "is_default" = true;

-- ============================================================================
-- 15. PERFORMANCE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS "idx_users_status" ON "users" ("status");
CREATE INDEX IF NOT EXISTS "idx_users_created_at_desc" ON "users" ("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_user_sessions_lookup" ON "user_sessions" ("user_id", "is_revoked", "expires_at");
CREATE INDEX IF NOT EXISTS "idx_permissions_module" ON "permissions" ("module");
CREATE INDEX IF NOT EXISTS "idx_organizations_status" ON "organizations" ("status");
CREATE INDEX IF NOT EXISTS "idx_bank_accounts_user_id" ON "user_bank_accounts" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_addresses_user_id" ON "user_addresses" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_wallet_tx_history" ON "wallet_transactions" ("wallet_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_withdrawals_wallet_status" ON "wallet_withdrawals" ("wallet_id", "status");
CREATE INDEX IF NOT EXISTS "idx_withdrawals_status" ON "wallet_withdrawals" ("status");
CREATE INDEX IF NOT EXISTS "idx_favorites_user_id" ON "user_favorites" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_loyalty_tx_history" ON "loyalty_transactions" ("account_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_tier_history_lookup" ON "loyalty_tier_history" ("account_id", "created_at" DESC);

-- ============================================================================
-- 16. ATTACH AUTOMATIC UPDATED_AT TRIGGERS
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_user_profiles_updated_at') THEN
        CREATE TRIGGER trg_user_profiles_updated_at BEFORE UPDATE ON "user_profiles" FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_user_securities_updated_at') THEN
        CREATE TRIGGER trg_user_securities_updated_at BEFORE UPDATE ON "user_securities" FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_roles_updated_at') THEN
        CREATE TRIGGER trg_roles_updated_at BEFORE UPDATE ON "roles" FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_organizations_updated_at') THEN
        CREATE TRIGGER trg_organizations_updated_at BEFORE UPDATE ON "organizations" FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_organization_members_updated_at') THEN
        CREATE TRIGGER trg_organization_members_updated_at BEFORE UPDATE ON "organization_members" FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_user_bank_accounts_updated_at') THEN
        CREATE TRIGGER trg_user_bank_accounts_updated_at BEFORE UPDATE ON "user_bank_accounts" FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_user_notif_settings_updated_at') THEN
        CREATE TRIGGER trg_user_notif_settings_updated_at BEFORE UPDATE ON "user_notification_settings" FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_user_addresses_updated_at') THEN
        CREATE TRIGGER trg_user_addresses_updated_at BEFORE UPDATE ON "user_addresses" FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_wallets_updated_at') THEN
        CREATE TRIGGER trg_wallets_updated_at BEFORE UPDATE ON "wallets" FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_wallet_withdrawals_updated_at') THEN
        CREATE TRIGGER trg_wallet_withdrawals_updated_at BEFORE UPDATE ON "wallet_withdrawals" FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_loyalty_tiers_updated_at') THEN
        CREATE TRIGGER trg_loyalty_tiers_updated_at BEFORE UPDATE ON "loyalty_tiers" FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_loyalty_accounts_updated_at') THEN
        CREATE TRIGGER trg_loyalty_accounts_updated_at BEFORE UPDATE ON "loyalty_accounts" FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
    END IF;
END $$;
