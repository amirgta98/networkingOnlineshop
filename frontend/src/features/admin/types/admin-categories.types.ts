export interface AdminCategory {
  id: string;
  shortName: string;
  longName: string;
  slug: string;
  description?: string;
  icon?: string;
  badge?: string;
  parentId?: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFormData {
  shortName: string;
  longName?: string;
  slug?: string;
  description?: string;
  icon?: string;
  badge?: string;
  parentId?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export const CATEGORY_ICON_PRESETS = [
  { name: "Layers", label: "سوئیچینگ (Layers)" },
  { name: "Server", label: "سرور و روتر (Server)" },
  { name: "Wifi", label: "وایرلس (Wifi)" },
  { name: "Cpu", label: "فیبر و پردازنده (Cpu)" },
  { name: "Boxes", label: "پسیو و کابل (Boxes)" },
  { name: "FolderTree", label: "شاخه دسته‌بندی (FolderTree)" },
  { name: "ShieldCheck", label: "امنیت و فایروال (ShieldCheck)" },
  { name: "Package", label: "متعلقات و پکیج (Package)" },
  { name: "Network", label: "شبکه (Network)" },
  { name: "HardDrive", label: "ذخیره‌ساز (HardDrive)" },
  { name: "Radio", label: "رادیو (Radio)" },
  { name: "Headphones", label: "ویپ و تلفن (Headphones)" },
] as const;
