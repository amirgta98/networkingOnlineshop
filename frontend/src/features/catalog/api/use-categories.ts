"use client";

import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "@/features/admin/api/categories-api";
import type { AdminCategory } from "@/features/admin/types/admin-categories.types";
import { catalogKeys } from "./use-products";

export function useCategories() {
  return useQuery<AdminCategory[]>({
    queryKey: catalogKeys.categories(),
    queryFn: async () => {
      const data = await categoriesApi.getCategories({ isActive: true });
      return data || [];
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true,
  });
}
