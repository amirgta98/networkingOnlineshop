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
  recipientFirstName?: string;
  recipientLastName?: string;
  supervisorPhone?: string;
  phoneNumber?: string;
  recipientMobile?: string;
  postalCode?: string;
  plaque?: string;
  buildingNumber?: string;
  unit?: string;
  deliveryNotes?: string;
  isDefault?: boolean;
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
  recipientFirstName?: string;
  recipientLastName?: string;
  supervisorPhone?: string;
  phoneNumber?: string;
  recipientMobile?: string;
  postalCode?: string;
  plaque?: string;
  buildingNumber?: string;
  unit?: string;
  deliveryNotes?: string;
  isDefault?: boolean;
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

const STORAGE_KEY = "velox_partner_projects";

function getLocalProjects(): PartnerProjectSite[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

function saveLocalProjects(projects: PartnerProjectSite[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch {
    // ignore
  }
}

export const partnerProjectsApi = {
  /**
   * دریافت لیست سایت‌ها و مقاصد پروژه‌ای همکار جاری
   */
  async getMyProjects(): Promise<PartnerProjectSite[]> {
    try {
      const data = await apiClient.get<BackendProjectDto[]>("/projects/my");
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map(mapDtoToPartnerProjectSite);
        // Merge with locally stored if any local ones exist that aren't on remote
        const local = getLocalProjects();
        const merged = [...mapped];
        for (const loc of local) {
          if (!merged.some((m) => m.id === loc.id)) {
            merged.push(loc);
          }
        }
        saveLocalProjects(merged);
        return merged;
      }
    } catch (err) {
      console.warn("[partnerProjectsApi.getMyProjects] Remote fetch failed, falling back to local cache:", err);
    }

    const local = getLocalProjects();
    if (local.length > 0) {
      return local;
    }
    return [];
  },

  /**
   * دریافت جزییات یک سایت پروژه با شناسه
   */
  async getProjectById(id: string): Promise<PartnerProjectSite | null> {
    try {
      const data = await apiClient.get<BackendProjectDto>(`/projects/${id}`);
      if (data) {
        return mapDtoToPartnerProjectSite(data);
      }
    } catch (err) {
      console.warn(`[partnerProjectsApi.getProjectById] Remote get failed for ${id}, checking local:`, err);
    }

    const local = getLocalProjects();
    return local.find((p) => p.id === id) || null;
  },

  /**
   * ثبت یک سایت پروژه یا کارگاه جدید
   */
  async createProject(payload: CreateProjectPayload): Promise<PartnerProjectSite> {
    let resultDto: BackendProjectDto | null = null;
    try {
      resultDto = await apiClient.post<BackendProjectDto>(
        "/projects",
        payload,
      );
    } catch (err) {
      console.warn("[partnerProjectsApi.createProject] Remote create failed, saving locally:", err);
    }

    let createdSite: PartnerProjectSite;
    if (resultDto) {
      createdSite = mapDtoToPartnerProjectSite(resultDto);
    } else {
      const newId = `prj_local_${Date.now()}`;
      createdSite = {
        id: newId,
        userId: "usr_partner_01",
        title: payload.title || payload.name || "سایت پروژه جدید",
        name: payload.name || payload.title || "سایت پروژه جدید",
        projectCode: `PRJ-${newId.slice(-6).toUpperCase()}`,
        type: "NETWORK_PROJECT_SITE",
        tag: "project_site",
        tagLabel: "سایت پروژه",
        province: payload.province || "تهران",
        city: payload.city || "تهران",
        address: payload.detailedAddress || payload.fullAddress || payload.address,
        detailedAddress: payload.detailedAddress || payload.fullAddress || payload.address,
        fullAddress: payload.fullAddress || payload.detailedAddress || payload.address,
        plaque: payload.plaque || payload.buildingNumber || "۱",
        buildingNumber: payload.buildingNumber || payload.plaque || "۱",
        unit: payload.unit,
        postalCode: payload.postalCode || "1983963111",
        recipientName: payload.recipientName || payload.supervisorName || "مهندس ناظر",
        supervisorName: payload.supervisorName || payload.recipientName || "مهندس ناظر",
        recipientMobile: payload.recipientMobile || payload.phoneNumber || payload.supervisorPhone || "09120000000",
        phoneNumber: payload.phoneNumber || payload.recipientMobile || payload.supervisorPhone || "09120000000",
        supervisorPhone: payload.supervisorPhone || payload.phoneNumber || payload.recipientMobile || "09120000000",
        deliveryNotes: payload.deliveryNotes,
        isDefault: false,
        activeOrdersCount: 0,
        totalOrdersCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    const local = getLocalProjects();
    saveLocalProjects([createdSite, ...local]);
    return createdSite;
  },

  /**
   * بروزرسانی مشخصات سایت پروژه
   */
  async updateProject(
    id: string,
    payload: UpdateProjectPayload,
  ): Promise<PartnerProjectSite> {
    let resultDto: BackendProjectDto | null = null;
    try {
      resultDto = await apiClient.patch<BackendProjectDto>(
        `/projects/${id}`,
        payload,
      );
    } catch (patchErr) {
      console.warn(`[partnerProjectsApi.updateProject] PATCH failed for ${id}, trying PUT:`, patchErr);
      try {
        resultDto = await apiClient.put<BackendProjectDto>(
          `/projects/${id}`,
          payload,
        );
      } catch (putErr) {
        console.warn(`[partnerProjectsApi.updateProject] Remote update failed for ${id}, persisting locally:`, putErr);
      }
    }

    let updatedSite: PartnerProjectSite;
    if (resultDto) {
      updatedSite = mapDtoToPartnerProjectSite(resultDto);
    } else {
      const local = getLocalProjects();
      const existing = local.find((p) => p.id === id);
      updatedSite = {
        id,
        userId: existing?.userId || "usr_partner_01",
        title: payload.title || payload.name || existing?.title || "سایت پروژه",
        name: payload.name || payload.title || existing?.name || "سایت پروژه",
        projectCode: existing?.projectCode || `PRJ-${id.slice(0, 6).toUpperCase()}`,
        type: existing?.type || "NETWORK_PROJECT_SITE",
        tag: existing?.tag || "project_site",
        tagLabel: existing?.tagLabel || "سایت پروژه",
        province: payload.province || existing?.province || "تهران",
        city: payload.city || existing?.city || "تهران",
        address: payload.detailedAddress || payload.fullAddress || payload.address || existing?.address || "",
        detailedAddress: payload.detailedAddress || payload.fullAddress || payload.address || existing?.detailedAddress || "",
        fullAddress: payload.fullAddress || payload.detailedAddress || payload.address || existing?.fullAddress || "",
        plaque: payload.plaque || payload.buildingNumber || existing?.plaque || "۱",
        buildingNumber: payload.buildingNumber || payload.plaque || existing?.buildingNumber || "۱",
        unit: payload.unit !== undefined ? payload.unit : existing?.unit,
        postalCode: payload.postalCode || existing?.postalCode || "1983963111",
        recipientName: payload.recipientName || payload.supervisorName || existing?.recipientName || "مهندس ناظر",
        supervisorName: payload.supervisorName || payload.recipientName || existing?.supervisorName || "مهندس ناظر",
        recipientMobile: payload.recipientMobile || payload.supervisorPhone || payload.phoneNumber || existing?.recipientMobile || "09120000000",
        phoneNumber: payload.phoneNumber || payload.supervisorPhone || payload.recipientMobile || existing?.phoneNumber || "09120000000",
        supervisorPhone: payload.supervisorPhone || payload.phoneNumber || payload.recipientMobile || existing?.supervisorPhone || "09120000000",
        deliveryNotes: payload.deliveryNotes !== undefined ? payload.deliveryNotes : existing?.deliveryNotes,
        isDefault: existing?.isDefault || false,
        activeOrdersCount: existing?.activeOrdersCount || 0,
        totalOrdersCount: existing?.totalOrdersCount || 0,
        createdAt: existing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    // Persist to local storage
    const local = getLocalProjects();
    const existingIndex = local.findIndex((p) => p.id === id);
    if (existingIndex >= 0) {
      local[existingIndex] = { ...local[existingIndex], ...updatedSite };
    } else {
      local.push(updatedSite);
    }
    saveLocalProjects(local);

    return updatedSite;
  },

  /**
   * حذف یک سایت پروژه
   */
  async deleteProject(id: string): Promise<boolean> {
    try {
      await apiClient.delete<{ success: boolean }>(`/projects/${id}`);
    } catch (err) {
      console.warn(`[partnerProjectsApi.deleteProject] Remote delete failed for ${id}, deleting locally:`, err);
    }
    const local = getLocalProjects();
    saveLocalProjects(local.filter((p) => p.id !== id));
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
