import { apiClient } from "@/shared/lib/api-client";
import { MOCK_PRODUCTS } from "@/shared/lib/mocks/mock-products";
import { Product, ProductFilterParams } from "../types";

export async function getProducts(params: ProductFilterParams = {}): Promise<Product[]> {
  try {
    // Attempt Fastify API call first if configured
    if (process.env.NEXT_PUBLIC_API_URL) {
      const response = await apiClient.get<Product[]>("/products", {
        params: params as Record<string, string | number | boolean>,
      });
      return response;
    }
  } catch (error) {
    // Graceful fallback to client mock data during prototyping
    console.warn("[Catalog API] Fastify endpoint unreachable, falling back to mock products:", error);
  }

  // Mock filtering implementation
  let filtered = [...MOCK_PRODUCTS];

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
    filtered = filtered.filter((p) => (p.discountPercent && p.discountPercent > 0) || (p.originalPrice && p.originalPrice > p.price));
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
        // Preserve default reverse insertion or custom order
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
    if (process.env.NEXT_PUBLIC_API_URL) {
      return await apiClient.get<Product>(`/products/${id}`);
    }
  } catch (error) {
    console.warn(`[Catalog API] Could not fetch product ${id}:`, error);
  }

  return MOCK_PRODUCTS.find((p) => p.id === id) || null;
}

export async function getProductBySlugOrId(slugOrId: string): Promise<Product | null> {
  try {
    if (process.env.NEXT_PUBLIC_API_URL) {
      return await apiClient.get<Product>(`/products/${slugOrId}`);
    }
  } catch (error) {
    console.warn(`[Catalog API] Could not fetch product by slug/id ${slugOrId}:`, error);
  }

  return (
    MOCK_PRODUCTS.find((p) => p.slug === slugOrId || p.id === slugOrId) || null
  );
}

