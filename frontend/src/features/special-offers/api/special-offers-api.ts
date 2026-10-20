import { apiClient } from "@/shared/lib/api-client";
import { resolveProductImageUrl } from "@/shared/lib/utils";
import type {
  ActiveSpecialOfferResponse,
  SpecialOfferCampaign,
  SpecialOfferProduct,
  CreateSpecialOfferInput,
  UpdateSpecialOfferInput,
} from "../types";

function normalizeSpecialOfferProduct(raw: any, saleEndsAt?: string): SpecialOfferProduct {
  const price = Number(raw.price) || 0;
  const originalPrice = Number(raw.originalPrice) || price;
  const discountPercent =
    typeof raw.discountPercent === "number"
      ? raw.discountPercent
      : originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  const stockRemaining = typeof raw.stockRemaining === "number" ? raw.stockRemaining : 10;
  const stockTotal = typeof raw.stockTotal === "number" ? raw.stockTotal : Math.max(stockRemaining + 5, 15);
  const inStock = raw.inStock !== undefined ? Boolean(raw.inStock) : stockRemaining > 0;

  return {
    id: String(raw.id),
    name: raw.name || "کالای فروش ویژه",
    slug: raw.slug || `offer-${raw.id}`,
    sku: raw.sku || undefined,
    price,
    originalPrice,
    discountPercent,
    stockRemaining,
    stockTotal,
    stock: stockRemaining,
    inStock,
    images:
      Array.isArray(raw.images) && raw.images.length > 0
        ? raw.images.map((img: string) => resolveProductImageUrl(img))
        : ["/uploads/products/sample-router-1.webp"],
    brand: raw.brand || undefined,
    category: raw.category || undefined,
    description: raw.description || raw.shortDescription || "",
    specs: Array.isArray(raw.specs) ? raw.specs : [],
    badges: ["فروش ویژه", `${discountPercent}٪ تخفیف`],
    rating: 5,
    reviewCount: 12,
    status: inStock ? "active" : "out_of_stock",
    featured: true,
    isSpecialOffer: true,
    saleEndsAt: saleEndsAt || raw.saleEndsAt,
  };
}

export async function getActiveSpecialOffer(): Promise<ActiveSpecialOfferResponse> {
  try {
    const res = await apiClient.get<ActiveSpecialOfferResponse>("/special-offers/active");
    if (!res || !res.campaign) {
      return { campaign: null, products: [] };
    }

    const campaign = res.campaign;
    const rawProducts = campaign.products || res.products || [];
    const products = rawProducts
      .map((p) => normalizeSpecialOfferProduct(p, campaign.endDate))
      .filter((p) => {
        const remaining = typeof p.stockRemaining === "number" ? p.stockRemaining : (p.stock ?? 0);
        const inStock = p.inStock !== false && p.status !== "out_of_stock";
        return remaining > 0 && inStock;
      });

    if (products.length === 0) {
      return { campaign: null, products: [] };
    }

    return {
      campaign: {
        ...campaign,
        products,
      },
      products,
      title: res.title || campaign.title,
      subtitle: res.subtitle || campaign.tagline || campaign.description || "",
      targetDate: res.targetDate || campaign.endDate,
    };
  } catch (err) {
    console.warn("[SpecialOffers API] Error fetching active special offer:", err);
    return { campaign: null, products: [] };
  }
}

export async function getAdminSpecialOffers(params?: {
  status?: string;
  search?: string;
}): Promise<SpecialOfferCampaign[]> {
  try {
    const res = await apiClient.get<SpecialOfferCampaign[]>("/special-offers", {
      params: params as Record<string, string | number | boolean>,
    });
    if (!Array.isArray(res)) return [];
    return res.map((campaign) => ({
      ...campaign,
      products: (campaign.products || []).map((p) => normalizeSpecialOfferProduct(p, campaign.endDate)),
    }));
  } catch (err) {
    console.error("[SpecialOffers API] Error fetching admin campaigns:", err);
    return [];
  }
}

export async function getSpecialOfferById(id: string): Promise<SpecialOfferCampaign | null> {
  try {
    const campaign = await apiClient.get<SpecialOfferCampaign>(`/special-offers/${id}`);
    if (!campaign) return null;
    return {
      ...campaign,
      products: (campaign.products || []).map((p) => normalizeSpecialOfferProduct(p, campaign.endDate)),
    };
  } catch (err) {
    console.error(`[SpecialOffers API] Error fetching campaign ${id}:`, err);
    return null;
  }
}

