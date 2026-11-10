ALTER TABLE "rfq_inquiries"
  ADD COLUMN IF NOT EXISTS "attached_file_name" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "attached_file_url" TEXT;
