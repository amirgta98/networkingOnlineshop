-- 1. Create user_permissions table
CREATE TABLE IF NOT EXISTS "user_permissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "assigned_by" UUID,
    "assigned_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("id")
);

-- Foreign keys
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_user_permissions_user') THEN
        ALTER TABLE "user_permissions"
            ADD CONSTRAINT "fk_user_permissions_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_user_permissions_permission') THEN
        ALTER TABLE "user_permissions"
            ADD CONSTRAINT "fk_user_permissions_permission" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_user_permissions_assigner') THEN
        ALTER TABLE "user_permissions"
            ADD CONSTRAINT "fk_user_permissions_assigner" FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS "uq_user_permission" ON "user_permissions"("user_id", "permission_id");

-- 2. Insert SITE_MANAGER role
INSERT INTO "roles" ("id", "code", "name", "description", "is_system", "created_at", "updated_at")
VALUES
    ('c4e2d4ef-4d0e-4ff0-c4df-fcc69ec6cfec', 'SITE_MANAGER', 'سایتگردان (مدیر محدود پنل)', 'مدیریت بخش‌های منتخب پنل مدیریت با دسترسی سفارشی و قابل تنظیم', true, NOW(), NOW())
ON CONFLICT ("code") DO UPDATE SET
    "name" = EXCLUDED."name",
    "description" = EXCLUDED."description",
    "is_system" = EXCLUDED."is_system";

