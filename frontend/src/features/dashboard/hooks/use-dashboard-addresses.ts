"use client";

import * as React from "react";
import { DashboardAddress } from "../types/addresses.types";
import { addressesApi, CreateAddressPayload } from "../api/addresses-api";

export function useDashboardAddresses() {
  const [addresses, setAddresses] = React.useState<DashboardAddress[]>([]);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchAddresses = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await addressesApi.getAddresses();
      setAddresses(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطا در دریافت نشانی‌ها";
      setError(msg);
    } finally {
      setIsLoaded(true);
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchAddresses();
  }, [fetchAddresses]);

  const setDefaultAddress = async (id: string) => {
    try {
      // Optimistic update
      setAddresses((prev) =>
        prev.map((a) => ({
          ...a,
          isDefault: a.id === id,
        }))
      );
      await addressesApi.setDefaultAddress(id);
    } catch (err: unknown) {
      await fetchAddresses();
      throw err;
    }
  };

  const addAddress = async (data: CreateAddressPayload): Promise<DashboardAddress> => {
    try {
      const created = await addressesApi.createAddress(data);
      setAddresses((prev) => {
        let updated = [...prev];
        if (created.isDefault) {
          updated = updated.map((a) => ({ ...a, isDefault: false }));
        }
        return [created, ...updated];
      });
      return created;
    } catch (err: unknown) {
      throw err;
    }
  };

  const updateAddress = async (id: string, data: Partial<CreateAddressPayload>) => {
    try {
      const updated = await addressesApi.updateAddress(id, data);
      setAddresses((prev) => {
        let list = prev.map((a) => (a.id === id ? updated : a));
        if (updated.isDefault) {
          list = list.map((a) => ({
            ...a,
            isDefault: a.id === id,
          }));
        }
        return list;
      });
      return updated;
    } catch (err: unknown) {
      throw err;
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      await addressesApi.deleteAddress(id);
      setAddresses((prev) => {
        const target = prev.find((a) => a.id === id);
        const remaining = prev.filter((a) => a.id !== id);
        if (target?.isDefault && remaining.length > 0) {
          remaining[0].isDefault = true;
        }
        return remaining;
      });
    } catch (err: unknown) {
      await fetchAddresses();
      throw err;
    }
  };

  return {
    addresses,
    isLoaded,
    isLoading,
    error,
    refreshAddresses: fetchAddresses,
    setDefaultAddress,
    addAddress,
    updateAddress,
    deleteAddress,
  };
}
