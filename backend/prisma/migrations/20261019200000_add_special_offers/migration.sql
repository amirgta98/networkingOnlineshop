-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SCHEDULED', 'EXPIRED');

-- CreateTable
CREATE TABLE "special_offer_campaigns" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "tagline" VARCHAR(255),
    "description" TEXT,
    "banner_url" TEXT,
    "start_date" TIMESTAMPTZ NOT NULL,
    "end_date" TIMESTAMPTZ NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'ACTIVE',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "special_offer_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "special_offer_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "campaign_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "discount_type" "DiscountType" NOT NULL DEFAULT 'PERCENTAGE',
    "discount_value" DECIMAL(15,2) NOT NULL,
    "original_price" DECIMAL(15,2),
    "special_price" DECIMAL(15,2) NOT NULL,
    "stock_quota" INTEGER,
    "stock_sold" INTEGER NOT NULL DEFAULT 0,
    "max_per_order" INTEGER DEFAULT 5,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "special_offer_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_special_offers_display" ON "special_offer_campaigns"("status", "is_published", "priority");

-- CreateIndex
CREATE INDEX "idx_special_offers_dates" ON "special_offer_campaigns"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "idx_special_offer_items_product" ON "special_offer_items"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_campaign_product" ON "special_offer_items"("campaign_id", "product_id");

-- AddForeignKey
ALTER TABLE "special_offer_items" ADD CONSTRAINT "special_offer_items_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "special_offer_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "special_offer_items" ADD CONSTRAINT "special_offer_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
