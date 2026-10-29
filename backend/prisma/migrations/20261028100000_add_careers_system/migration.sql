-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "JobPositionType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'HYBRID', 'REMOTE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "JobApplicationStatus" AS ENUM ('PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "job_positions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "department" VARCHAR(150) NOT NULL,
    "type" "JobPositionType" NOT NULL DEFAULT 'FULL_TIME',
    "experience" VARCHAR(200),
    "location" VARCHAR(200),
    "badge" VARCHAR(100),
    "skills" JSONB DEFAULT '[]'::jsonb,
    "description" TEXT,
    "requirements" TEXT,
    "benefits" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "job_applications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "position_id" UUID NOT NULL,
    "full_name" VARCHAR(200) NOT NULL,
    "phone_number" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "about" TEXT,
    "resume_file_name" VARCHAR(255) NOT NULL,
    "resume_file_url" TEXT NOT NULL,
    "tracking_code" VARCHAR(50) NOT NULL,
    "status" "JobApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "admin_notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "job_positions_slug_key" ON "job_positions"("slug");
CREATE INDEX IF NOT EXISTS "idx_job_positions_is_active" ON "job_positions"("is_active");
CREATE INDEX IF NOT EXISTS "idx_job_positions_created_at_desc" ON "job_positions"("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_job_positions_slug" ON "job_positions"("slug");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "job_applications_tracking_code_key" ON "job_applications"("tracking_code");
CREATE INDEX IF NOT EXISTS "idx_job_applications_position_id" ON "job_applications"("position_id");
CREATE INDEX IF NOT EXISTS "idx_job_applications_status" ON "job_applications"("status");
CREATE INDEX IF NOT EXISTS "idx_job_applications_tracking_code" ON "job_applications"("tracking_code");
CREATE INDEX IF NOT EXISTS "idx_job_applications_created_at_desc" ON "job_applications"("created_at" DESC);

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "job_positions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
