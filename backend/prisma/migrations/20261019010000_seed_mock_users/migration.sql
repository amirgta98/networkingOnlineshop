-- Ensure mock users exist in the database with their respective roles
INSERT INTO "users" ("id", "phone", "phone_verified_at", "email", "email_verified_at", "name", "status", "is_active", "created_at", "updated_at")
VALUES
    ('00000000-0000-4000-a000-000000000001', '09000000001', NOW(), 'admin.mock@fonix-academic.ir', NOW(), 'مدیر سایت (عرفان سعیدی)', 'ACTIVE', true, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "users" ("id", "phone", "phone_verified_at", "email", "email_verified_at", "name", "status", "is_active", "created_at", "updated_at")
VALUES
    ('00000000-0000-4000-a000-000000000002', '09000000002', NOW(), 'partner.mock@fonix-academic.ir', NOW(), 'همکار سازمانی (کامران رستمی)', 'ACTIVE', true, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "users" ("id", "phone", "phone_verified_at", "email", "email_verified_at", "name", "status", "is_active", "created_at", "updated_at")
VALUES
    ('00000000-0000-4000-a000-000000000003', '09000000003', NOW(), 'customer.mock@fonix-academic.ir', NOW(), 'کاربر ساده (علیرضا رضوانی)', 'ACTIVE', true, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- Map roles
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
