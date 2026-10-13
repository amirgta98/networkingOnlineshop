export type AdminProductCategory =
  | "switches"
  | "routers"
  | "wireless"
  | "fiber"
  | "cables"
  | "passive"
  | "security_firewall"
  | "accessories"
  | (string & {});

export type AdminProductStatus = "active" | "inactive" | "out_of_stock" | "discontinued";

export interface AdminTieredPrice {
  minQuantity: number;
  discountPercent: number;
  label: string;
}

export interface AdminSpecGroup {
  category: string;
  items: { label: string; value: string }[];
}

export interface AdminInventoryLog {
  id: string;
  date: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  reason: string;
  operator: string;
}

export interface AdminProductFeature {
  id: string;
  title: string;
  description: string;
  iconUrl?: string;
  iconName?: string;
  sortOrder?: number;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: AdminProductCategory;
  brand: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  costPrice: number;
  stock: number;
  minStockAlert: number;
  reservedStock: number;
  warehouseLocation: string;
  status: AdminProductStatus;
  featured: boolean;
  isSpecialOffer?: boolean;
  inStock?: boolean;
  rating: number;
  reviewCount: number;
  images: string[];
  warranty: string;
  badges: string[];
  specs: string[];
  specGroups?: AdminSpecGroup[];
  features?: AdminProductFeature[];
  relatedProductIds?: string[];
  relatedProducts?: AdminProduct[];
  tieredPricing?: AdminTieredPrice[];
  shortDescription: string;
  fullDescription?: string;
  inventoryLogs?: AdminInventoryLog[];
  createdAt: string;
  updatedAt: string;
}

export const PRODUCT_CATEGORY_LABELS: Record<AdminProductCategory, string> = {
  switches: "سوئیچ‌های شبکه",
  routers: "روترهای سازمانی",
  wireless: "اکسس‌پوینت و وایرلس",
  fiber: "تجهیزات فیبر نوری",
  cables: "کابل و پچ‌کورد",
  passive: "پسیو و رک شبکه",
  security_firewall: "فایروال و امنیت شبکه",
  accessories: "ماژول و متعلقات",
};

export const PRODUCT_STATUS_CONFIG: Record<
  AdminProductStatus,
  { label: string; badgeClasses: string; dotColor: string }
> = {
  active: {
    label: "فعال در فروشگاه",
    badgeClasses: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dotColor: "bg-emerald-500",
  },
  inactive: {
    label: "پیش‌نویس / غیرفعال",
    badgeClasses: "bg-neutral-800 text-neutral-300 border-neutral-700",
    dotColor: "bg-neutral-400",
  },
  out_of_stock: {
    label: "اتمام موجودی",
    badgeClasses: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    dotColor: "bg-rose-500",
  },
  discontinued: {
    label: "توقف تولید",
    badgeClasses: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    dotColor: "bg-purple-500",
  },
};

export const POPULAR_BRANDS = [
  "Cisco",
  "MikroTik",
  "Ubiquiti",
  "Nexans",
  "Schneider",
  "HPE",
  "Fortinet",
  "Legrand",
] as const;
