-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "can_buy_internet" BOOLEAN NOT NULL DEFAULT false;
