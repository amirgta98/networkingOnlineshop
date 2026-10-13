import { Injectable } from '@nestjs/common';
import {
  Product,
  type ProductProps,
} from '../../../domain/entities/product.entity.js';
import type {
  IProductRepository,
  ProductQueryParams,
  PaginatedProductsResult,
} from '../../../domain/repositories/product.repository.interface.js';

export const SEED_IN_MEMORY_PRODUCTS: ProductProps[] = [
  {
    id: "prod-cisco-2960x",
    name: "سوئیچ ۲۴ پورت سیسکو Catalyst 2960-X",
    slug: "cisco-catalyst-2960x-24ps-l",
    sku: "WS-C2960X-24PS-L",
    category: "switches",
    brand: "Cisco",
    price: 48500000,
    originalPrice: 52000000,
    costPrice: 41000000,
    stock: 14,
    minStockAlert: 5,
    reservedStock: 2,
    warehouseLocation: "انبار مرکزی تهران - قفسه A-12",
    status: "active",
    featured: true,
    rating: 4.9,
    reviewCount: 38,
    images: ["/uploads/products/sample-switch-1.webp"],
    warranty: "گارانتی طلایی ۳۶ ماهه تعویض درجا ققنوس",
    badges: ["پرفروش سازمانی", "گارانتی طلایی"],
    specs: ["۲۴ پورت گیگابیت", "۳۷۰ وات PoE+", "۴ اسلات SFP"],
    features: [
      {
        id: "feat-1",
        title: "پورت‌های شبکه",
        description: "۲۴ پورت گیگابیت اترنت ۱۰/۱۰۰/۱۰۰۰ با استاندارد 802.3at",
        iconName: "network",
        sortOrder: 0,
      },
      {
        id: "feat-2",
        title: "توان خروجی PoE",
        description: "توان خروجی مجموع ۳۷۰ وات برای تغذیه انواع دوربین و اکسس‌پوینت",
        iconName: "zap",
        sortOrder: 1,
      },
      {
        id: "feat-3",
        title: "اسلات‌های آپ‌لینک",
        description: "۴ پورت ۱ گیگابیت SFP برای ارتباط با هسته شبکه",
        iconName: "layers",
        sortOrder: 2,
      },
    ],
    shortDescription: "سوئیچ مدیریتی لایه ۲ حرفه‌ای با ظرفیت سوئیچینگ ۲۱۶ گیگابیت و استک‌پذیری FlexStack",
    fullDescription: "سوئیچ‌های خانواده Catalyst 2960-X با پایداری حداکثری و مصرف برق بهینه گزینه استاندارد شبکه‌های سازمانی هستند.",
    relatedProductIds: ["prod-mikrotik-ccr2004"],
    createdAt: new Date("2026-09-01"),
    updatedAt: new Date(),
  },
  {
    id: "prod-mikrotik-ccr2004",
    name: "روتر بورد میکروتیک CCR2004-16G-2S+",
    slug: "mikrotik-ccr2004-16g-2s-plus",
    sku: "CCR2004-16G-2S+",
    category: "routers",
    brand: "MikroTik",
    price: 38200000,
    originalPrice: 41000000,
    costPrice: 32500000,
    stock: 8,
    minStockAlert: 3,
    reservedStock: 1,
    warehouseLocation: "انبار مرکزی - قفسه B-04",
    status: "active",
    featured: true,
    rating: 4.8,
    reviewCount: 24,
    images: ["/uploads/products/sample-router-1.webp"],
    warranty: "گارانتی طلایی ۱۸ ماهه ققنوس آکادمی",
    badges: ["پردازنده ۴ هسته‌ای", "۱۰ گیگابیت"],
    specs: ["۱۶ پورت گیگابیت", "۲ اسلات SFP+ ۱۰G", "پردازنده ۴ هسته‌ای AL32400"],
    features: [
      {
        id: "feat-4",
        title: "پردازنده پرقدرت",
        description: "پردازنده ۶۴ بیتی Annapurna Labs Alpine با فرکانس ۱.۷ گیگاهرتز",
        iconName: "cpu",
        sortOrder: 0,
      },
      {
        id: "feat-5",
        title: "آپ‌لینک فوق‌سریع",
        description: "۲ اسلات ۱۰ گیگابیت SFP+ برای هسته شبکه و سرورها",
        iconName: "gauge",
        sortOrder: 1,
      },
    ],
    shortDescription: "روتر قدرتمند هسته شبکه با توان پردازشی استثنایی و سیستم‌عامل RouterOS v7",
    fullDescription: "ایده‌آل برای سرویس‌دهنده‌های اینترنت، شرکت‌های متوسط و بزرگ با حجم ترافیک سنگین و روتینگ BGP.",
    relatedProductIds: ["prod-cisco-2960x"],
    createdAt: new Date("2026-09-05"),
    updatedAt: new Date(),
  },
];