-- 3. Seed 21 admin permissions
INSERT INTO "permissions" ("id", "code", "module", "name", "description", "created_at")
VALUES
    ('d1111111-1111-4111-a111-111111111101', 'admin:overview', 'overview', 'پیشخوان و مرکز کنترل', 'نمای جامع فعالیت‌ها، شاخص‌های مالی، سفارش‌های در انتظار و پایش سلامت سرورها', NOW()),
    ('d1111111-1111-4111-a111-111111111102', 'admin:orders', 'commerce', 'سفارش‌ها و مرسولات کل', 'مدیریت سفارش‌های عادی و سازمانی، تغییر وضعیت فاکتورها و رهگیری ناوگان ارسال', NOW()),
    ('d1111111-1111-4111-a111-111111111103', 'admin:rfq', 'commerce', 'استعلام‌های پروژه‌ای (RFQ)', 'بررسی لیست تجمیعی تجهیزات استعلام‌شده توسط شرکت‌ها، تخصیص قیمت و صدور پیش‌فاکتور', NOW()),
    ('d1111111-1111-4111-a111-111111111104', 'admin:invoices', 'commerce', 'فاکتورها و اسناد مالیاتی', 'سامانه مودیان، محاسبه ارزش افزوده، دانلود دفاتر مالیاتی و گزارش‌های حسابداری رسمی', NOW()),
    ('d1111111-1111-4111-a111-111111111105', 'admin:wallet', 'commerce', 'درخواست‌های واریز و برداشت', 'مدیریت تسویه‌حساب‌های شتاب، تایید واریز پایا و ساتنا، استرداد و رهگیری شارژهای کیف پول', NOW()),
    ('d1111111-1111-4111-a111-111111111106', 'admin:shipping', 'commerce', 'روش‌ها و زمان‌بندی ارسال', 'تنظیم شیوه‌های حمل، سقف ارسال رایگان، بازه‌های زمانی و تقویم اعزام ناوگان', NOW()),
    ('d1111111-1111-4111-a111-111111111107', 'admin:special-offers', 'commerce', 'کمپین‌های فروش ویژه', 'طراحی جشنواره‌های تخفیف، زمان‌بندی تایمر معکوس، تخصیص سقف کالا و تخفیف سروری', NOW()),
    ('d1111111-1111-4111-a111-111111111108', 'admin:internet', 'commerce', 'مدیریت اینترنت و IP', 'تعریف و ویرایش پلن‌های اینترنت سازمانی، نرخ پایه IP استاتیک و پایش سفارش‌های خطوط', NOW()),
    ('d1111111-1111-4111-a111-111111111109', 'admin:partners', 'partners', 'همکاران سازمانی و B2B', 'بررسی مدارک ثبتی شرکت‌ها، تخصیص خط اعتباری تا ۵۰۰ میلیون تومان و چک‌های صیادی', NOW()),
    ('d1111111-1111-4111-a111-111111111110', 'admin:affiliates', 'partners', 'سیستم همکاری در فروش', 'مدیریت پورسانت‌ها، همکاران فعال، تسویه‌حساب‌ها و تنظیمات نرخ تخفیف', NOW()),
    ('d1111111-1111-4111-a111-111111111111', 'admin:users', 'partners', 'مدیریت کاربران و دسترسی‌ها', 'لیست کلیه خریداران، سطوح دسترسی سازمانی، سوابق ورود و وضعیت احراز هویت', NOW()),
    ('d1111111-1111-4111-a111-111111111112', 'admin:products', 'inventory', 'کاتالوگ و موجودی انبار', 'پایش موجودی فیزیکی سوئیچ‌ها، روترها، کابل و تجهیزات پسیو با اعلان هشدار اتمام موجودی', NOW()),
    ('d1111111-1111-4111-a111-111111111113', 'admin:categories', 'inventory', 'دسته‌بندی تجهیزات', 'ساختار درختی دسته‌بندی کالاها، آیکون‌های تخصصی، اسلاگ و اتصال به کاتالوگ محصولات', NOW()),
    ('d1111111-1111-4111-a111-111111111114', 'admin:installation', 'inventory', 'درخواست‌های نصب و پسیو شبکه', 'مدیریت سفارش‌های اجرای شبکه، کابل‌کشی، دیتاسنتر، فیبر نوری و رهگیری تیم‌های فنی', NOW()),
    ('d1111111-1111-4111-a111-111111111115', 'admin:warranty', 'inventory', 'خدمات گارانتی و RMA', 'ثبت و استعلام سریال نامبر تجهیزات سیسکو و نگزنس، تایید تعویض درجا و پیگیری فنی', NOW()),
    ('d1111111-1111-4111-a111-111111111116', 'admin:support', 'inventory', 'تیکت‌ها و پشتیبانی فنی', 'پاسخگویی به سوالات مهندسی شبکه، طراحی توپولوژی، کانفیگ و راهنمایی کارفرمایان', NOW()),
    ('d1111111-1111-4111-a111-111111111117', 'admin:security', 'system', 'پایش سرورها و لاگ امنیت', 'مانیتورینگ سوییچ‌های Core و Access، لاگ احراز هویت دو مرحله‌ای و نشست‌های فعال', NOW()),
    ('d1111111-1111-4111-a111-111111111118', 'admin:theme', 'system', 'شخصی‌سازی زنده تم', 'تغییر بلادرنگ پالت‌های رنگی، فونت فارسی، شعاع حاشیه‌ها و درخشش المان‌های UI', NOW()),
    ('d1111111-1111-4111-a111-111111111119', 'admin:articles', 'content', 'مقالات و وبلاگ تخصصی', 'نگارش و انتشار مقالات جامع، راهنماهای خرید سرور، آموزش شبکه و سئو مقالات', NOW()),
    ('d1111111-1111-4111-a111-111111111120', 'admin:portfolio', 'content', 'پروژه‌ها و نمونه‌کارها', 'مدیریت پروژه‌های دیتاسنتر، سوییچینگ سازمانی، کابل‌کشی ساخت‌یافته و دستاوردهای مهندسی', NOW()),
    ('d1111111-1111-4111-a111-111111111121', 'admin:careers', 'content', 'فرصت‌های شغلی و رزومه‌ها', 'مدیریت موقعیت‌های استخدامی، ایجاد، ویرایش، حذف، فعال/غیرفعال‌سازی و بررسی رزومه‌ها', NOW())
ON CONFLICT ("code") DO UPDATE SET
    "module" = EXCLUDED."module",
    "name" = EXCLUDED."name",
    "description" = EXCLUDED."description";
