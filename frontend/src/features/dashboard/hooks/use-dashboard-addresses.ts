"use client";

import * as React from "react";
import { DashboardAddress } from "../types/addresses.types";
import { INITIAL_ADDRESSES } from "../data/mock-addresses";

const STORAGE_KEY = "velox_dashboard_addresses_v1";

export function useDashboardAddresses() {
  const [addresses, setAddresses] = React.useState<DashboardAddress[]>([]);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setAddresses(JSON.parse(stored));
      } else {
        setAddresses(INITIAL_ADDRESSES);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ADDRESSES));
      }
    } catch {
      setAddresses(INITIAL_ADDRESSES);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveAddresses = (newAddrs: DashboardAddress[]) => {
    setAddresses(newAddrs);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAddrs));
    } catch (e) {
      console.error("Failed to save addresses", e);
    }
  };

  const setDefaultAddress = (id: string) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    saveAddresses(updated);
  };

  const addAddress = (data: Omit<DashboardAddress, "id">) => {
    const newAddress: DashboardAddress = {
      ...data,
      id: `addr-${Date.now()}`,
    };

    let updated = [...addresses];
    if (newAddress.isDefault) {
      updated = updated.map((a) => ({ ...a, isDefault: false }));
    }
    updated.unshift(newAddress);
    saveAddresses(updated);
    return newAddress;
  };

  const updateAddress = (id: string, data: Partial<DashboardAddress>) => {
    let updated = addresses.map((a) => (a.id === id ? { ...a, ...data } : a));
    if (data.isDefault) {
      updated = updated.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }));
    }
    saveAddresses(updated);
  };

  const deleteAddress = (id: string) => {
    const target = addresses.find((a) => a.id === id);
    const updated = addresses.filter((a) => a.id !== id);
    if (target?.isDefault && updated.length > 0) {
      updated[0].isDefault = true;
    }
    saveAddresses(updated);
  };

  return {
    addresses,
    isLoaded,
    setDefaultAddress,
    addAddress,
    updateAddress,
    deleteAddress,
  };
}