export async function createSpecialOffer(
  data: CreateSpecialOfferInput
): Promise<SpecialOfferCampaign> {
  const created = await apiClient.post<SpecialOfferCampaign>("/special-offers", data);
  return {
    ...created,
    products: (created.products || []).map((p) => normalizeSpecialOfferProduct(p, created.endDate)),
  };
}

export async function updateSpecialOffer(
  id: string,
  data: UpdateSpecialOfferInput
): Promise<SpecialOfferCampaign> {
  const updated = await apiClient.put<SpecialOfferCampaign>(`/special-offers/${id}`, data);
  return {
    ...updated,
    products: (updated.products || []).map((p) => normalizeSpecialOfferProduct(p, updated.endDate)),
  };
}

export async function updateSpecialOfferStatus(
  id: string,
  status: "ACTIVE" | "INACTIVE",
  isPublished?: boolean
): Promise<SpecialOfferCampaign> {
  const updated = await apiClient.patch<SpecialOfferCampaign>(`/special-offers/${id}/status`, {
    status,
    isPublished,
  });
  return {
    ...updated,
    products: (updated.products || []).map((p) => normalizeSpecialOfferProduct(p, updated.endDate)),
  };
}

export async function deleteSpecialOffer(id: string): Promise<{ success: boolean; message: string }> {
  return await apiClient.delete<{ success: boolean; message: string }>(`/special-offers/${id}`);
}

export async function getDiscountedProducts(): Promise<import("../types").DiscountedCatalogProduct[]> {
  try {
    const res = await apiClient.get<import("../types").DiscountedCatalogProduct[]>("/special-offers/discounted-products");
    if (Array.isArray(res) && res.length > 0) {
      return res;
    }
  } catch (err) {
    console.warn("[SpecialOffers API] Endpoint /special-offers/discounted-products returned error, falling back to /products:", err);
  }

  // Robust Fallback: query /products and extract all products with catalog discounts
  try {
    const productsRes: any = await apiClient.get("/products");
    const rawList: any[] = Array.isArray(productsRes?.products)
      ? productsRes.products
      : Array.isArray(productsRes)
      ? productsRes
      : [];

    return rawList
      .map((p) => {
        const basePrice = Number(p.basePrice ?? p.price ?? 0);
        let compareAtPrice = Number(p.compareAtPrice ?? p.originalPrice ?? 0);
        let discountPercent = Number(p.discountPercent ?? 0);

        if (compareAtPrice > basePrice) {
          discountPercent = Math.max(1, Math.round(((compareAtPrice - basePrice) / compareAtPrice) * 100));
        } else if (discountPercent > 0 && compareAtPrice <= basePrice) {
          compareAtPrice = Math.round(basePrice / (1 - discountPercent / 100));
        }

        return {
          id: String(p.id),
          name: p.name || "",
          slug: p.slug || "",
          sku: p.sku || undefined,
          basePrice,
          compareAtPrice: Math.max(compareAtPrice, basePrice),
          discountPercent: Math.max(0, discountPercent),
          stock: Number(p.stock ?? 10),
          images: Array.isArray(p.images) ? p.images : [],
          brand: p.brand || undefined,
          category: typeof p.category === "string" ? p.category : p.category?.name || undefined,
        };
      })
      .filter((p) => (p.compareAtPrice > p.basePrice && p.discountPercent > 0) || p.discountPercent > 0);
  } catch (fallbackErr) {
    console.error("[SpecialOffers API] Error in fallback getDiscountedProducts:", fallbackErr);
    return [];
  }
}

export async function stopActiveSpecialOffer(): Promise<{ success: boolean; message: string }> {
  return await apiClient.post<{ success: boolean; message: string }>("/special-offers/stop-active");
}

export async function activateSpecialOffer(id: string): Promise<SpecialOfferCampaign> {
  const updated = await apiClient.post<SpecialOfferCampaign>(`/special-offers/${id}/activate`);
  return {
    ...updated,
    products: (updated.products || []).map((p) => normalizeSpecialOfferProduct(p, updated.endDate)),
  };
}

