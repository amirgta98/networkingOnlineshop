-- 1. Ensure system roles exist in roles table
INSERT INTO "roles" ("id", "code", "name", "description", "is_system", "created_at", "updated_at")
VALUES
    ('a2c0b2cf-2b8c-4eef-a2bd-dba47ca4acda', 'SUPER_ADMIN', 'مالک و مدیر ارشد سیستم', 'دسترسی کامل مدیریتی و فنی به تمام بخش‌های سیستم', true, NOW(), NOW()),
    ('b3d1c3df-3c9d-4ffe-b3ce-ebb58db5bdeb', 'STAFF_MANAGER', 'مدیر اجرایی و فروش', 'مدیریت سفارش‌ها، محصولات و مشتریان', true, NOW(), NOW()),
    ('78f116fe-3b5d-45e6-b37a-49b0306ff969', 'PARTNER_B2B', 'همکار سازمانی (B2B)', 'دسترسی به پورتال سازمانی، خرید عمده و استعلام قیمت', true, NOW(), NOW()),
    ('28ba5eba-08d4-4a12-a5d8-40bbe477b416', 'CUSTOMER', 'مشتری عادی', 'کاربر معمولی فروشگاه', true, NOW(), NOW())
ON CONFLICT ("code") DO UPDATE SET
    "name" = EXCLUDED."name",
    "is_system" = EXCLUDED."is_system";

-- 2. Link mock users to their intended roles if not already mapped
INSERT INTO "user_roles" ("id", "user_id", "role_id")
SELECT gen_random_uuid(), '00000000-0000-4000-a000-000000000001', r."id"
FROM "roles" r WHERE r."code" = 'SUPER_ADMIN'
ON CONFLICT ("user_id", "role_id") DO NOTHING;

INSERT INTO "user_roles" ("id", "user_id", "role_id")
SELECT gen_random_uuid(), '00000000-0000-4000-a000-000000000002', r."id"
FROM "roles" r WHERE r."code" = 'PARTNER_B2B'
ON CONFLICT ("user_id", "role_id") DO NOTHING;

INSERT INTO "user_roles" ("id", "user_id", "role_id")
SELECT gen_random_uuid(), '00000000-0000-4000-a000-000000000003', r."id"
FROM "roles" r WHERE r."code" = 'CUSTOMER'
ON CONFLICT ("user_id", "role_id") DO NOTHING;

-- 3. Ensure user with phone 09162947221 exists, is active, and has SUPER_ADMIN role
INSERT INTO "users" ("id", "phone", "phone_verified_at", "email", "name", "status", "is_active", "created_at", "updated_at")
VALUES
    ('e5fac114-7b90-4528-b68f-b16d3985d4c7', '09162947221', NOW(), 'erfan.saeedi@fonix-academic.ir', 'عرفان سعیدی', 'ACTIVE', true, NOW(), NOW())
ON CONFLICT ("phone") DO UPDATE SET
    "name" = CASE WHEN "users"."name" = '09162947221' OR "users"."name" IS NULL THEN 'عرفان سعیدی' ELSE "users"."name" END,
    "status" = 'ACTIVE',
    "is_active" = true,
    "phone_verified_at" = COALESCE("users"."phone_verified_at", NOW());

-- 4. Map user with phone 09162947221 to SUPER_ADMIN role
INSERT INTO "user_roles" ("id", "user_id", "role_id")
SELECT gen_random_uuid(), u."id", r."id"
FROM "users" u
CROSS JOIN "roles" r
WHERE u."phone" = '09162947221' AND r."code" = 'SUPER_ADMIN'
ON CONFLICT ("user_id", "role_id") DO NOTHING;
