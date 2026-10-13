import { Injectable, Optional, Inject } from '@nestjs/common';
import { Category, type CategoryProps } from '../../../domain/entities/category.entity.js';
import type {
  ICategoryRepository,
  CategoryQueryOptions,
} from '../../../domain/repositories/category.repository.interface.js';
import { PRODUCT_REPOSITORY_TOKEN } from '../../../shared/constants/tokens.js';
import type { IProductRepository } from '../../../domain/repositories/product.repository.interface.js';

export const INITIAL_CATEGORIES: CategoryProps[] = [
  {
    id: 'cat-switches',
    shortName: 'سوئیچ‌های شبکه',
    longName: 'سوئیچ‌های مدیریتی، غیرمدیریتی و ماژولار سیسکو و میکروتیک',
    slug: 'switches',
    description: 'تجهیزات سوئیچینگ لایه ۲ و ۳ با پورت‌های گیگابیت، ۱۰G و پشتیبانی از استانداردهای PoE و PoE+',
    icon: 'Layers',
    badge: 'پرفروش',
    parentId: null,
    sortOrder: 1,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'cat-routers',
    shortName: 'روترهای سازمانی',
    longName: 'روترهای Core، Edge و ماژولار شبکه برای پروژه‌های صنعتی و دیتاسنتر',
    slug: 'routers',
    description: 'مسیریاب‌های پرقدرت با توان پردازشی بالا، پشتیبانی از BGP، OSPF و تانل‌های رمزنگاری اختصاصی VPN',
    icon: 'Server',
    badge: 'سازمانی',
    parentId: null,
    sortOrder: 2,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'cat-wireless',
    shortName: 'اکسس‌پوینت و وایرلس',
    longName: 'رادیوهای وایرلس، اکسس‌پوینت‌های سقفی و آنتن‌های دوربرد',
    slug: 'wireless',
    description: 'تجهیزات لینک‌های نقطه به نقطه (PTP)، ارتباطات رادیویی و پوشش فراگیر وای‌فای سازمانی نسل Wi-Fi 6',
    icon: 'Wifi',
    badge: 'Wi-Fi 6',
    parentId: null,
    sortOrder: 3,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'cat-fiber',
    shortName: 'تجهیزات فیبر نوری',
    longName: 'ماژول‌های SFP/SFP+، پچ‌کورد و پچ‌پنل‌های تخصصی فیبر نوری',
    slug: 'fiber',
    description: 'ارتباطات پرسرعت نوری سینگل‌مود و مالتی‌مود با کانکتورهای LC, SC و مبدل‌های مدیاکانورتور استاندارد',
    icon: 'Cpu',
    badge: '10G / 40G',
    parentId: null,
    sortOrder: 4,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'cat-cables',
    shortName: 'کابل و پچ‌کورد',
    longName: 'کابل‌های شبکه مس Cat6 و Cat6A نگزنس، لگراند و اشنایدر',
    slug: 'cables',
    description: 'کابل‌های شبکه تست فلوک چنل و پرمننت، روکش LSZH و ضدحریق برای دیتاسنتر و بستر شبکه داخلی',
    icon: 'Boxes',
    badge: 'تست فلوک',
    parentId: null,
    sortOrder: 5,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'cat-passive',
    shortName: 'پسیو و رک شبکه',
    longName: 'رک‌های ایستاده و دیواری، پچ‌پنل، کیستون و نگهدارنده کابل',
    slug: 'passive',
    description: 'سازه‌های استاندارد ۱۹ اینچ، فن رک، بلانک پنل و تجهیزات ساماندهی فیزیکی اتاق سرور',
    icon: 'FolderTree',
    badge: 'استاندارد ۱۹ اینچ',
    parentId: null,
    sortOrder: 6,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'cat-security',
    shortName: 'فایروال و امنیت شبکه',
    longName: 'تجهیزات سخت‌افزاری UTM، فایروال فورتی‌نت و سیسکو ASA',
    slug: 'security_firewall',
    description: 'پایش و فیلترینگ لایه ۷، جلوگیری از حملات نفوذ IPS/IDS و اتصال امن دفاتر مرکزی به شعب',
    icon: 'ShieldCheck',
    badge: 'امنیت داده',
    parentId: null,
    sortOrder: 7,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'cat-accessories',
    shortName: 'ماژول و متعلقات',
    longName: 'منابع تغذیه ریداندنت، ماژول‌های توسعه، فن و ابزار شبکه',
    slug: 'accessories',
    description: 'تجهیزات جانبی ارتقای کارایی و نگهداری دیتاسنتر با اصالت اورجینال قطعات سخت‌افزاری',
    icon: 'Package',
    badge: 'اورجینال',
    parentId: null,
    sortOrder: 8,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

@Injectable()
export class InMemoryCategoryRepository implements ICategoryRepository {
  private categories: Map<string, Category> = new Map();

  constructor(
    @Optional()
    @Inject(PRODUCT_REPOSITORY_TOKEN)
    private readonly productRepository?: IProductRepository,
  ) {
    this.seed();
  }

  private seed(): void {
    for (const item of INITIAL_CATEGORIES) {
      this.categories.set(item.id, new Category({ ...item }));
    }
  }

  async create(category: Category): Promise<Category> {
    this.categories.set(category.id, category);
    return category;
  }

  async findById(id: string): Promise<Category | null> {
    const found = this.categories.get(id);
    if (!found) return null;
    const count = await this.getProductCount(found.slug);
    found.setProductCount(count);
    return found;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    for (const cat of this.categories.values()) {
      if (cat.slug === slug) {
        const count = await this.getProductCount(cat.slug);
        cat.setProductCount(count);
        return cat;
      }
    }
    return null;
  }

  async findAll(options?: CategoryQueryOptions): Promise<Category[]> {
    let result = Array.from(this.categories.values());

    if (options?.isActive !== undefined) {
      result = result.filter((c) => c.isActive === options.isActive);
    }

    if (options?.parentId !== undefined) {
      result = result.filter((c) => c.parentId === options.parentId);
    }

    if (options?.search) {
      const q = options.search.trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.shortName.toLowerCase().includes(q) ||
          c.longName.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q)),
      );
    }

    // Sort by sortOrder asc
    result.sort((a, b) => a.sortOrder - b.sortOrder);

    // Populate dynamic productCount
    for (const cat of result) {
      const count = await this.getProductCount(cat.slug);
      cat.setProductCount(count);
    }

    return result;
  }

  async update(category: Category): Promise<Category> {
    this.categories.set(category.id, category);
    return category;
  }

  async delete(id: string): Promise<boolean> {
    return this.categories.delete(id);
  }

  async count(): Promise<number> {
    return this.categories.size;
  }

  async getProductCount(categoryIdOrSlug: string): Promise<number> {
    if (!this.productRepository) {
      return 0;
    }
    try {
      const res = await this.productRepository.findAll({
        category: categoryIdOrSlug,
        limit: 1000,
      });
      return res.total;
    } catch {
      return 0;
    }
  }
}
