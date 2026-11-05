import { Injectable, Logger, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

export type CalculatorFieldType = 'SLIDER' | 'STEPPER' | 'OPTIONS' | 'CHECKBOX';
export type PricingType = 'MANUAL' | 'STORE_PRODUCT';

export interface CalculatorMarker {
  value: number;
  label: string;
}

export interface CalculatorOption {
  id: string;
  label: string;
  description?: string;
  pricingType: PricingType;
  unitPrice: number;
  linkedProductId?: string | null;
  linkedProductName?: string | null;
  linkedProductSku?: string | null;
  linkedProductPrice?: number | null;
  isDefault?: boolean;
}

export interface CalculatorItem {
  id: string;
  title: string;
  description?: string;
  fieldType: CalculatorFieldType;
  serviceCategory: string; // 'cabling' | 'cctv' | 'datacenter' | 'wireless' | 'fiber' | 'general'
  order: number;
  isActive: boolean;

  // Specific to SLIDER / STEPPER
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number | boolean | string;
  unit?: string; // e.g. 'پورت', 'عدد دوربین', 'متر', 'رک', 'دستگاه'
  color?: string; // 'orange' | 'sky' | 'emerald' | 'amber' | 'purple' | 'blue'
  markers?: CalculatorMarker[];

  // Specific to OPTIONS
  options?: CalculatorOption[];
  defaultOptionId?: string;
  calculationMode?: 'ADD_FIXED' | 'ADD_PER_UNIT';

  // Specific to CHECKBOX
  defaultChecked?: boolean;
  badge?: string;

  // Pricing & Store Link
  pricingType: PricingType;
  unitPrice: number; // in Tomans
  linkedProductId?: string | null;
  linkedProductName?: string | null;
  linkedProductSku?: string | null;
  linkedProductPrice?: number | null;

  // Effective price used in calculations
  effectiveUnitPrice?: number;

  // Duration factor (hours of labor per unit for timeline estimation)
  workHoursPerUnit: number;

  createdAt: string;
  updatedAt: string;
}

export interface CalculatorSettings {
  minProjectCost: number;
  spreadMinPercent: number;
  spreadMaxPercent: number;
  roundToNearest: number;
  workUnitsPerDaySmall: number;
  workUnitsPerDayLarge: number;
  minTechnicians: number;
  warrantyMonths: number;
  consultationPhone: string;
}

export interface CalculatorConfigStore {
  items: CalculatorItem[];
  settings: CalculatorSettings;
  version: number;
}

const DEFAULT_SETTINGS: CalculatorSettings = {
  minProjectCost: 2000000,
  spreadMinPercent: 0.92,
  spreadMaxPercent: 1.1,
  roundToNearest: 50000,
  workUnitsPerDaySmall: 50,
  workUnitsPerDayLarge: 80,
  minTechnicians: 2,
  warrantyMonths: 18,
  consultationPhone: '۰۲۱ - ۸۸۸۸ ۸۸۸۸',
};

const DEFAULT_ITEMS: CalculatorItem[] = [
  {
    id: 'nodes',
    title: 'تعداد نودهای شبکه و کیستون RJ45',
    description: 'شامل کابل‌کشی ساختاریافته، پانچ کیستون، بستن فیس‌پلیت و تست اولیه با تستر دستی',
    fieldType: 'SLIDER',
    serviceCategory: 'cabling',
    order: 1,
    isActive: true,
    min: 4,
    max: 200,
    step: 2,
    defaultValue: 24,
    unit: 'پورت',
    color: 'orange',
    markers: [
      { value: 4, label: '۴ نود (دفتر کوچک)' },
      { value: 50, label: '۵۰ نود' },
      { value: 200, label: '۲۰۰ نود (سازمان بزرگ)' },
    ],
    pricingType: 'MANUAL',
    unitPrice: 170000,
    workHoursPerUnit: 1.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cctv',
    title: 'تعداد دوربین‌های مداربسته IP',
    description: 'نصب فیزیکی دوربین، تنظیم زاویه دید، کابل‌کشی و اتصال به سوئیچ شبکه و NVR',
    fieldType: 'SLIDER',
    serviceCategory: 'cctv',
    order: 2,
    isActive: true,
    min: 0,
    max: 48,
    step: 2,
    defaultValue: 8,
    unit: 'عدد دوربین',
    color: 'sky',
    markers: [
      { value: 0, label: 'بدون دوربین' },
      { value: 16, label: '۱۶ عدد' },
      { value: 48, label: '۴۸ عدد (کارخانجات)' },
    ],
    pricingType: 'MANUAL',
    unitPrice: 310000,
    workHoursPerUnit: 1.5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cabling_meters',
    title: 'متراژ تقریبی ترانکینگ و کابل‌کشی',
    description: 'نصب داکت و ترانک دیواری ۵۰×۱۰۵ همراه با قطعات اتصالی و عبور کابل‌ها',
    fieldType: 'SLIDER',
    serviceCategory: 'cabling',
    order: 3,
    isActive: true,
    min: 30,
    max: 1500,
    step: 20,
    defaultValue: 250,
    unit: 'متر',
    color: 'emerald',
    markers: [
      { value: 30, label: '۳۰ متر' },
      { value: 500, label: '۵۰۰ متر' },
      { value: 1500, label: '۱,۵۰۰ متر' },
    ],
    pricingType: 'MANUAL',
    unitPrice: 45000,
    workHoursPerUnit: 0.05,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rack_units',
    title: 'تعداد رک‌های نیازمند آرایش و مونتاژ',
    description: 'شامل پچ‌پنل، نگهدارنده کابل و نظم‌دهی استاندارد',
    fieldType: 'STEPPER',
    serviceCategory: 'datacenter',
    order: 4,
    isActive: true,
    min: 0,
    max: 10,
    step: 1,
    defaultValue: 1,
    unit: 'رک',
    pricingType: 'MANUAL',
    unitPrice: 3500000,
    workHoursPerUnit: 4.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'wifi_access_points',
    title: 'تعداد وای‌فای و اکسس‌پوینت‌های اداری',
    description: 'نصب، تنظیم SSID سازمانی، رومینگ و پیکربندی رادیویی اکسس‌پوینت‌های Wi-Fi 6',
    fieldType: 'STEPPER',
    serviceCategory: 'wireless',
    order: 5,
    isActive: true,
    min: 0,
    max: 20,
    step: 1,
    defaultValue: 0,
    unit: 'دستگاه',
    pricingType: 'MANUAL',
    unitPrice: 420000,
    workHoursPerUnit: 1.2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cable_standard',
    title: 'استاندارد کابل مورد نظر',
    description: 'تعیین کلاس کابل‌کشی و نوع لایه‌های محافظ نویز و سیگنال',
    fieldType: 'OPTIONS',
    serviceCategory: 'cabling',
    order: 6,
    isActive: true,
    defaultOptionId: 'cat6a_sftp',
    calculationMode: 'ADD_PER_UNIT',
    options: [
      {
        id: 'cat6_utp',
        label: 'Cat6 UTP تمام مس',
        description: 'مناسب ادارات تا ۱Gbps',
        pricingType: 'MANUAL',
        unitPrice: 135000,
        isDefault: false,
      },
      {
        id: 'cat6a_sftp',
        label: 'Cat6A SFTP شیلددار',
        description: 'حداکثر سرعت 10Gbps ضد نویز',
        pricingType: 'MANUAL',
        unitPrice: 170000,
        isDefault: true,
      },
      {
        id: 'fiber',
        label: 'فیبر نوری (Fiber)',
        description: 'فواصل طولانی و دیتاسنتر',
        pricingType: 'MANUAL',
        unitPrice: 220000,
        isDefault: false,
      },
    ],
    pricingType: 'MANUAL',
    unitPrice: 0,
    workHoursPerUnit: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fluke_test',
    title: 'تست فلوک ۱۰۰٪ با دستگاه کالیبره Fluke DSX-8000',
    description: 'همراه با خروجی کتابچه سرتیفیکیت و ضمانت رسمی عملکرد',
    fieldType: 'CHECKBOX',
    serviceCategory: 'cabling',
    order: 7,
    isActive: true,
    defaultChecked: true,
    badge: 'تست رسمی فلوک',
    pricingType: 'MANUAL',
    unitPrice: 55000,
    workHoursPerUnit: 0.1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

@Injectable()
export class InstallationCalculatorService implements OnModuleInit {
  private readonly logger = new Logger(InstallationCalculatorService.name);
  private filePath: string = '';
  private configCache: CalculatorConfigStore | null = null;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    this.initFilePath();
    await this.loadConfig();
  }

  private initFilePath() {
    const baseDir = fs.existsSync(path.resolve(process.cwd(), 'backend'))
      ? path.resolve(process.cwd(), 'backend', 'data')
      : path.resolve(process.cwd(), 'data');

    if (!fs.existsSync(baseDir)) {
      try {
        fs.mkdirSync(baseDir, { recursive: true });
      } catch (err: any) {
        this.logger.warn(`Could not create data directory at ${baseDir}: ${err?.message}`);
      }
    }

    this.filePath = path.join(baseDir, 'installation-calculator-config.json');
  }

  private async loadConfig(): Promise<CalculatorConfigStore> {
    if (this.configCache) {
      return this.configCache;
    }

    if (!this.filePath) {
      this.initFilePath();
    }

    try {
      if (fs.existsSync(this.filePath)) {
        const raw = await fs.promises.readFile(this.filePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
          this.configCache = {
            items: parsed.items,
            settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
            version: parsed.version || 1,
          };
          return this.configCache;
        }
      }
    } catch (err: any) {
      this.logger.warn(`Failed reading calculator config file: ${err?.message}. Using defaults.`);
    }

    // Default fallback
    this.configCache = {
      items: JSON.parse(JSON.stringify(DEFAULT_ITEMS)),
      settings: { ...DEFAULT_SETTINGS },
      version: 1,
    };
    await this.persistConfig(this.configCache);
    return this.configCache;
  }

  private async persistConfig(config: CalculatorConfigStore): Promise<void> {
    this.configCache = config;
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      await fs.promises.writeFile(this.filePath, JSON.stringify(config, null, 2), 'utf8');
    } catch (err: any) {
      this.logger.error(`Failed writing calculator config: ${err?.message}`);
    }
  }

  /**
   * Resolves store product info and real prices for linked items
   */
  private async enrichItemsWithProducts(items: CalculatorItem[]): Promise<CalculatorItem[]> {
    const productIdsToFetch = new Set<string>();

    for (const item of items) {
      if (item.pricingType === 'STORE_PRODUCT' && item.linkedProductId) {
        productIdsToFetch.add(item.linkedProductId);
      }
      if (item.options && Array.isArray(item.options)) {
        for (const opt of item.options) {
          if (opt.pricingType === 'STORE_PRODUCT' && opt.linkedProductId) {
            productIdsToFetch.add(opt.linkedProductId);
          }
        }
      }
    }

    const productMap = new Map<string, { id: string; name: string; sku: string | null; basePrice: number }>();

    if (productIdsToFetch.size > 0) {
      try {
        const products = await this.prisma.product.findMany({
          where: {
            id: { in: Array.from(productIdsToFetch) },
          },
          select: {
            id: true,
            name: true,
            sku: true,
            basePrice: true,
          },
        });

        for (const p of products) {
          productMap.set(p.id, {
            id: p.id,
            name: p.name,
            sku: p.sku,
            basePrice: Number(p.basePrice),
          });
        }
      } catch (err: any) {
        this.logger.warn(`Could not enrich items with store products from DB: ${err?.message}`);
      }
    }

    return items.map((item) => {
      const copy: CalculatorItem = { ...item };

      if (copy.pricingType === 'STORE_PRODUCT' && copy.linkedProductId) {
        const prod = productMap.get(copy.linkedProductId);
        if (prod) {
          copy.linkedProductName = prod.name;
          copy.linkedProductSku = prod.sku;
          copy.linkedProductPrice = prod.basePrice;
          copy.effectiveUnitPrice = prod.basePrice;
        } else {
          copy.effectiveUnitPrice = copy.unitPrice;
        }
      } else {
        copy.effectiveUnitPrice = copy.unitPrice;
      }

      if (copy.options && Array.isArray(copy.options)) {
        copy.options = copy.options.map((opt) => {
          const optCopy = { ...opt };
          if (optCopy.pricingType === 'STORE_PRODUCT' && optCopy.linkedProductId) {
            const prod = productMap.get(optCopy.linkedProductId);
            if (prod) {
              optCopy.linkedProductName = prod.name;
              optCopy.linkedProductSku = prod.sku;
              optCopy.linkedProductPrice = prod.basePrice;
              optCopy.unitPrice = prod.basePrice;
            }
          }
          return optCopy;
        });
      }

      return copy;
    });
  }

  /**
   * Public: Get active calculator items and settings for the user-facing page
   */
  async getPublicConfig(): Promise<{ items: CalculatorItem[]; settings: CalculatorSettings }> {
    const config = await this.loadConfig();
    const activeItems = config.items
      .filter((i) => i.isActive)
      .sort((a, b) => a.order - b.order);

    const enriched = await this.enrichItemsWithProducts(activeItems);

    return {
      items: enriched,
      settings: config.settings,
    };
  }

  /**
   * Admin: Get all calculator items and settings
   */
  async getAdminConfig(): Promise<{ items: CalculatorItem[]; settings: CalculatorSettings }> {
    const config = await this.loadConfig();
    const sorted = [...config.items].sort((a, b) => a.order - b.order);
    const enriched = await this.enrichItemsWithProducts(sorted);

    return {
      items: enriched,
      settings: config.settings,
    };
  }

  /**
   * Admin: Update global settings
   */
  async updateSettings(dto: Partial<CalculatorSettings>): Promise<CalculatorSettings> {
    const config = await this.loadConfig();
    config.settings = {
      ...config.settings,
      ...dto,
    };
    await this.persistConfig(config);
    return config.settings;
  }

  /**
   * Admin: Create a new calculator item
   */
  async createItem(dto: Partial<CalculatorItem>): Promise<CalculatorItem> {
    if (!dto.title?.trim()) {
      throw new BadRequestException('عنوان نیازمندی الزامی است.');
    }
    if (!dto.fieldType) {
      throw new BadRequestException('نوع فیلد و شمارنده الزامی است.');
    }

    const config = await this.loadConfig();

    const newId = dto.id?.trim() || `calc-item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const existing = config.items.find((i) => i.id === newId);
    if (existing) {
      throw new BadRequestException(`شناسه‌ای با عنوان ${newId} از قبل وجود دارد.`);
    }

    const maxOrder = config.items.reduce((max, i) => Math.max(max, i.order || 0), 0);

    const newItem: CalculatorItem = {
      id: newId,
      title: dto.title.trim(),
      description: dto.description?.trim() || '',
      fieldType: dto.fieldType,
      serviceCategory: dto.serviceCategory || 'general',
      order: dto.order ?? maxOrder + 1,
      isActive: dto.isActive ?? true,

      min: dto.min ?? (dto.fieldType === 'SLIDER' || dto.fieldType === 'STEPPER' ? 0 : undefined),
      max: dto.max ?? (dto.fieldType === 'SLIDER' ? 100 : dto.fieldType === 'STEPPER' ? 20 : undefined),
      step: dto.step ?? 1,
      defaultValue: dto.defaultValue ?? (dto.fieldType === 'CHECKBOX' ? false : 0),
      unit: dto.unit || (dto.fieldType === 'CHECKBOX' ? '' : 'عدد'),
      color: dto.color || 'orange',
      markers: dto.markers || [],

      options: dto.options || [],
      defaultOptionId: dto.defaultOptionId || (dto.options?.[0]?.id || ''),
      calculationMode: dto.calculationMode || 'ADD_FIXED',

      defaultChecked: dto.defaultChecked ?? false,
      badge: dto.badge || '',

      pricingType: dto.pricingType || 'MANUAL',
      unitPrice: Number(dto.unitPrice || 0),
      linkedProductId: dto.linkedProductId || null,

      workHoursPerUnit: Number(dto.workHoursPerUnit || 0),

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    config.items.push(newItem);
    await this.persistConfig(config);

    const enriched = await this.enrichItemsWithProducts([newItem]);
    return enriched[0];
  }

  /**
   * Admin: Update an existing calculator item
   */
  async updateItem(id: string, dto: Partial<CalculatorItem>): Promise<CalculatorItem> {
    const config = await this.loadConfig();
    const index = config.items.findIndex((i) => i.id === id);
    if (index === -1) {
      throw new NotFoundException(`آیتمی با شناسه ${id} یافت نشد.`);
    }

    const current = config.items[index];
    const updated: CalculatorItem = {
      ...current,
      ...dto,
      id: current.id, // Immutable ID
      title: dto.title !== undefined ? dto.title.trim() : current.title,
      description: dto.description !== undefined ? dto.description.trim() : current.description,
      unitPrice: dto.unitPrice !== undefined ? Number(dto.unitPrice) : current.unitPrice,
      workHoursPerUnit: dto.workHoursPerUnit !== undefined ? Number(dto.workHoursPerUnit) : current.workHoursPerUnit,
      updatedAt: new Date().toISOString(),
    };

    config.items[index] = updated;
    await this.persistConfig(config);

    const enriched = await this.enrichItemsWithProducts([updated]);
    return enriched[0];
  }

  /**
   * Admin: Delete an item
   */
  async deleteItem(id: string): Promise<{ success: boolean; message: string }> {
    const config = await this.loadConfig();
    const prevCount = config.items.length;
    config.items = config.items.filter((i) => i.id !== id);

    if (config.items.length === prevCount) {
      throw new NotFoundException(`آیتمی با شناسه ${id} یافت نشد.`);
    }

    await this.persistConfig(config);
    return { success: true, message: 'آیتم با موفقیت حذف گردید.' };
  }

  /**
   * Admin: Reorder items
   */
  async reorderItems(orderedIds: string[]): Promise<CalculatorItem[]> {
    if (!Array.isArray(orderedIds)) {
      throw new BadRequestException('لیست مرتب‌سازی باید آرایه‌ای از شناسه‌ها باشد.');
    }

    const config = await this.loadConfig();
    const itemMap = new Map(config.items.map((i) => [i.id, i]));

    const newItems: CalculatorItem[] = [];
    orderedIds.forEach((id, index) => {
      const item = itemMap.get(id);
      if (item) {
        item.order = index + 1;
        newItems.push(item);
        itemMap.delete(id);
      }
    });

    // Append any items that were not in the array
    let remainingOrder = newItems.length + 1;
    itemMap.forEach((item) => {
      item.order = remainingOrder++;
      newItems.push(item);
    });

    config.items = newItems;
    await this.persistConfig(config);

    return this.enrichItemsWithProducts(newItems);
  }

  /**
   * Admin: Reset to default items
   */
  async resetToDefaults(): Promise<{ items: CalculatorItem[]; settings: CalculatorSettings }> {
    const config: CalculatorConfigStore = {
      items: JSON.parse(JSON.stringify(DEFAULT_ITEMS)),
      settings: { ...DEFAULT_SETTINGS },
      version: 1,
    };
    await this.persistConfig(config);
    const enriched = await this.enrichItemsWithProducts(config.items);
    return { items: enriched, settings: config.settings };
  }

  /**
   * Admin: Search store products for linking
   */
  async searchStoreProducts(search?: string) {
    try {
      const where: any = {
        archivedAt: null,
      };

      if (search && search.trim()) {
        const clean = search.trim();
        where.OR = [
          { name: { contains: clean, mode: 'insensitive' } },
          { sku: { contains: clean, mode: 'insensitive' } },
          { partNumber: { contains: clean, mode: 'insensitive' } },
        ];
      }

      const products = await this.prisma.product.findMany({
        where,
        take: 20,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          name: true,
          sku: true,
          partNumber: true,
          basePrice: true,
          status: true,
          category: {
            select: {
              shortName: true,
              longName: true,
            },
          },
          images: {
            take: 1,
            select: {
              url: true,
            },
          },
        },
      });

      return products.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku || p.partNumber || null,
        basePrice: Number(p.basePrice),
        categoryName: p.category?.shortName || p.category?.longName || 'دسته‌بندی نشده',
        imageUrl: p.images?.[0]?.url || null,
        status: p.status,
      }));
    } catch (err: any) {
      this.logger.warn(`Failed searching store products: ${err?.message}`);
      return [];
    }
  }
}
