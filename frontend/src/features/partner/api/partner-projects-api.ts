import { apiClient } from "@/shared/lib/api-client";
import type { PartnerProjectSite } from "../types/partner.types";

export interface CreateProjectPayload {
  title: string;
  name?: string;
  city: string;
  province?: string;
  address: string;
  detailedAddress?: string;
  fullAddress?: string;
  supervisorName?: string;
  recipientName?: string;
  supervisorPhone?: string;
  phoneNumber?: string;
  postalCode?: string;
  plaque?: string;
  buildingNumber?: string;
  unit?: string;
  deliveryNotes?: string;
}

export interface UpdateProjectPayload {
  title?: string;
  name?: string;
  city?: string;
  province?: string;
  address?: string;
  detailedAddress?: string;
  fullAddress?: string;
  supervisorName?: string;
  recipientName?: string;
  supervisorPhone?: string;
  phoneNumber?: string;
  postalCode?: string;
  plaque?: string;
  buildingNumber?: string;
  unit?: string;
  deliveryNotes?: string;
}

interface BackendProjectDto {
  id: string;
  userId: string;
  partnerName?: string;
  partnerCompany?: string;
  partnerPhone?: string;
  title: string;
  name: string;
  type: string;
  tag: string;
  tagLabel: string;
  province: string;
  city: string;
  detailedAddress: string;
  fullAddress: string;
  address: string;
  plaque: string;
  buildingNumber: string;
  unit?: string | null;
  postalCode: string;
  recipientFirstName: string;
  recipientLastName: string;
  recipientName: string;
  supervisorName: string;
  recipientMobile: string;
  phoneNumber: string;
  supervisorPhone: string;
  deliveryNotes?: string | null;
  isDefault: boolean;
  activeOrdersCount: number;
  totalOrdersCount: number;
  createdAt: string;
  updatedAt: string;
}

function mapDtoToPartnerProjectSite(dto: BackendProjectDto): PartnerProjectSite {
  return {
    id: dto.id,
    userId: dto.userId,
    name: dto.name || dto.title,
    title: dto.title || dto.name,
    projectCode: `PRJ-${dto.id.slice(0, 6).toUpperCase()}`,
    type: dto.type,
    tag: dto.tag,
    tagLabel: dto.tagLabel,
    province: dto.province,
    city: dto.city,
    address: dto.detailedAddress || dto.fullAddress || dto.address,
    fullAddress: dto.fullAddress || dto.detailedAddress || dto.address,
    detailedAddress: dto.detailedAddress || dto.fullAddress || dto.address,
    plaque: dto.plaque || dto.buildingNumber,
    buildingNumber: dto.buildingNumber || dto.plaque,
    unit: dto.unit,
    postalCode: dto.postalCode,
    recipientName: dto.recipientName || dto.supervisorName,
    supervisorName: dto.supervisorName || dto.recipientName,
    recipientMobile: dto.recipientMobile || dto.phoneNumber || dto.supervisorPhone,
    phoneNumber: dto.phoneNumber || dto.recipientMobile || dto.supervisorPhone,
    supervisorPhone: dto.supervisorPhone || dto.phoneNumber || dto.recipientMobile,
    deliveryNotes: dto.deliveryNotes,
    isDefault: dto.isDefault,
    activeOrdersCount: dto.activeOrdersCount || 0,
    totalOrdersCount: dto.totalOrdersCount || 0,
    partnerName: dto.partnerName,
    partnerCompany: dto.partnerCompany,
    partnerPhone: dto.partnerPhone,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export const partnerProjectsApi = {
  /**
   * دریافت لیست سایت‌ها و مقاصد پروژه‌ای همکار جاری
   */
  async getMyProjects(): Promise<PartnerProjectSite[]> {
    try {
      const data = await apiClient.get<BackendProjectDto[]>("/projects/my");
      return Array.isArray(data) ? data.map(mapDtoToPartnerProjectSite) : [];
    } catch (err) {
      console.error("[partnerProjectsApi.getMyProjects] Error:", err);
      return [];
    }
  },

  /**
   * دریافت جزییات یک سایت پروژه با شناسه
   */
  async getProjectById(id: string): Promise<PartnerProjectSite | null> {
    try {
      const data = await apiClient.get<BackendProjectDto>(`/projects/${id}`);
      return data ? mapDtoToPartnerProjectSite(data) : null;
    } catch (err) {
      console.error(`[partnerProjectsApi.getProjectById] Error ${id}:`, err);
      return null;
    }
  },

  /**
   * ثبت یک سایت پروژه یا کارگاه جدید
   */
  async createProject(payload: CreateProjectPayload): Promise<PartnerProjectSite> {
    const data = await apiClient.post<BackendProjectDto>(
      "/projects",
      payload,
    );
    return mapDtoToPartnerProjectSite(data);
  },

  /**
   * بروزرسانی مشخصات سایت پروژه
   */
  async updateProject(
    id: string,
    payload: UpdateProjectPayload,
  ): Promise<PartnerProjectSite> {
    const data = await apiClient.patch<BackendProjectDto>(
      `/projects/${id}`,
      payload,
    );
    return mapDtoToPartnerProjectSite(data);
  },

  /**
   * حذف یک سایت پروژه
   */
  async deleteProject(id: string): Promise<boolean> {
    await apiClient.delete<{ success: boolean }>(`/projects/${id}`);
    return true;
  },

  /**
   * دریافت کلیه سایت‌های پروژه‌ای سیستم (برای پنل ادمین)
   */
  async getAllProjects(city?: string): Promise<PartnerProjectSite[]> {
    try {
      const qs = city ? `?city=${encodeURIComponent(city)}&all=true` : "?all=true";
      const data = await apiClient.get<BackendProjectDto[]>(`/projects${qs}`);
      return Array.isArray(data) ? data.map(mapDtoToPartnerProjectSite) : [];
    } catch (err) {
      console.error("[partnerProjectsApi.getAllProjects] Error:", err);
      return [];
    }
  },
};
