import { apiClient } from "@/shared/lib/api-client";
import { resolveProductImageUrl } from "@/shared/lib/utils";
import { Product, ProductFilterParams } from "../types";

export const LOCAL_STORAGE_PRODUCTS_KEY = "velox_admin_products_v1";

/**
 * Normalizes any raw product from API, LocalStorage, or Mock Data into a consistent Product contract.
 * Specifically computes `inStock` accurately based on numeric stock and active status.
 */
export function normalizeProduct(raw: any): Product {
  const stock = typeof raw.stock === "number" ? raw.stock : (raw.inStock === false ? 0 : 10);
  const status = raw.status || (stock > 0 ? "active" : "out_of_stock");

  // Accurate stock determination:
  // If explicitly provided boolean, respect it; otherwise calculate from quantity & status
  const inStock =
    raw.inStock !== undefined
      ? Boolean(raw.inStock)
      : stock > 0 && status !== "out_of_stock" && status !== "discontinued";

  const price = Number(raw.price) || 0;
  const originalPrice =
    raw.originalPrice && Number(raw.originalPrice) > price ? Number(raw.originalPrice) : undefined;

  const discountPercent =
    raw.discountPercent !== undefined && raw.discountPercent !== null
      ? Number(raw.discountPercent)
      : originalPrice
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : undefined;

  const isSpecialOffer = Boolean(
    raw.isSpecialOffer || (raw.featured && discountPercent && discountPercent > 0)
  );

  return {
    ...raw,
    id: String(raw.id),
    name: raw.name || "تجهیزات شبکه",
    slug: raw.slug || (raw.sku ? raw.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-") : `prod-${raw.id}`),
    price,
    originalPrice,
    discountPercent,
    stock,
    status,
    inStock,
    featured: Boolean(raw.featured),
    isSpecialOffer,
    images:
      Array.isArray(raw.images) && raw.images.length > 0
        ? raw.images.map((img: string) => resolveProductImageUrl(img))
        : ["https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80"],
    badges: Array.isArray(raw.badges) ? raw.badges : [],
    specs: Array.isArray(raw.specs) ? raw.specs : [],
    rating: typeof raw.rating === "number" ? raw.rating : 5,
    reviewCount: typeof raw.reviewCount === "number" ? raw.reviewCount : 0,
    description: raw.description || raw.shortDescription || "",
    category: raw.category || "switches",
    relatedProductIds: Array.isArray(raw.relatedProductIds) ? raw.relatedProductIds : [],
    relatedProducts: Array.isArray(raw.relatedProducts) ? raw.relatedProducts.map(normalizeProduct) : undefined,
  };
}

export async function getProducts(params: ProductFilterParams = {}): Promise<Product[]> {
  let sourceProducts: Product[] = [];

  try {
    // Pure backend API call directly to NestJS & PostgreSQL
    const response = await apiClient.get<any>("/products", {
      params: params as Record<string, string | number | boolean>,
    });
    let rawList: any[] = [];
    if (Array.isArray(response)) {
      rawList = response;
    } else if (response && Array.isArray(response.products)) {
      rawList = response.products;
    }

    sourceProducts = rawList.map(normalizeProduct);
  } catch (error) {
    console.warn("[Catalog API] Backend endpoint unreachable:", error);
  }

  // Filtering implementation
  let filtered = [...sourceProducts];

  // Category filter
  if (params.category && params.category !== "all") {
    filtered = filtered.filter((p) => p.category === params.category);
  }

  // Brand filter
  if (params.brands && params.brands.length > 0) {
    const selectedBrands = params.brands.map((b) => b.toLowerCase());
    filtered = filtered.filter((p) => p.brand && selectedBrands.includes(p.brand.toLowerCase()));
  }

  // Search filter
  if (params.search && params.search.trim() !== "") {
    const term = params.search.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        (p.brand && p.brand.toLowerCase().includes(term)) ||
        (p.specs && p.specs.some((s) => s.toLowerCase().includes(term)))
    );
  }

  // In-stock only filter
  if (params.inStockOnly) {
    filtered = filtered.filter((p) => p.inStock);
  }

  // On-sale / Discount only filter
  if (params.onSaleOnly) {
    filtered = filtered.filter(
      (p) =>
        Boolean(p.isSpecialOffer) ||
        (p.discountPercent && p.discountPercent > 0) ||
        (p.originalPrice && p.originalPrice > p.price)
    );
  }

  // Price range filters
  if (params.minPrice !== undefined && params.minPrice > 0) {
    filtered = filtered.filter((p) => p.price >= (params.minPrice ?? 0));
  }
  if (params.maxPrice !== undefined && params.maxPrice > 0) {
    filtered = filtered.filter((p) => p.price <= (params.maxPrice ?? Infinity));
  }

  // Sorting
  if (params.sort) {
    switch (params.sort) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "bestselling":
        filtered.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case "newest":
        break;
      case "featured":
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }
  }

  return filtered;
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const res = await apiClient.get<Product>(`/products/${id}`);
    if (res) return normalizeProduct(res);
  } catch (error) {
    console.warn(`[Catalog API] Could not fetch product ${id}:`, error);
  }

  return null;
}

export async function getProductBySlugOrId(slugOrId: string): Promise<Product | null> {
  try {
    let clean = slugOrId;
    for (let i = 0; i < 3; i++) {
      try {
        const next = decodeURIComponent(clean);
        if (next === clean) break;
        clean = next;
      } catch {
        break;
      }
    }
    const res = await apiClient.get<Product>(`/products/${encodeURIComponent(clean)}`);
    if (res) return normalizeProduct(res);
  } catch (error) {
    console.warn(`[Catalog API] Could not fetch product by slug/id ${slugOrId}:`, error);
  }

  return null;
}

