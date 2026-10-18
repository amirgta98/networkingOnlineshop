-- ============================================================================
-- Migration: 20261005100000_init_product_module
-- Description: Production-ready PostgreSQL schema for Product Database Module
-- Features: Strict Constraints, Partial Indexes, GIN Full-Text Index, Triggers
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE "BrandStatus" AS ENUM ('ACTIVE', 'INACTIVE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "VariantStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ProductRelationType" AS ENUM ('COMPATIBLE', 'RELATED', 'RECOMMENDED', 'ALTERNATIVE', 'ACCESSORY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. CORE TABLES
-- ============================================================================

-- Table: users (Aligned with existing clean architecture User domain)
CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_users_email" UNIQUE ("email")
);

-- Table: brands
CREATE TABLE IF NOT EXISTS "brands" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(150) NOT NULL,
    "logo_url" TEXT,
    "description" TEXT,
    "website_url" VARCHAR(255),
    "status" "BrandStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_brands_name" UNIQUE ("name"),
    CONSTRAINT "uq_brands_slug" UNIQUE ("slug")
);

-- Table: categories (Hierarchical Adjacency List)
CREATE TABLE IF NOT EXISTS "categories" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "parent_id" UUID REFERENCES "categories"("id") ON DELETE SET NULL,
    "short_name" VARCHAR(100) NOT NULL,
    "long_name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "icon" VARCHAR(100),
    "badge" VARCHAR(100),
    "sort_order" INT NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_categories_slug" UNIQUE ("slug")
);

-- Table: category_features (Characteristics and specifications of category)
CREATE TABLE IF NOT EXISTS "category_features" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "category_id" UUID NOT NULL REFERENCES "categories"("id") ON DELETE CASCADE,
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "icon" VARCHAR(100),
    "sort_order" INT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- Table: products
CREATE TABLE IF NOT EXISTS "products" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "brand_id" UUID NOT NULL REFERENCES "brands"("id") ON DELETE RESTRICT,
    "category_id" UUID NOT NULL REFERENCES "categories"("id") ON DELETE RESTRICT,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "sku" VARCHAR(100),
    "part_number" VARCHAR(100),
    "short_description" VARCHAR(500),
    "full_description" TEXT,
    "base_price" NUMERIC(15, 2) NOT NULL,
    "compare_at_price" NUMERIC(15, 2),
    "currency" VARCHAR(3) NOT NULL DEFAULT 'IRT',
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "has_original_warranty" BOOLEAN NOT NULL DEFAULT true,
    "is_free_express_shipping" BOOLEAN NOT NULL DEFAULT false,
    "rating_avg" NUMERIC(3, 2) NOT NULL DEFAULT 0.00,
    "rating_count" INT NOT NULL DEFAULT 0,
    "archived_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_products_slug" UNIQUE ("slug"),
    CONSTRAINT "uq_products_sku" UNIQUE ("sku"),
    CONSTRAINT "chk_products_base_price" CHECK ("base_price" >= 0),
    CONSTRAINT "chk_products_compare_price" CHECK ("compare_at_price" IS NULL OR "compare_at_price" >= 0),
    CONSTRAINT "chk_products_rating_avg" CHECK ("rating_avg" >= 0.00 AND "rating_avg" <= 5.00),
    CONSTRAINT "chk_products_rating_count" CHECK ("rating_count" >= 0)
);

-- Table: product_images
CREATE TABLE IF NOT EXISTS "product_images" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
    "url" TEXT NOT NULL,
    "storage_key" VARCHAR(255),
    "alt_text" VARCHAR(255),
    "sort_order" INT NOT NULL DEFAULT 0,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: product_options
CREATE TABLE IF NOT EXISTS "product_options" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "sort_order" INT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_product_option_code" UNIQUE ("product_id", "code")
);

-- Table: product_option_values
CREATE TABLE IF NOT EXISTS "product_option_values" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "option_id" UUID NOT NULL REFERENCES "product_options"("id") ON DELETE CASCADE,
    "label" VARCHAR(150) NOT NULL,
    "value" VARCHAR(100) NOT NULL,
    "color_hex" VARCHAR(7),
    "price_modifier" NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    "sort_order" INT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_option_value" UNIQUE ("option_id", "value")
);

