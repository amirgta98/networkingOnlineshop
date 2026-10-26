-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "InstallationStatus" AS ENUM ('PENDING_REVIEW', 'ASSIGNED', 'SURVEY_SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "installation_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tracking_code" VARCHAR(50) NOT NULL,
    "service_type" VARCHAR(100) NOT NULL,
    "secondary_services" JSONB DEFAULT '[]'::jsonb,
    "project_scale" VARCHAR(50) NOT NULL DEFAULT 'medium',
    "building_type" VARCHAR(50) NOT NULL DEFAULT 'office',
    "approximate_area" INTEGER NOT NULL DEFAULT 0,
    "node_count" INTEGER NOT NULL DEFAULT 0,
    "cctv_count" INTEGER NOT NULL DEFAULT 0,
    "rack_count" INTEGER NOT NULL DEFAULT 0,
    "fiber_core_count" INTEGER NOT NULL DEFAULT 0,
    "equipment_status" VARCHAR(100) NOT NULL DEFAULT 'need_purchase_from_netmarket',
    "needs_fluke_test" BOOLEAN NOT NULL DEFAULT true,
    "needs_onsite_survey" BOOLEAN NOT NULL DEFAULT true,
    "preferred_timeline" VARCHAR(50) NOT NULL DEFAULT 'this_week',
    "province" VARCHAR(100) NOT NULL DEFAULT 'تهران',
    "city" VARCHAR(100) NOT NULL DEFAULT 'تهران',
    "address" TEXT NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "company_name" VARCHAR(255),
    "phone_number" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255),
    "notes" TEXT,
    "has_attachment" BOOLEAN NOT NULL DEFAULT false,
    "attachment_name" VARCHAR(255),
    "attachment_url" TEXT,
    "status" "InstallationStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "estimated_days" VARCHAR(100),
    "min_estimated_cost" BIGINT NOT NULL DEFAULT 0,
    "max_estimated_cost" BIGINT NOT NULL DEFAULT 0,
    "final_quotation_amount" BIGINT,
    "assigned_team_lead" VARCHAR(150),
    "assigned_team_role" VARCHAR(150),
    "assigned_team_phone" VARCHAR(50),
    "status_percent" INTEGER NOT NULL DEFAULT 20,
    "current_step_index" INTEGER NOT NULL DEFAULT 0,
    "tracking_steps" JSONB DEFAULT '[]'::jsonb,
    "admin_notes" TEXT,
    "user_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "installation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "installation_requests_tracking_code_key" ON "installation_requests"("tracking_code");
CREATE INDEX IF NOT EXISTS "idx_installation_tracking_code" ON "installation_requests"("tracking_code");
CREATE INDEX IF NOT EXISTS "idx_installation_phone_number" ON "installation_requests"("phone_number");
CREATE INDEX IF NOT EXISTS "idx_installation_status" ON "installation_requests"("status");
CREATE INDEX IF NOT EXISTS "idx_installation_user_id" ON "installation_requests"("user_id");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "installation_requests" ADD CONSTRAINT "installation_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
