import { PrismaClient, BrandStatus, ProductStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Velox Platform: Users, Roles, Loyalty & Hardware Catalog...');

  // 1. Roles
  const superAdminRole = await prisma.role.upsert({
    where: { code: 'SUPER_ADMIN' },
    update: {},
    create: {
      id: 'r0000000-0000-0000-0000-000000000001',
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
      id: 'r0000000-0000-0000-0000-000000000002',
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
      id: 'r0000000-0000-0000-0000-000000000004',
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
      id: 'lt000000-0000-0000-0000-000000000001',
      code: 'BRONZE',
      title: 'سطح برنزی',
      description: 'سطح پایه عضویت در باشگاه مشتریان ولوکس',
      minPoints: 0,
      cashbackPercent: 0.00,
      sortOrder: 1,
    },
  });

  const goldTier = await prisma.loyaltyTier.upsert({
    where: { code: 'GOLD' },
    update: {},
    create: {
      id: 'lt000000-0000-0000-0000-000000000003',
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
      id: 'o0000000-0000-0000-0000-000000000001',
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
    where: { phone: '09129999999' },
    update: {},
    create: {
      id: 'a0000000-0000-0000-0000-000000000001',
      phone: '09129999999',
      phoneVerifiedAt: new Date(),
      email: 'erfan@velox-net.ir',
      emailVerifiedAt: new Date(),
      name: 'عرفان سعیدی',
      isActive: true,
      profile: {
        create: {
          firstName: 'عرفان',
          lastName: 'سعیدی',
          nationalCode: '0079823401',
          nationalCodeVerified: true,
          avatarUrl: 'https://assets.velox.ir/avatars/erfan.jpg',
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

  const rostami = await prisma.user.upsert({
    where: { phone: '09123333333' },
    update: {},
    create: {
      id: 'a0000000-0000-0000-0000-000000000002',
      phone: '09123333333',
      phoneVerifiedAt: new Date(),
      email: 'rostami@pars-data.com',
      emailVerifiedAt: new Date(),
      name: 'مهندس کامران رستمی',
      isActive: true,
      profile: {
        create: {
          firstName: 'کامران',
          lastName: 'رستمی',
          nationalCode: '10103849201',
          nationalCodeVerified: true,
          avatarUrl: 'https://assets.velox.ir/avatars/rostami.jpg',
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
    where: { phone: '09121111111' },
    update: {},
    create: {
      id: 'a0000000-0000-0000-0000-000000000004',
      phone: '09121111111',
      phoneVerifiedAt: new Date(),
      email: 'rezvani.ali@gmail.com',
      emailVerifiedAt: new Date(),
      name: 'علیرضا رضوانی',
      isActive: true,
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
      logoUrl: 'https://assets.velox.ir/brands/cisco.svg',
      description: 'پیشگام جهانی در تولید سوئیچ‌ها، روترها و زیرساخت‌های شبکه‌های سازمانی',
      websiteUrl: 'https://www.cisco.com',
      status: BrandStatus.ACTIVE,
    },
  });

  const poeSwitches = await prisma.category.upsert({
    where: { slug: 'poe-switches' },
    update: {},
    create: {
      id: 'c0000000-0000-0000-0000-000000000004',
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

  const productSwitch = await prisma.product.upsert({
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
      shortDescription: 'سوئیچ مدیریتی لایه ۲ سازمانی سیسکو با ۲۴ پورت گیگابیت اترنت PoE+ و توان ۳۷۰ وات.',
      fullDescription: 'دستگاه WS-C2960X-24PS-L یکی از پرفروش‌ترین و قابل اعتمادترین سوئیچ‌های شبکه کمپانی سیسکو است.',
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