-- Table: product_variants
CREATE TABLE IF NOT EXISTS "product_variants" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
    "sku" VARCHAR(100) NOT NULL,
    "part_number" VARCHAR(100),
    "price" NUMERIC(15, 2) NOT NULL,
    "compare_at_price" NUMERIC(15, 2),
    "weight_grams" INT,
    "status" "VariantStatus" NOT NULL DEFAULT 'ACTIVE',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_variants_sku" UNIQUE ("sku"),
    CONSTRAINT "chk_variants_price" CHECK ("price" >= 0),
    CONSTRAINT "chk_variants_compare_price" CHECK ("compare_at_price" IS NULL OR "compare_at_price" >= 0),
    CONSTRAINT "chk_variants_weight" CHECK ("weight_grams" IS NULL OR "weight_grams" >= 0)
);

-- Table: variant_option_values (Bridge table)
CREATE TABLE IF NOT EXISTS "variant_option_values" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "variant_id" UUID NOT NULL REFERENCES "product_variants"("id") ON DELETE CASCADE,
    "option_value_id" UUID NOT NULL REFERENCES "product_option_values"("id") ON DELETE RESTRICT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_variant_option_value" UNIQUE ("variant_id", "option_value_id")
);

-- Table: product_inventories
CREATE TABLE IF NOT EXISTS "product_inventories" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "variant_id" UUID NOT NULL REFERENCES "product_variants"("id") ON DELETE CASCADE,
    "quantity" INT NOT NULL DEFAULT 0,
    "reserved_quantity" INT NOT NULL DEFAULT 0,
    "safety_stock" INT NOT NULL DEFAULT 0,
    "allow_backorder" BOOLEAN NOT NULL DEFAULT false,
    "warehouse_code" VARCHAR(50) NOT NULL DEFAULT 'MAIN',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_inventories_variant" UNIQUE ("variant_id"),
    CONSTRAINT "chk_inventory_quantity" CHECK ("quantity" >= 0),
    CONSTRAINT "chk_inventory_reserved" CHECK ("reserved_quantity" >= 0),
    CONSTRAINT "chk_inventory_safety" CHECK ("safety_stock" >= 0),
    CONSTRAINT "chk_inventory_available" CHECK ("reserved_quantity" <= "quantity")
);

-- Table: product_discounts (Independent promotional discount)
CREATE TABLE IF NOT EXISTS "product_discounts" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
    "discount_type" "DiscountType" NOT NULL,
    "discount_value" NUMERIC(15, 2) NOT NULL,
    "starts_at" TIMESTAMPTZ,
    "ends_at" TIMESTAMPTZ,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chk_discounts_value" CHECK ("discount_value" > 0),
    CONSTRAINT "chk_discounts_time_range" CHECK ("ends_at" IS NULL OR "starts_at" IS NULL OR "ends_at" > "starts_at"),
    CONSTRAINT "chk_discounts_percentage_cap" CHECK ("discount_type" <> 'PERCENTAGE' OR "discount_value" <= 100.00)
);

-- Table: product_tiered_discounts (Quantity-based wholesale tier pricing)
CREATE TABLE IF NOT EXISTS "product_tiered_discounts" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
    "min_quantity" INT NOT NULL,
    "discount_type" "DiscountType" NOT NULL,
    "discount_value" NUMERIC(15, 2) NOT NULL,
    "label" VARCHAR(150),
    "sort_order" INT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_tiered_discount_min_qty" UNIQUE ("product_id", "min_quantity"),
    CONSTRAINT "chk_tiered_min_quantity" CHECK ("min_quantity" > 0),
    CONSTRAINT "chk_tiered_discount_value" CHECK ("discount_value" > 0),
    CONSTRAINT "chk_tiered_percentage_cap" CHECK ("discount_type" <> 'PERCENTAGE' OR "discount_value" <= 100.00)
);

-- Table: product_spec_groups
CREATE TABLE IF NOT EXISTS "product_spec_groups" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
    "name" VARCHAR(150) NOT NULL,
    "sort_order" INT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_spec_group_product_name" UNIQUE ("product_id", "name")
);

