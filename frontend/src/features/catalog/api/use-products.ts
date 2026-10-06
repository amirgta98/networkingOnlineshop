import { useQuery } from "@tanstack/react-query";
import { getProducts, getProductById } from "./get-products";
import { ProductFilterParams } from "../types";

export const catalogKeys = {
  all: ["catalog"] as const,
  lists: () => [...catalogKeys.all, "list"] as const,
  list: (params: ProductFilterParams) => [...catalogKeys.lists(), params] as const,
  details: () => [...catalogKeys.all, "detail"] as const,
  detail: (id: string) => [...catalogKeys.details(), id] as const,
};

export function useProducts(params: ProductFilterParams = {}) {
  return useQuery({
    queryKey: catalogKeys.list(params),
    queryFn: () => getProducts(params),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: catalogKeys.detail(id),
    queryFn: () => getProductById(id),
    enabled: Boolean(id),
  });
}