@Injectable()
export class InMemoryProductRepository implements IProductRepository {
  private products: Map<string, Product> = new Map();

  constructor() {
    this.seedInitialProducts();
  }

  private seedInitialProducts(): void {
    for (const p of SEED_IN_MEMORY_PRODUCTS) {
      this.products.set(p.id, new Product({ ...p }));
    }
  }

  public async save(product: Product): Promise<Product> {
    this.products.set(product.id, product);
    return product;
  }

  public async findById(id: string): Promise<Product | null> {
    const product = this.products.get(id);
    if (product) return new Product(product.toJSON());
    return this.findBySlug(id);
  }

  public async findBySku(sku: string): Promise<Product | null> {
    const lowerSku = sku.trim().toLowerCase();
    for (const product of this.products.values()) {
      if (product.sku.toLowerCase() === lowerSku) {
        return new Product(product.toJSON());
      }
    }
    return null;
  }

  public async findBySlug(slug: string): Promise<Product | null> {
    const lowerSlug = slug.trim().toLowerCase();
    for (const product of this.products.values()) {
      if (product.slug.toLowerCase() === lowerSlug) {
        return new Product(product.toJSON());
      }
    }
    return null;
  }

  public async findAll(params?: ProductQueryParams): Promise<PaginatedProductsResult> {
    let list = Array.from(this.products.values()).map((p) => new Product(p.toJSON()));

    if (params) {
      // 1. Search Query
      if (params.search && params.search.trim() !== '') {
        const q = params.search.trim().toLowerCase();
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.warehouseLocation.toLowerCase().includes(q),
        );
      }

      // 2. Category Filter
      if (params.category && params.category !== 'all') {
        list = list.filter((p) => p.category === params.category);
      }

      // 3. Status Filter
      if (params.status && params.status !== 'all') {
        if (params.status === 'in_stock') {
          list = list.filter((p) => p.stock > p.minStockAlert);
        } else if (params.status === 'low_stock') {
          list = list.filter((p) => p.stock > 0 && p.stock <= p.minStockAlert);
        } else if (params.status === 'out_of_stock') {
          list = list.filter((p) => p.stock === 0 || p.status === 'out_of_stock');
        } else {
          list = list.filter((p) => p.status === params.status);
        }
      }

      // 4. Brand Filter
      if (params.brand && params.brand !== 'all') {
        list = list.filter((p) => p.brand.toLowerCase() === params.brand?.toLowerCase());
      }

      // 5. Sorting
      if (params.sort) {
        const order = params.order === 'asc' ? 1 : -1;
        list.sort((a, b) => {
          const aVal = (a as any)[params.sort!];
          const bVal = (b as any)[params.sort!];
          if (typeof aVal === 'number' && typeof bVal === 'number') {
            return (aVal - bVal) * order;
          }
          if (typeof aVal === 'string' && typeof bVal === 'string') {
            return aVal.localeCompare(bVal, 'fa') * order;
          }
          return 0;
        });
      }
    }

    const total = list.length;
    const page = Math.max(1, params?.page || 1);
    const limit = Math.max(1, params?.limit || 20);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    const start = (page - 1) * limit;
    const paginated = list.slice(start, start + limit);

    return {
      products: paginated,
      total,
      page,
      limit,
      totalPages,
    };
  }

  public async delete(id: string): Promise<boolean> {
    return this.products.delete(id);
  }
}