-- Table: product_specifications
CREATE TABLE IF NOT EXISTS "product_specifications" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "group_id" UUID NOT NULL REFERENCES "product_spec_groups"("id") ON DELETE CASCADE,
    "label" VARCHAR(150) NOT NULL,
    "value" TEXT NOT NULL,
    "unit" VARCHAR(50),
    "is_highlight" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: product_expert_reviews
CREATE TABLE IF NOT EXISTS "product_expert_reviews" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "icon" VARCHAR(50) NOT NULL DEFAULT 'cpu',
    "sort_order" INT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: product_deployment_scenarios
CREATE TABLE IF NOT EXISTS "product_deployment_scenarios" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "tag" VARCHAR(100) NOT NULL,
    "sort_order" INT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: product_reviews
CREATE TABLE IF NOT EXISTS "product_reviews" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "author_name" VARCHAR(150),
    "author_role" VARCHAR(150),
    "company_name" VARCHAR(150),
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "rating" SMALLINT NOT NULL,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "is_verified_purchase" BOOLEAN NOT NULL DEFAULT false,
    "likes_count" INT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chk_review_rating_range" CHECK ("rating" >= 1 AND "rating" <= 5),
    CONSTRAINT "chk_review_likes_positive" CHECK ("likes_count" >= 0)
);

-- Table: product_review_likes
CREATE TABLE IF NOT EXISTS "product_review_likes" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "review_id" UUID NOT NULL REFERENCES "product_reviews"("id") ON DELETE CASCADE,
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_review_like_user" UNIQUE ("review_id", "user_id")
);

-- Table: product_documents
CREATE TABLE IF NOT EXISTS "product_documents" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "file_name" VARCHAR(255) NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size_bytes" BIGINT NOT NULL,
    "file_size_display" VARCHAR(50) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "file_extension" VARCHAR(20) NOT NULL,
    "sort_order" INT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chk_document_file_size" CHECK ("file_size_bytes" >= 0)
);

-- Table: product_relations (Self-referencing graph)
CREATE TABLE IF NOT EXISTS "product_relations" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "source_product_id" UUID NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
    "target_product_id" UUID NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
    "relation_type" "ProductRelationType" NOT NULL,
    "sort_order" INT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_product_relation_type" UNIQUE ("source_product_id", "target_product_id", "relation_type"),
    CONSTRAINT "chk_product_not_self_related" CHECK ("source_product_id" <> "target_product_id")
);

-- ============================================================================
-- 5. PARTIAL INDEXES & BUSINESS CONSTRAINTS
-- ============================================================================

-- Enforce exactly ONE primary image per product in PostgreSQL
CREATE UNIQUE INDEX IF NOT EXISTS "uq_product_single_primary_image"
ON "product_images" ("product_id")
WHERE "is_primary" = true;

-- Enforce exactly ONE default variant per product in PostgreSQL
CREATE UNIQUE INDEX IF NOT EXISTS "uq_product_single_default_variant"
ON "product_variants" ("product_id")
WHERE "is_default" = true;

-- ============================================================================
-- 6. QUERY PERFORMANCE INDEXES
-- ============================================================================

-- Brand indexes
CREATE INDEX IF NOT EXISTS "idx_brands_status" ON "brands" ("status");

-- Category indexes
CREATE INDEX IF NOT EXISTS "idx_categories_parent_id" ON "categories" ("parent_id");
CREATE INDEX IF NOT EXISTS "idx_categories_active_sort" ON "categories" ("is_active", "sort_order");
CREATE INDEX IF NOT EXISTS "idx_category_features_sort" ON "category_features" ("category_id", "sort_order");


