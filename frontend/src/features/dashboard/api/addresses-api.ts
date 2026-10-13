import { apiClient, ApiError } from "@/shared/lib/api-client";
import { DashboardAddress, AddressTag } from "../types/addresses.types";

export interface CreateAddressPayload {
  title: string;
  tag?: AddressTag;
  type?: string;
  recipientName: string;
  phoneNumber: string;
  province: string;
  city: string;
  fullAddress: string;
  buildingNumber: string;
  unit?: string;
  postalCode: string;
  deliveryNotes?: string;
  isDefault?: boolean;
  latitude?: number;
  longitude?: number;
}

export interface BackendAddressDto {
  id: string;
  userId: string;
  title: string;
  type: string;
  tag: AddressTag;
  tagLabel: string;
  recipientFirstName: string;
  recipientLastName: string;
  recipientName: string;
  recipientMobile: string;
  phoneNumber: string;
  province: string;
  city: string;
  detailedAddress: string;
  fullAddress: string;
  address: string;
  plaque: string;
  buildingNumber: string;
  unit?: string | null;
  postalCode: string;
  deliveryNotes?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

function mapBackendDtoToDashboardAddress(dto: BackendAddressDto): DashboardAddress {
  const tagLabels: Record<AddressTag, string> = {
    central_office: "دفتر مرکزی",
    warehouse: "انبار مرکزی",
    project_site: "سایت پروژه",
    residence: "سکونت",
  };

  const tag = (dto.tag || "central_office") as AddressTag;

  return {
    id: dto.id,
    title: dto.title,
    tag,
    tagLabel: dto.tagLabel || tagLabels[tag] || "دفتر مرکزی",
    recipientName: dto.recipientName || `${dto.recipientFirstName || ""} ${dto.recipientLastName || ""}`.trim(),
    phoneNumber: dto.phoneNumber || dto.recipientMobile,
    province: dto.province,
    city: dto.city,
    postalCode: dto.postalCode,
    fullAddress: dto.fullAddress || dto.detailedAddress || dto.address,
    buildingNumber: dto.buildingNumber || dto.plaque,
    unit: dto.unit || undefined,
    deliveryNotes: dto.deliveryNotes || undefined,
    isDefault: Boolean(dto.isDefault),
    latitude: dto.latitude !== null ? dto.latitude : undefined,
    longitude: dto.longitude !== null ? dto.longitude : undefined,
  };
}

export const addressesApi = {
  /**
   * Get all addresses for the authenticated user
   */
  async getAddresses(): Promise<DashboardAddress[]> {
    try {
      const response = await apiClient.get<BackendAddressDto[]>("/addresses");
      return response.map(mapBackendDtoToDashboardAddress);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.statusCode === 401) {
          // Unauthenticated
          return [];
        }
        throw new Error(err.message || "خطا در دریافت لیست نشانی‌ها از سرور");
      }
      throw err;
    }
  },

  /**
   * Get single address by ID
   */
  async getAddressById(id: string): Promise<DashboardAddress> {
    const response = await apiClient.get<BackendAddressDto>(`/addresses/${id}`);
    return mapBackendDtoToDashboardAddress(response);
  },

  /**
   * Create a new address
   */
  async createAddress(payload: CreateAddressPayload): Promise<DashboardAddress> {
    try {
      const response = await apiClient.post<BackendAddressDto>("/addresses", {
        title: payload.title,
        tag: payload.tag,
        type: payload.type || payload.tag,
        recipientName: payload.recipientName,
        phoneNumber: payload.phoneNumber,
        province: payload.province,
        city: payload.city,
        fullAddress: payload.fullAddress,
        buildingNumber: payload.buildingNumber,
        unit: payload.unit,
        postalCode: payload.postalCode,
        deliveryNotes: payload.deliveryNotes,
        isDefault: payload.isDefault,
        latitude: payload.latitude,
        longitude: payload.longitude,
      });
      return mapBackendDtoToDashboardAddress(response);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        throw new Error(err.message || "خطا در ثبت نشانی جدید در سرور");
      }
      throw err;
    }
  },

  /**
   * Update an existing address
   */
  async updateAddress(
    id: string,
    payload: Partial<CreateAddressPayload>,
  ): Promise<DashboardAddress> {
    try {
      const response = await apiClient.put<BackendAddressDto>(`/addresses/${id}`, {
        title: payload.title,
        tag: payload.tag,
        type: payload.type || payload.tag,
        recipientName: payload.recipientName,
        phoneNumber: payload.phoneNumber,
        province: payload.province,
        city: payload.city,
        fullAddress: payload.fullAddress,
        buildingNumber: payload.buildingNumber,
        unit: payload.unit,
        postalCode: payload.postalCode,
        deliveryNotes: payload.deliveryNotes,
        isDefault: payload.isDefault,
        latitude: payload.latitude,
        longitude: payload.longitude,
      });
      return mapBackendDtoToDashboardAddress(response);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        throw new Error(err.message || "خطا در ویرایش نشانی در سرور");
      }
      throw err;
    }
  },

  /**
   * Set address as default
   */
  async setDefaultAddress(id: string): Promise<DashboardAddress> {
    try {
      const response = await apiClient.patch<BackendAddressDto>(`/addresses/${id}/default`);
      return mapBackendDtoToDashboardAddress(response);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        throw new Error(err.message || "خطا در تنظیم نشانی پیش‌فرض");
      }
      throw err;
    }
  },

  /**
   * Delete an address
   */
  async deleteAddress(id: string): Promise<void> {
    try {
      await apiClient.delete<{ success: boolean }>(`/addresses/${id}`);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        throw new Error(err.message || "خطا در حذف نشانی از سرور");
      }
      throw err;
    }
  },
};
