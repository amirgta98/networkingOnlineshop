import { PrismaClient, BrandStatus, ProductStatus, VariantStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Repairing Categories, Products, and Order Items with Clean UTF-8 ---');

  // 1. Repair Categories
  const switchesCat = await prisma.category.upsert({
    where: { slug: 'switches' },
    update: {
      shortName: 'سوئیچ‌های شبکه',
      longName: 'سوئیچ‌های مدیریتی شبکه سازمانی و دیتاسنتر',
      description: 'سوئیچ‌های لایه ۲ و لایه ۳ سیسکو و میکروتیک برای تجمیع پرسرعت داده، تأمین برق تحت شبکه (PoE+) و آپلینک‌های فیبر ۱۰G با پایداری ۹۹.۹۹٪ سازمانی.',
      icon: 'Network',
      badge: 'Managed & PoE+',
      sortOrder: 1,
      isActive: true,
    },
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
    update: {
      shortName: 'روتر و فایروال',
      longName: 'روتر و دیوارهای آتش سخت‌افزاری هسته شبکه',
      description: 'مسیریاب‌های هسته شبکه سازمانی، روتربوردهای صنعتی و دیوارهای آتش با پردازنده‌های چند هسته‌ای قدرتمند جهت هدایت امن ترافیک، تونلینگ و IPsec.',
      icon: 'Router',
      badge: 'Core & Security',
      sortOrder: 2,
      isActive: true,
    },
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

  const cablesCat = await prisma.category.upsert({
    where: { slug: 'cables' },
    update: {
      shortName: 'کابل شبکه',
      longName: 'کابل‌کشی ساخت‌یافته و پسیو شبکه',
      description: 'کابل‌های شبکه مسی Cat6 و Cat6A تست فلوک چنل و پرمننت با خلوص ۱۰۰٪ مس بدون افت فرکانس.',
      icon: 'Cable',
      badge: 'Cat6 / Cat6A / Cat7',
      sortOrder: 3,
      isActive: true,
    },
    create: {
      id: 'c0000000-0000-0000-0000-000000000003',
      shortName: 'کابل شبکه',
      longName: 'کابل‌کشی ساخت‌یافته و پسیو شبکه',
      slug: 'cables',
      description: 'کابل‌های شبکه مسی Cat6 و Cat6A تست فلوک چنل و پرمننت با خلوص ۱۰۰٪ مس بدون افت فرکانس.',
      icon: 'Cable',
      badge: 'Cat6 / Cat6A / Cat7',
      sortOrder: 3,
      isActive: true,
    },
  });

  const poeCat = await prisma.category.upsert({
    where: { slug: 'poe-switches' },
    update: {
      shortName: 'سوئیچ‌های PoE',
      longName: 'سوئیچ‌های تامین توان الکتریکی گیگابیت PoE+',
      description: 'سوئیچ‌های تامین توان الکتریکی برای دوربین‌های مداربسته، اکسس‌پوینت‌ها و تلفن‌های تحت شبکه IP با استاندارد 802.3at.',
      icon: 'Zap',
      badge: 'Enterprise PoE+',
      sortOrder: 1,
      isActive: true,
    },
    create: {
      id: 'c0000000-0000-0000-0000-000000000004',
      parentId: switchesCat.id,
      shortName: 'سوئیچ‌های PoE',
      longName: 'سوئیچ‌های تامین توان الکتریکی گیگابیت PoE+',
      slug: 'poe-switches',
      description: 'سوئیچ‌های تامین توان الکتریکی برای دوربین‌های مداربسته، اکسس‌پوینت‌ها و تلفن‌های تحت شبکه IP با استاندارد 802.3at.',
      icon: 'Zap',
      badge: 'Enterprise PoE+',
      sortOrder: 1,
      isActive: true,
    },
  });

  // 2. Ensure Brands
  const cisco = await prisma.brand.upsert({
    where: { slug: 'cisco' },
    update: {
      name: 'Cisco',
      description: 'پیشگام جهانی در تولید سوئیچ‌ها، روترها و زیرساخت‌های شبکه‌های سازمانی',
    },
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

  const mikrotik = await prisma.brand.upsert({
    where: { slug: 'mikrotik' },
    update: {
      name: 'MikroTik',
      description: 'روترها و تجهیزات بی‌سیم ISP و دفاتر با سیستم‌عامل قدرتمند RouterOS',
    },
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

  // 3. Products
  // Product 1: Cisco Special Offer
  const prod1 = await prisma.product.upsert({
    where: { slug: 'cisco-ws-c2960x-24ps-l' },
    update: {
      name: 'سوئیچ ۲۴ پورت سیسکو مدل WS-C2960X-24PS-L',
      shortDescription: 'سوئیچ مدیریتی لایه ۲ سازمانی سیسکو با ۲۴ پورت گیگابیت اترنت PoE+ و توان ۳۷۰ وات به همراه ۴ اسلات SFP آپلینک گیگابیت و قابلیت استکینگ FlexStack-Plus.',
      fullDescription: 'دستگاه WS-C2960X-24PS-L یکی از پرفروش‌ترین و قابل اعتمادترین سوئیچ‌های شبکه کمپانی سیسکو از سری پرچمدار Catalyst 2960-X می‌باشد.',
      basePrice: 18200000.00,
      compareAtPrice: 26000000.00,
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      hasOriginalWarranty: true,
      isFreeExpressShipping: true,
      ratingAvg: 4.90,
      ratingCount: 47,
    },
    create: {
      id: 'd0000000-0000-0000-0000-000000000001',
      brandId: cisco.id,
      categoryId: poeCat.id,
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

  // Ensure image for prod1
  await prisma.productImage.deleteMany({ where: { productId: prod1.id } });
  await prisma.productImage.create({
    data: {
      productId: prod1.id,
      url: '/uploads/products/sample-switch-1.webp',
      isPrimary: true,
      sortOrder: 0,
    },
  });

  // Ensure variant & inventory for prod1
  let v1 = await prisma.productVariant.findFirst({ where: { productId: prod1.id } });
  if (!v1) {
    v1 = await prisma.productVariant.create({
      data: {
        productId: prod1.id,
        sku: 'WS-C2960X-24PS-L',
        price: 18200000.00,
        status: VariantStatus.ACTIVE,
        isDefault: true,
      },
    });
  }
  await prisma.productInventory.upsert({
    where: { variantId: v1.id },
    update: { quantity: 44, reservedQuantity: 0 },
    create: {
      variantId: v1.id,
      quantity: 44,
      reservedQuantity: 0,
      safetyStock: 0,
      warehouseCode: 'MAIN',
    },
  });

  // Product 2: Cisco Catalyst 2960-X 24TS
  const prod2 = await prisma.product.upsert({
    where: { slug: 'cisco-catalyst-2960x-24ps-l' },
    update: {
      name: 'سوئیچ ۲۴ پورت سیسکو Catalyst 2960-X',
      shortDescription: 'سوئیچ مدیریتی لایه ۲ حرفه‌ای با ظرفیت سوئیچینگ ۲۱۶ گیگابیت و استک‌پذیری FlexStack',
      fullDescription: 'سوئیچ‌های خانواده Catalyst 2960-X با پایداری حداکثری و مصرف برق بهینه گزینه استاندارد شبکه‌های سازمانی هستند.',
      basePrice: 48500000.00,
      compareAtPrice: 52000000.00,
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      hasOriginalWarranty: true,
      isFreeExpressShipping: true,
      ratingAvg: 4.90,
      ratingCount: 38,
    },
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

  await prisma.productImage.deleteMany({ where: { productId: prod2.id } });
  await prisma.productImage.create({
    data: {
      productId: prod2.id,
      url: '/uploads/products/sample-switch-1.webp',
      isPrimary: true,
      sortOrder: 0,
    },
  });

  let v2 = await prisma.productVariant.findFirst({ where: { productId: prod2.id } });
  if (!v2) {
    v2 = await prisma.productVariant.create({
      data: {
        productId: prod2.id,
        sku: 'WS-C2960X-24TS-L',
        price: 48500000.00,
        status: VariantStatus.ACTIVE,
        isDefault: true,
      },
    });
  }
  await prisma.productInventory.upsert({
    where: { variantId: v2.id },
    update: { quantity: 14, reservedQuantity: 2 },
    create: {
      variantId: v2.id,
      quantity: 14,
      reservedQuantity: 2,
      safetyStock: 0,
      warehouseCode: 'MAIN',
    },
  });

  // Product 3: MikroTik CCR2004-16G-2S+
  const prod3 = await prisma.product.upsert({
    where: { slug: 'mikrotik-ccr2004-16g-2s-plus' },
    update: {
      name: 'روتر بورد میکروتیک CCR2004-16G-2S+',
      shortDescription: 'روتر قدرتمند هسته شبکه با توان پردازشی استثنایی و سیستم‌عامل RouterOS v7',
      fullDescription: 'ایده‌آل برای سرویس‌دهنده‌های اینترنت، شرکت‌های متوسط و بزرگ با حجم ترافیک سنگین و روتینگ BGP.',
      basePrice: 38200000.00,
      compareAtPrice: 41000000.00,
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      hasOriginalWarranty: true,
      isFreeExpressShipping: true,
      ratingAvg: 4.80,
      ratingCount: 24,
    },
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

  await prisma.productImage.deleteMany({ where: { productId: prod3.id } });
  await prisma.productImage.create({
    data: {
      productId: prod3.id,
      url: '/uploads/products/sample-router-1.webp',
      isPrimary: true,
      sortOrder: 0,
    },
  });

  let v3 = await prisma.productVariant.findFirst({ where: { productId: prod3.id } });
  if (!v3) {
    v3 = await prisma.productVariant.create({
      data: {
        productId: prod3.id,
        sku: 'CCR2004-16G-2S+',
        price: 38200000.00,
        status: VariantStatus.ACTIVE,
        isDefault: true,
      },
    });
  }
  await prisma.productInventory.upsert({
    where: { variantId: v3.id },
    update: { quantity: 8, reservedQuantity: 1 },
    create: {
      variantId: v3.id,
      quantity: 8,
      reservedQuantity: 1,
      safetyStock: 0,
      warehouseCode: 'MAIN',
    },
  });

  // 4. Fix Order Items with ????? in title
  const fixedOrders = await prisma.orderItem.updateMany({
    where: {
      title: {
        contains: '??',
      },
    },
    data: {
      title: 'سوئیچ ۲۴ پورت سیسکو مدل WS-C2960X-24PS-L',
      brand: 'Cisco',
      model: 'WS-C2960X-24PS-L',
    },
  });
  console.log(`Updated ${fixedOrders.count} order items that had broken question mark titles.`);

  console.log('--- Database Catalog & Orders Repaired Successfully ---');
}

main()
  .catch((e) => {
    console.error('Repair error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
