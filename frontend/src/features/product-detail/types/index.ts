import { Product, ProductOption } from "@/features/catalog/types";

export type ProductDetailTabId = "specs" | "overview" | "reviews" | "downloads";

export interface ProductDetailTab {
  id: ProductDetailTabId;
  label: string;
  badge?: string | number;
}

export interface SpecCategoryItem {
  label: string;
  value: string;
  important?: boolean;
}

export interface SpecCategory {
  category: string;
  items: SpecCategoryItem[];
}

export interface ReviewItem {
  id: string;
  author: string;
  role?: string;
  company?: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  likes: number;
  recommend: boolean;
}

export interface DownloadItem {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  format: "PDF" | "ZIP" | "BIN";
  description: string;
  downloadUrl: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
