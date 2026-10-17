import { apiClient } from "@/shared/lib/api-client";
import { DeliveryMethod, DeliveryTimeSlotOption } from "@/features/checkout/types";
import {
  FALLBACK_DELIVERY_METHODS,
  FALLBACK_TIME_SLOTS,
} from "@/features/checkout/api/shipping-api";

export interface AdminShippingConfig {
  sameDayCutoffHour: number;
  leadTimeDays: number;
  workingDays: number[];
  daysInAdvance: number;
  holidayDates: string[];
}

const LOCAL_STORAGE_METHODS_KEY = "velox_admin_shipping_methods";
const LOCAL_STORAGE_SLOTS_KEY = "velox_admin_time_slots";
const LOCAL_STORAGE_CONFIG_KEY = "velox_admin_shipping_config";

const DEFAULT_CONFIG: AdminShippingConfig = {
  sameDayCutoffHour: 14,
  leadTimeDays: 0,
  workingDays: [0, 1, 2, 3, 4, 5],
  daysInAdvance: 7,
  holidayDates: [],
};

export const adminShippingApi = {
  async getMethods(): Promise<DeliveryMethod[]> {
    try {
      const data = await apiClient.get<DeliveryMethod[]>("/shipping/admin/methods", { timeout: 4000 });
      if (Array.isArray(data) && data.length > 0) {
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_STORAGE_METHODS_KEY, JSON.stringify(data));
        }
        return data;
      }
    } catch {
      // fallback
    }

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_METHODS_KEY);
        if (stored) return JSON.parse(stored);
      } catch {
        // ignore
      }
    }

    return [...FALLBACK_DELIVERY_METHODS];
  },

  async createMethod(payload: Partial<DeliveryMethod>): Promise<DeliveryMethod> {
    try {
      const created = await apiClient.post<DeliveryMethod>("/shipping/admin/methods", payload);
      this.syncLocalMethod(created);
      return created;
    } catch {
      const newMethod: DeliveryMethod = {
        id: payload.id || `method_${Date.now()}`,
        title: payload.title || "شیوه ارسال جدید",
        subtitle: payload.subtitle || "",
        description: payload.description || "",
        cost: payload.cost ?? 50000,
        freeThreshold: payload.freeThreshold ?? null,
        estimatedDeliveryTime: payload.estimatedDeliveryTime || "۲۴ الی ۴۸ ساعت",
        iconName: payload.iconName || "truck",
        iconUrl: payload.iconUrl ?? null,
        isExpress: payload.isExpress ?? false,
        isActive: payload.isActive ?? true,
        allowedProvinces: payload.allowedProvinces || [],
        provinceRules: payload.provinceRules || [],
        minOrderAmount: payload.minOrderAmount ?? 0,
        maxWeightKg: payload.maxWeightKg ?? null,
      };
      this.syncLocalMethod(newMethod);
      return newMethod;
    }
  },

  async updateMethod(id: string, payload: Partial<DeliveryMethod>): Promise<DeliveryMethod> {
    try {
      const updated = await apiClient.put<DeliveryMethod>(`/shipping/admin/methods/${id}`, payload);
      this.syncLocalMethod(updated);
      return updated;
    } catch {
      const list = await this.getMethods();
      const idx = list.findIndex((m) => m.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...payload };
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_STORAGE_METHODS_KEY, JSON.stringify(list));
        }
        return list[idx];
      }
      throw new Error("روش ارسال یافت نشد.");
    }
  },

  async uploadCarrierIcon(file: File): Promise<{ url: string; filename: string; originalName: string }> {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<{ url: string; filename: string; originalName: string }>(
      "/shipping/admin/upload-icon",
      formData
    );
  },

  async deleteCarrierIcon(filename: string): Promise<{ success: boolean }> {
    const cleanFilename = filename.split("/").pop() || filename;
    return apiClient.delete<{ success: boolean }>(`/shipping/admin/upload-icon/${cleanFilename}`);
  },

  async deleteMethod(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/shipping/admin/methods/${id}`);
    } catch {
      // local fallback
    }

    if (typeof window !== "undefined") {
      const list = (await this.getMethods()).filter((m) => m.id !== id);
      localStorage.setItem(LOCAL_STORAGE_METHODS_KEY, JSON.stringify(list));
    }
    return true;
  },

  async toggleMethod(id: string): Promise<DeliveryMethod> {
    try {
      const toggled = await apiClient.patch<DeliveryMethod>(`/shipping/admin/methods/${id}/toggle`);
      this.syncLocalMethod(toggled);
      return toggled;
    } catch {
      const list = await this.getMethods();
      const target = list.find((m) => m.id === id);
      if (target) {
        target.isActive = !target.isActive;
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_STORAGE_METHODS_KEY, JSON.stringify(list));
        }
        return target;
      }
      throw new Error("روش ارسال یافت نشد.");
    }
  },

  async getConfig(): Promise<AdminShippingConfig> {
    try {
      const data = await apiClient.get<AdminShippingConfig>("/shipping/admin/config", { timeout: 4000 });
      if (data && typeof data.sameDayCutoffHour === "number") {
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(data));
        }
        return data;
      }
    } catch {
      // fallback
    }

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_CONFIG_KEY);
        if (stored) return JSON.parse(stored);
      } catch {
        // ignore
      }
    }

    return { ...DEFAULT_CONFIG };
  },

  async updateConfig(payload: Partial<AdminShippingConfig>): Promise<AdminShippingConfig> {
    try {
      const updated = await apiClient.put<AdminShippingConfig>("/shipping/admin/config", payload);
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(updated));
      }
      return updated;
    } catch {
      const current = await this.getConfig();
      const updated = { ...current, ...payload };
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(updated));
      }
      return updated;
    }
  },

  async getTimeSlots(): Promise<DeliveryTimeSlotOption[]> {
    try {
      const data = await apiClient.get<DeliveryTimeSlotOption[]>("/shipping/admin/slots", { timeout: 4000 });
      if (Array.isArray(data) && data.length > 0) {
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_STORAGE_SLOTS_KEY, JSON.stringify(data));
        }
        return data;
      }
    } catch {
      // fallback
    }

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_SLOTS_KEY);
        if (stored) return JSON.parse(stored);
      } catch {
        // ignore
      }
    }

    return [...FALLBACK_TIME_SLOTS];
  },

  async createTimeSlot(payload: Partial<DeliveryTimeSlotOption>): Promise<DeliveryTimeSlotOption> {
    try {
      const created = await apiClient.post<DeliveryTimeSlotOption>("/shipping/admin/slots", payload);
      this.syncLocalSlot(created);
      return created;
    } catch {
      const newSlot: DeliveryTimeSlotOption = {
        id: payload.id || `slot_${Date.now()}`,
        title: payload.title || "بازه زمانی جدید",
        startTime: payload.startTime || "09:00",
        endTime: payload.endTime || "13:00",
        description: payload.description || "",
        maxCapacity: payload.maxCapacity ?? 40,
        isActive: payload.isActive ?? true,
      };
      this.syncLocalSlot(newSlot);
      return newSlot;
    }
  },

  async updateTimeSlot(id: string, payload: Partial<DeliveryTimeSlotOption>): Promise<DeliveryTimeSlotOption> {
    try {
      const updated = await apiClient.put<DeliveryTimeSlotOption>(`/shipping/admin/slots/${id}`, payload);
      this.syncLocalSlot(updated);
      return updated;
    } catch {
      const list = await this.getTimeSlots();
      const idx = list.findIndex((s) => s.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...payload };
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_STORAGE_SLOTS_KEY, JSON.stringify(list));
        }
        return list[idx];
      }
      throw new Error("بازه زمانی یافت نشد.");
    }
  },

  async deleteTimeSlot(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/shipping/admin/slots/${id}`);
    } catch {
      // local fallback
    }

    if (typeof window !== "undefined") {
      const list = (await this.getTimeSlots()).filter((s) => s.id !== id);
      localStorage.setItem(LOCAL_STORAGE_SLOTS_KEY, JSON.stringify(list));
    }
    return true;
  },

  syncLocalMethod(item: DeliveryMethod) {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_METHODS_KEY);
      const list: DeliveryMethod[] = raw ? JSON.parse(raw) : [...FALLBACK_DELIVERY_METHODS];
      const idx = list.findIndex((m) => m.id === item.id);
      if (idx !== -1) list[idx] = item;
      else list.push(item);
      localStorage.setItem(LOCAL_STORAGE_METHODS_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  },

  syncLocalSlot(item: DeliveryTimeSlotOption) {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_SLOTS_KEY);
      const list: DeliveryTimeSlotOption[] = raw ? JSON.parse(raw) : [...FALLBACK_TIME_SLOTS];
      const idx = list.findIndex((s) => s.id === item.id);
      if (idx !== -1) list[idx] = item;
      else list.push(item);
      localStorage.setItem(LOCAL_STORAGE_SLOTS_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  },
};