-- Product core query indexes
CREATE INDEX IF NOT EXISTS "idx_products_brand_id" ON "products" ("brand_id");
CREATE INDEX IF NOT EXISTS "idx_products_category_id" ON "products" ("category_id");
CREATE INDEX IF NOT EXISTS "idx_products_base_price" ON "products" ("base_price");
CREATE INDEX IF NOT EXISTS "idx_products_status_featured" ON "products" ("status", "is_featured");
CREATE INDEX IF NOT EXISTS "idx_products_created_at_desc" ON "products" ("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_products_catalog_query" ON "products" ("status", "category_id", "base_price");

-- Full-text Search GIN Index on Products (English & Simple alphanumeric hardware codes)
CREATE INDEX IF NOT EXISTS "idx_products_search_gin" ON "products"
USING gin (to_tsvector('simple', "name" || ' ' || COALESCE("short_description", '') || ' ' || COALESCE("sku", '') || ' ' || COALESCE("part_number", '')));

-- Images sort index
CREATE INDEX IF NOT EXISTS "idx_product_images_sort" ON "product_images" ("product_id", "sort_order");

-- Options sort index
CREATE INDEX IF NOT EXISTS "idx_product_options_sort" ON "product_options" ("product_id", "sort_order");
CREATE INDEX IF NOT EXISTS "idx_option_values_sort" ON "product_option_values" ("option_id", "sort_order");

-- Variants lookup index
CREATE INDEX IF NOT EXISTS "idx_variants_product_status" ON "product_variants" ("product_id", "status");
CREATE INDEX IF NOT EXISTS "idx_vov_option_value_id" ON "variant_option_values" ("option_value_id");

-- Inventory index
CREATE INDEX IF NOT EXISTS "idx_inventory_warehouse" ON "product_inventories" ("warehouse_code");

-- Discounts indexes
CREATE INDEX IF NOT EXISTS "idx_discounts_product_active" ON "product_discounts" ("product_id", "is_active");
CREATE INDEX IF NOT EXISTS "idx_discounts_validity_window" ON "product_discounts" ("starts_at", "ends_at");
CREATE INDEX IF NOT EXISTS "idx_tiered_discounts_sort" ON "product_tiered_discounts" ("product_id", "sort_order");

-- Technical specs indexes
CREATE INDEX IF NOT EXISTS "idx_spec_groups_sort" ON "product_spec_groups" ("product_id", "sort_order");
CREATE INDEX IF NOT EXISTS "idx_specifications_sort" ON "product_specifications" ("group_id", "sort_order");

-- Expert reviews & Scenarios indexes
CREATE INDEX IF NOT EXISTS "idx_expert_reviews_sort" ON "product_expert_reviews" ("product_id", "sort_order");
CREATE INDEX IF NOT EXISTS "idx_deployment_scenarios_sort" ON "product_deployment_scenarios" ("product_id", "sort_order");

-- Reviews indexes
CREATE INDEX IF NOT EXISTS "idx_reviews_product_approval" ON "product_reviews" ("product_id", "is_approved", "rating");
CREATE INDEX IF NOT EXISTS "idx_reviews_user_id" ON "product_reviews" ("user_id");

-- Documents index
CREATE INDEX IF NOT EXISTS "idx_documents_product_sort" ON "product_documents" ("product_id", "sort_order");

-- Relations indexes
CREATE INDEX IF NOT EXISTS "idx_product_relations_source" ON "product_relations" ("source_product_id", "relation_type");
CREATE INDEX IF NOT EXISTS "idx_product_relations_target" ON "product_relations" ("target_product_id");

-- ============================================================================
-- 7. ATTACH AUTOMATIC UPDATED_AT TRIGGERS
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_users_updated_at') THEN
        CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_brands_updated_at') THEN
        CREATE TRIGGER trg_brands_updated_at BEFORE UPDATE ON "brands" FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_categories_updated_at') THEN
        CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON "categories" FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_products_updated_at') THEN
        CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON "products" FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_variants_updated_at') THEN
        CREATE TRIGGER trg_variants_updated_at BEFORE UPDATE ON "product_variants" FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_inventories_updated_at') THEN
        CREATE TRIGGER trg_inventories_updated_at BEFORE UPDATE ON "product_inventories" FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_discounts_updated_at') THEN
        CREATE TRIGGER trg_discounts_updated_at BEFORE UPDATE ON "product_discounts" FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_reviews_updated_at') THEN
        CREATE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON "product_reviews" FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
    END IF;
END $$;
