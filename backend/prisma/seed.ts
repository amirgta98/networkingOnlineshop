import { PrismaClient, BrandStatus, ProductStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Fonix Academic Platform: Users, Roles, Loyalty & Hardware Catalog...');

  // 1. Roles
  const superAdminRole = await prisma.role.upsert({
    where: { code: 'SUPER_ADMIN' },
    update: {},
    create: {
      id: 'e0000000-0000-0000-0000-000000000001',
      code: 'SUPER_ADMIN',
      name: 'مالک و مدیر ارشد سیستم',
      description: 'دسترسی کامل به تمام امکانات، پیکربندی‌ها و تسویه‌حساب‌های مالی',
      isSystem: true,
    },
  });

  const partnerRole = await prisma.role.upsert({
    where: { code: 'PARTNER_B2B' },
    update: {},
    create: {
      id: 'e0000000-0000-0000-0000-000000000002',
      code: 'PARTNER_B2B',
      name: 'همکار سازمانی (B2B)',
      description: 'دسترسی به پنل همکاران، استعلام قیمت RFQ و خرید اعتباری',
      isSystem: true,
    },
  });

  const customerRole = await prisma.role.upsert({
    where: { code: 'CUSTOMER' },
    update: {},
    create: {
      id: 'e0000000-0000-0000-0000-000000000004',
      code: 'CUSTOMER',
      name: 'مشتری عادی',
      description: 'خرید آنلاین، ثبت نظر، مدیریت کیف پول و آدرس‌های شخصی',
      isSystem: true,
    },
  });

  // 2. Loyalty Tiers
  const bronzeTier = await prisma.loyaltyTier.upsert({
    where: { code: 'BRONZE' },
    update: {},
    create: {
      id: 'f0000000-0000-0000-0000-000000000001',
      code: 'BRONZE',
      title: 'سطح برنزی',
      description: 'سطح پایه عضویت در باشگاه مشتریان ققنوس آکادمی',
      minPoints: 0,
      cashbackPercent: 0.00,
      sortOrder: 1,
    },
  });

  const goldTier = await prisma.loyaltyTier.upsert({
    where: { code: 'GOLD' },
    update: {},
    create: {
      id: 'f0000000-0000-0000-0000-000000000003',
      code: 'GOLD',
      title: 'سطح طلایی',
      description: 'تخفیف ۵٪ نقدی و پشتیبانی VIP',
      minPoints: 2000,
      cashbackPercent: 5.00,
      sortOrder: 3,
    },
  });

  // 3. Organization (B2B Client)
  const org = await prisma.organization.upsert({
    where: { economicCode: '411389281729' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      legalName: 'شرکت ارتباطات داده‌گستر پارس (سهامی خاص)',
      brandName: 'پارس دیتا',
      economicCode: '411389281729',
      nationalCompanyId: '10103849201',
      registrationNumber: '389421',
      officePhone: '02188776655',
      officeAddress: 'تهران، خیابان ولیعصر، نرسیده به ونک، برج نگین',
      creditLimit: 500000000.00,
      creditBalance: 420000000.00,
    },
  });

  // 4. Users
  const erfan = await prisma.user.upsert({
    where: { phone: '09162947221' },
    update: {},
    create: {
      id: 'a0000000-0000-0000-0000-000000000001',
      phone: '09162947221',
      phoneVerifiedAt: new Date(),
      email: 'admin@fonix-accademic.ir',
      emailVerifiedAt: new Date(),
      name: 'عرفان سعیدی (مدیر سایت)',
      isActive: true,
      roles: {
        create: {
          roleId: superAdminRole.id,
        },
      },
      profile: {
        create: {
          firstName: 'عرفان',
          lastName: 'سعیدی',
          nationalCode: '0079823401',
          nationalCodeVerified: true,
          avatarUrl: 'https://fonix-accademic.ir/avatars/erfan.jpg',
        },
      },
      wallet: {
        create: {
          balance: 25000000.00,
          currency: 'IRT',
        },
      },
      loyaltyAccount: {
        create: {
          currentTierId: goldTier.id,
          pointsBalance: 2450,
          lifetimePoints: 2450,
        },
      },
    },
  });

  const owner = await prisma.user.upsert({
    where: { phone: '09134761097' },
    update: {},
    create: {
      id: 'a0000000-0000-0000-0000-000000000097',
      phone: '09134761097',
      phoneVerifiedAt: new Date(),
      email: 'owner@fonix-academic.ir',
      emailVerifiedAt: new Date(),
      name: 'صاحب سایت (مدیر کل)',
      isActive: true,
      roles: {
        create: {
          roleId: superAdminRole.id,
        },
      },
      profile: {
        create: {
          firstName: 'صاحب',
          lastName: 'سایت',
          nationalCode: '1097000001',
          nationalCodeVerified: true,
          avatarUrl: 'https://fonix-academic.ir/avatars/owner.jpg',
        },
      },
      wallet: {
        create: {
          balance: 50000000.0,
          currency: 'IRT',
        },
      },
      loyaltyAccount: {
        create: {
          currentTierId: goldTier.id,
          pointsBalance: 5000,
          lifetimePoints: 5000,
        },
      },
    },
  });

  const rostami = await prisma.user.upsert({
    where: { phone: '09162947222' },
    update: {},
    create: {
      id: 'a0000000-0000-0000-0000-000000000002',
      phone: '09162947222',
      phoneVerifiedAt: new Date(),
      email: 'rostami@pars-data.com',
      emailVerifiedAt: new Date(),
      name: 'مهندس کامران رستمی (همکار)',
      isActive: true,
      roles: {
        create: {
          roleId: partnerRole.id,
        },
      },
      profile: {
        create: {
          firstName: 'کامران',
          lastName: 'رستمی',
          nationalCode: '10103849201',
          nationalCodeVerified: true,
          avatarUrl: 'https://fonix-accademic.ir/avatars/rostami.jpg',
        },
      },
      wallet: {
        create: {
          balance: 12000000.00,
          currency: 'IRT',
        },
      },
      loyaltyAccount: {
        create: {
          currentTierId: goldTier.id,
          pointsBalance: 1850,
          lifetimePoints: 1850,
        },
      },
    },
  });

  const alireza = await prisma.user.upsert({
    where: { phone: '09162947223' },
    update: {},
    create: {
      id: 'a0000000-0000-0000-0000-000000000004',
      phone: '09162947223',
      phoneVerifiedAt: new Date(),
      email: 'rezvani.ali@gmail.com',
      emailVerifiedAt: new Date(),
      name: 'علیرضا رضوانی (کاربر ساده)',
      isActive: true,
      roles: {
        create: {
          roleId: customerRole.id,
        },
      },
      profile: {
        create: {
          firstName: 'علیرضا',
          lastName: 'رضوانی',
          nationalCode: '0078923411',
          nationalCodeVerified: true,
        },
      },
      wallet: {
        create: {
          balance: 1500000.00,
          currency: 'IRT',
        },
      },
      loyaltyAccount: {
        create: {
          currentTierId: bronzeTier.id,
          pointsBalance: 120,
          lifetimePoints: 120,
        },
      },
    },
  });

  // 5. Brands & Catalog
  const cisco = await prisma.brand.upsert({
    where: { slug: 'cisco' },
    update: {},
    create: {
      id: 'b0000000-0000-0000-0000-000000000001',
      name: 'Cisco',
      slug: 'cisco',
      logoUrl: 'https://fonix-accademic.ir/brands/cisco.svg',
      description: 'پیشگام جهانی در تولید سوئیچ‌ها، روترها و زیرساخت‌های شبکه‌های سازمانی',
      websiteUrl: 'https://www.cisco.com',
      status: BrandStatus.ACTIVE,
    },
  });

  const switchesCat = await prisma.category.upsert({
    where: { slug: 'switches' },
    update: {},
    create: {
      id: 'c0000000-0000-0000-0000-000000000001',
      shortName: 'سوئیچ‌های شبکه',
      longName: 'سوئیچ‌های مدیریتی شبکه سازمانی و دیتاسنتر',
      slug: 'switches',
      description: 'سوئیچ‌های لایه ۲ و لایه ۳ سیسکو و میکروتیک برای تجمیع پرسرعت داده، تأمین برق تحت شبکه (PoE+) و آپلینک‌های فیبر ۱۰G با پایداری ۹۹.۹۹٪ سازمانی.',
      icon: 'Network',
      badge: 'Managed & PoE+',
      sortOrder: 1,
      isActive: true,
    },
  });

  const routersCat = await prisma.category.upsert({
    where: { slug: 'routers' },
    update: {},
    create: {
      id: 'c0000000-0000-0000-0000-000000000002',
      shortName: 'روتر و فایروال',
      longName: 'روتر و دیوارهای آتش سخت‌افزاری هسته شبکه',
      slug: 'routers',
      description: 'مسیریاب‌های هسته شبکه سازمانی، روتربوردهای صنعتی و دیوارهای آتش با پردازنده‌های چند هسته‌ای قدرتمند جهت هدایت امن ترافیک، تونلینگ و IPsec.',
      icon: 'Router',
      badge: 'Core & Security',
      sortOrder: 2,
      isActive: true,
    },
  });

  const poeSwitches = await prisma.category.upsert({
    where: { slug: 'poe-switches' },
    update: {},
    create: {
      id: 'c0000000-0000-0000-0000-000000000004',
      parentId: switchesCat.id,
      shortName: 'سوئیچ‌های PoE',
      longName: 'سوئیچ‌های تامین توان الکتریکی گیگابیت PoE+',
      slug: 'poe-switches',
      description: 'سوئیچ‌های تامین توان الکتریکی برای دوربین‌های مداربسته و تلفن‌های IP.',
      icon: 'Zap',
      badge: 'Enterprise PoE+',
      sortOrder: 1,
      isActive: true,
    },
  });

  const mikrotik = await prisma.brand.upsert({
    where: { slug: 'mikrotik' },
    update: {},
    create: {
      id: 'b0000000-0000-0000-0000-000000000003',
      name: 'MikroTik',
      slug: 'mikrotik',
      logoUrl: 'https://fonix-accademic.ir/brands/mikrotik.svg',
      description: 'روترها و تجهیزات بی‌سیم ISP و دفاتر با سیستم‌عامل قدرتمند RouterOS',
      websiteUrl: 'https://mikrotik.com',
      status: BrandStatus.ACTIVE,
    },
  });

  // Product 1
  const productSwitch1 = await prisma.product.upsert({
    where: { slug: 'cisco-ws-c2960x-24ps-l' },
    update: {},
    create: {
      id: 'd0000000-0000-0000-0000-000000000001',
      brandId: cisco.id,
      categoryId: poeSwitches.id,
      name: 'سوئیچ ۲۴ پورت سیسکو مدل WS-C2960X-24PS-L',
      slug: 'cisco-ws-c2960x-24ps-l',
      sku: 'WS-C2960X-24PS-L',
      partNumber: 'WS-C2960X-24PS-L',
      shortDescription: 'سوئیچ مدیریتی لایه ۲ سازمانی سیسکو با ۲۴ پورت گیگابیت اترنت PoE+ و توان ۳۷۰ وات به همراه ۴ اسلات SFP آپلینک گیگابیت و قابلیت استکینگ FlexStack-Plus.',
      fullDescription: 'دستگاه WS-C2960X-24PS-L یکی از پرفروش‌ترین و قابل اعتمادترین سوئیچ‌های شبکه کمپانی سیسکو از سری پرچمدار Catalyst 2960-X می‌باشد.',
      basePrice: 18200000.00,
      compareAtPrice: 26000000.00,
      currency: 'IRT',
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      hasOriginalWarranty: true,
      isFreeExpressShipping: true,
      ratingAvg: 4.90,
      ratingCount: 47,
    },
  });

  // Product 2
  const productSwitch2 = await prisma.product.upsert({
    where: { slug: 'cisco-catalyst-2960x-24ps-l' },
    update: {},
    create: {
      id: 'd0000000-0000-0000-0000-000000000002',
      brandId: cisco.id,
      categoryId: switchesCat.id,
      name: 'سوئیچ ۲۴ پورت سیسکو Catalyst 2960-X',
      slug: 'cisco-catalyst-2960x-24ps-l',
      sku: 'WS-C2960X-24TS-L',
      partNumber: 'WS-C2960X-24TS-L',
      shortDescription: 'سوئیچ مدیریتی لایه ۲ حرفه‌ای با ظرفیت سوئیچینگ ۲۱۶ گیگابیت و استک‌پذیری FlexStack',
      fullDescription: 'سوئیچ‌های خانواده Catalyst 2960-X با پایداری حداکثری و مصرف برق بهینه گزینه استاندارد شبکه‌های سازمانی هستند.',
      basePrice: 48500000.00,
      compareAtPrice: 52000000.00,
      currency: 'IRT',
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      hasOriginalWarranty: true,
      isFreeExpressShipping: true,
      ratingAvg: 4.90,
      ratingCount: 38,
    },
  });

  // Product 3
  const productRouter = await prisma.product.upsert({
    where: { slug: 'mikrotik-ccr2004-16g-2s-plus' },
    update: {},
    create: {
      id: 'd0000000-0000-0000-0000-000000000003',
      brandId: mikrotik.id,
      categoryId: routersCat.id,
      name: 'روتر بورد میکروتیک CCR2004-16G-2S+',
      slug: 'mikrotik-ccr2004-16g-2s-plus',
      sku: 'CCR2004-16G-2S+',
      partNumber: 'CCR2004-16G-2S+',
      shortDescription: 'روتر قدرتمند هسته شبکه با توان پردازشی استثنایی و سیستم‌عامل RouterOS v7',
      fullDescription: 'ایده‌آل برای سرویس‌دهنده‌های اینترنت، شرکت‌های متوسط و بزرگ با حجم ترافیک سنگین و روتینگ BGP.',
      basePrice: 38200000.00,
      compareAtPrice: 41000000.00,
      currency: 'IRT',
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      hasOriginalWarranty: true,
      isFreeExpressShipping: true,
      ratingAvg: 4.80,
      ratingCount: 24,
    },
  });

  console.log('Seed completed successfully for users and catalog.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
