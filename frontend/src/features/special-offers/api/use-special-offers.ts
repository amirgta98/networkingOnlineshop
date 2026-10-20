import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getActiveSpecialOffer,
  getAdminSpecialOffers,
  getSpecialOfferById,
  createSpecialOffer,
  updateSpecialOffer,
  updateSpecialOfferStatus,
  deleteSpecialOffer,
} from "./special-offers-api";
import type { CreateSpecialOfferInput, UpdateSpecialOfferInput } from "../types";

export const specialOfferKeys = {
  all: ["special-offers"] as const,
  active: () => [...specialOfferKeys.all, "active"] as const,
  adminLists: () => [...specialOfferKeys.all, "admin", "list"] as const,
  adminList: (filter?: { status?: string; search?: string }) =>
    [...specialOfferKeys.adminLists(), filter] as const,
  details: () => [...specialOfferKeys.all, "detail"] as const,
  detail: (id: string) => [...specialOfferKeys.details(), id] as const,
};

export function useActiveSpecialOffer() {
  return useQuery({
    queryKey: specialOfferKeys.active(),
    queryFn: () => getActiveSpecialOffer(),
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000,
  });
}

export function useAdminSpecialOffers(filter?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: specialOfferKeys.adminList(filter),
    queryFn: () => getAdminSpecialOffers(filter),
  });
}

export function useSpecialOffer(id: string) {
  return useQuery({
    queryKey: specialOfferKeys.detail(id),
    queryFn: () => getSpecialOfferById(id),
    enabled: Boolean(id),
  });
}

export function useCreateSpecialOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSpecialOfferInput) => createSpecialOffer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: specialOfferKeys.all });
    },
  });
}

export function useUpdateSpecialOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSpecialOfferInput }) =>
      updateSpecialOffer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: specialOfferKeys.all });
    },
  });
}

export function useUpdateSpecialOfferStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      isPublished,
    }: {
      id: string;
      status: "ACTIVE" | "INACTIVE";
      isPublished?: boolean;
    }) => updateSpecialOfferStatus(id, status, isPublished),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: specialOfferKeys.all });
    },
  });
}

export function useDeleteSpecialOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSpecialOffer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: specialOfferKeys.all });
    },
  });
}

export function useDiscountedProducts() {
  return useQuery({
    queryKey: ["discounted-catalog-products"],
    queryFn: () => import("./special-offers-api").then((m) => m.getDiscountedProducts()),
    staleTime: 5 * 60 * 1000,
  });
}

export function useStopActiveSpecialOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => import("./special-offers-api").then((m) => m.stopActiveSpecialOffer()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: specialOfferKeys.all });
    },
  });
}

export function useActivateSpecialOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => import("./special-offers-api").then((m) => m.activateSpecialOffer(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: specialOfferKeys.all });
    },
  });
}

