import { apiClient } from "@/shared/lib/api-client";
import type { AdminCategory, CategoryFormData } from "../types/admin-categories.types";

const LOCAL_STORAGE_KEY = "velox_admin_categories_v1";

export const INITIAL_FRONTEND_CATEGORIES: AdminCategory[] = [
  {
    id: "cat-switches",
    shortName: "سوئیچ‌های شبکه",
    longName: "سوئیچ‌های مدیریتی، غیرمدیریتی و ماژولار سیسکو و میکروتیک",
    slug: "switches",
    description: "تجهیزات سوئیچینگ لایه ۲ و ۳ با پورت‌های گیگابیت، ۱۰G و استانداردهای PoE+",
    icon: "Layers",
    badge: "پرفروش",
    parentId: null,
    sortOrder: 1,
    isActive: true,
    productCount: 4,
    createdAt: new Date("2024-01-01").toISOString(),
    updatedAt: new Date("2024-01-01").toISOString(),
  },
  {
    id: "cat-routers",
    shortName: "روترهای سازمانی",
    longName: "روترهای Core، Edge و ماژولار شبکه برای پروژه‌های صنعتی و دیتاسنتر",
    slug: "routers",
    description: "مسیریاب‌های پرقدرت با توان پردازشی بالا، پشتیبانی از BGP و تانل‌های VPN",
    icon: "Server",
    badge: "سازمانی",
    parentId: null,
    sortOrder: 2,
    isActive: true,
    productCount: 3,
    createdAt: new Date("2024-01-01").toISOString(),
    updatedAt: new Date("2024-01-01").toISOString(),
  },
  {
    id: "cat-wireless",
    shortName: "اکسس‌پوینت و وایرلس",
    longName: "رادیوهای وایرلس، اکسس‌پوینت‌های سقفی و آنتن‌های دوربرد",
    slug: "wireless",
    description: "تجهیزات لینک‌های نقطه به نقطه (PTP) و پوشش وای‌فای نسل Wi-Fi 6",
    icon: "Wifi",
    badge: "Wi-Fi 6",
    parentId: null,
    sortOrder: 3,
    isActive: true,
    productCount: 2,
    createdAt: new Date("2024-01-01").toISOString(),
    updatedAt: new Date("2024-01-01").toISOString(),
  },
  {
    id: "cat-fiber",
    shortName: "تجهیزات فیبر نوری",
    longName: "ماژول‌های SFP/SFP+، پچ‌کورد و پچ‌پنل‌های تخصصی فیبر نوری",
    slug: "fiber",
    description: "ارتباطات پرسرعت نوری سینگل‌مود و مالتی‌مود با کانکتورهای LC و SC",
    icon: "Cpu",
    badge: "10G / 40G",
    parentId: null,
    sortOrder: 4,
    isActive: true,
    productCount: 3,
    createdAt: new Date("2024-01-01").toISOString(),
    updatedAt: new Date("2024-01-01").toISOString(),
  },
  {
    id: "cat-cables",
    shortName: "کابل و پچ‌کورد",
    longName: "کابل‌های شبکه مس Cat6 و Cat6A نگزنس، لگراند و اشنایدر",
    slug: "cables",
    description: "کابل‌های شبکه تست فلوک چنل و پرمننت با روکش ضدحریق LSZH",
    icon: "Boxes",
    badge: "تست فلوک",
    parentId: null,
    sortOrder: 5,
    isActive: true,
    productCount: 2,
    createdAt: new Date("2024-01-01").toISOString(),
    updatedAt: new Date("2024-01-01").toISOString(),
  },
  {
    id: "cat-passive",
    shortName: "پسیو و رک شبکه",
    longName: "رک‌های ایستاده و دیواری، پچ‌پنل، کیستون و نگهدارنده کابل",
    slug: "passive",
    description: "سازه‌های استاندارد ۱۹ اینچ، فن رک و بلانک پنل اتاق سرور",
    icon: "FolderTree",
    badge: "استاندارد ۱۹ اینچ",
    parentId: null,
    sortOrder: 6,
    isActive: true,
    productCount: 2,
    createdAt: new Date("2024-01-01").toISOString(),
    updatedAt: new Date("2024-01-01").toISOString(),
  },
  {
    id: "cat-security",
    shortName: "فایروال و امنیت شبکه",
    longName: "تجهیزات سخت‌افزاری UTM، فایروال فورتی‌نت و سیسکو ASA",
    slug: "security_firewall",
    description: "پایش و فیلترینگ لایه ۷، جلوگیری از نفوذ IPS/IDS و اتصال امن دفاتر مرکزی",
    icon: "ShieldCheck",
    badge: "امنیت داده",
    parentId: null,
    sortOrder: 7,
    isActive: true,
    productCount: 1,
    createdAt: new Date("2024-01-01").toISOString(),
    updatedAt: new Date("2024-01-01").toISOString(),
  },
  {
    id: "cat-accessories",
    shortName: "ماژول و متعلقات",
    longName: "منابع تغذیه ریداندنت، ماژول‌های توسعه، فن و ابزار شبکه",
    slug: "accessories",
    description: "تجهیزات جانبی ارتقای کارایی و نگهداری دیتاسنتر با اصالت اورجینال",
    icon: "Package",
    badge: "اورجینال",
    parentId: null,
    sortOrder: 8,
    isActive: true,
    productCount: 1,
    createdAt: new Date("2024-01-01").toISOString(),
    updatedAt: new Date("2024-01-01").toISOString(),
  },
];

