-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "PartnerApplicationType" AS ENUM ('INDIVIDUAL', 'COMPANY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PartnerApplicationStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'NEED_DOCS', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PartnerTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "partner_applications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "applicant_type" "PartnerApplicationType" NOT NULL DEFAULT 'INDIVIDUAL',
    "full_name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "landline_phone" VARCHAR(50),
    "email" VARCHAR(255),
    "province" VARCHAR(100) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "address" TEXT NOT NULL,
    "postal_code" VARCHAR(20),
    "field_of_activity" VARCHAR(255) NOT NULL,
    "experience_years" INTEGER NOT NULL DEFAULT 1,
    "estimated_monthly_purchase" BIGINT NOT NULL DEFAULT 0,
    "requested_credit_limit" BIGINT NOT NULL DEFAULT 0,
    "website_or_social" VARCHAR(255),
    "notes" TEXT,
    "national_code" VARCHAR(20),
    "trade_name" VARCHAR(255),
    "business_license_number" VARCHAR(100),
    "company_name" VARCHAR(255),
    "company_type" VARCHAR(100),
    "national_company_id" VARCHAR(50),
    "economic_code" VARCHAR(50),
    "registration_number" VARCHAR(50),
    "established_year" VARCHAR(20),
    "ceo_or_agent_name" VARCHAR(255),
    "agent_position" VARCHAR(100),
    "documents" JSONB DEFAULT '[]'::jsonb,
    "status" "PartnerApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "tier" "PartnerTier" NOT NULL DEFAULT 'BRONZE',
    "approved_credit_limit" BIGINT NOT NULL DEFAULT 0,
    "assigned_account_manager" VARCHAR(150),
    "reviewer_notes" TEXT,
    "reviewed_at" TIMESTAMPTZ,
    "reviewed_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partner_applications_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "partner_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_partner_applications_user_id" ON "partner_applications"("user_id");
CREATE INDEX IF NOT EXISTS "idx_partner_applications_status" ON "partner_applications"("status");
CREATE INDEX IF NOT EXISTS "idx_partner_applications_type" ON "partner_applications"("applicant_type");