let memoryCategories: AdminCategory[] = [...INITIAL_FRONTEND_CATEGORIES];

function getStoredCategories(): AdminCategory[] {
  if (typeof window === "undefined") return memoryCategories;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return memoryCategories;
}

function saveStoredCategories(categories: AdminCategory[]): void {
  memoryCategories = categories;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(categories));
  } catch {
    // ignore
  }
}

export const categoriesApi = {
  async getCategories(params?: { search?: string; isActive?: boolean }): Promise<AdminCategory[]> {
    try {
      const query = new URLSearchParams();
      if (params?.search) query.append("search", params.search);
      if (params?.isActive !== undefined) query.append("isActive", String(params.isActive));
      const qs = query.toString();
      const endpoint = qs ? `/categories?${qs}` : "/categories";

      const data = await apiClient.get<AdminCategory[]>(endpoint);
      if (Array.isArray(data) && data.length > 0) {
        saveStoredCategories(data);
        return data;
      }
    } catch {
      // Backend not running, use local storage fallback
    }

    let local = getStoredCategories();
    if (params?.isActive !== undefined) {
      local = local.filter((c) => c.isActive === params.isActive);
    }
    if (params?.search) {
      const q = params.search.trim().toLowerCase();
      local = local.filter(
        (c) =>
          c.shortName.toLowerCase().includes(q) ||
          c.longName.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q))
      );
    }
    return local;
  },

  async getCategoryById(idOrSlug: string): Promise<AdminCategory | null> {
    try {
      const data = await apiClient.get<AdminCategory>(`/categories/${idOrSlug}`);
      if (data) return data;
    } catch {
      // fallback
    }

    const local = getStoredCategories();
    return local.find((c) => c.id === idOrSlug || c.slug === idOrSlug) || null;
  },

  async createCategory(formData: CategoryFormData): Promise<AdminCategory> {
    try {
      const created = await apiClient.post<AdminCategory>("/categories", formData);
      if (created) {
        const local = getStoredCategories();
        saveStoredCategories([created, ...local]);
        return created;
      }
    } catch {
      // fallback
    }

    const local = getStoredCategories();
    const slug =
      formData.slug?.trim() ||
      formData.shortName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
        .replace(/^-+|-+$/g, "") ||
      `category-${Date.now()}`;

    if (local.some((c) => c.slug === slug)) {
      throw new Error(`اسلاگ "${slug}" قبلاً استفاده شده است.`);
    }

    const newCategory: AdminCategory = {
      id: `cat-${Date.now()}`,
      shortName: formData.shortName.trim(),
      longName: formData.longName?.trim() || formData.shortName.trim(),
      slug,
      description: formData.description?.trim(),
      icon: formData.icon?.trim() || "FolderTree",
      badge: formData.badge?.trim(),
      parentId: formData.parentId || null,
      sortOrder: typeof formData.sortOrder === "number" ? formData.sortOrder : local.length + 1,
      isActive: formData.isActive ?? true,
      productCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveStoredCategories([newCategory, ...local]);
    return newCategory;
  },

  async updateCategory(id: string, formData: Partial<CategoryFormData>): Promise<AdminCategory> {
    try {
      const updated = await apiClient.put<AdminCategory>(`/categories/${id}`, formData);
      if (updated) {
        const local = getStoredCategories();
        saveStoredCategories(local.map((c) => (c.id === id ? updated : c)));
        return updated;
      }
    } catch {
      // fallback
    }

    const local = getStoredCategories();
    const existing = local.find((c) => c.id === id);
    if (!existing) {
      throw new Error("دسته‌بندی مورد نظر یافت نشد.");
    }

    if (formData.slug && formData.slug !== existing.slug) {
      if (local.some((c) => c.slug === formData.slug && c.id !== id)) {
        throw new Error(`اسلاگ "${formData.slug}" قبلاً استفاده شده است.`);
      }
    }

    const updated: AdminCategory = {
      ...existing,
      shortName: formData.shortName?.trim() ?? existing.shortName,
      longName: formData.longName?.trim() ?? existing.longName,
      slug: formData.slug?.trim() ?? existing.slug,
      description: formData.description?.trim() ?? existing.description,
      icon: formData.icon?.trim() ?? existing.icon,
      badge: formData.badge?.trim() ?? existing.badge,
      parentId: formData.parentId !== undefined ? formData.parentId : existing.parentId,
      sortOrder: typeof formData.sortOrder === "number" ? formData.sortOrder : existing.sortOrder,
      isActive: formData.isActive !== undefined ? formData.isActive : existing.isActive,
      updatedAt: new Date().toISOString(),
    };

    saveStoredCategories(local.map((c) => (c.id === id ? updated : c)));
    return updated;
  },

  async deleteCategory(id: string, force: boolean = false): Promise<boolean> {
    try {
      await apiClient.delete(`/categories/${id}${force ? "?force=true" : ""}`);
      const local = getStoredCategories();
      saveStoredCategories(local.filter((c) => c.id !== id));
      return true;
    } catch {
      // fallback
    }

    const local = getStoredCategories();
    const existing = local.find((c) => c.id === id);
    if (existing && existing.productCount > 0 && !force) {
      throw new Error(`امکان حذف دسته‌بندی "${existing.shortName}" وجود ندارد زیرا ${existing.productCount} محصول به آن متصل است.`);
    }

    saveStoredCategories(local.filter((c) => c.id !== id));
    return true;
  },
};
