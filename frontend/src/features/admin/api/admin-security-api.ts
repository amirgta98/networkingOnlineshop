import { apiClient } from "@/shared/lib/api-client";
import type {
  SecurityOverviewDto,
  SecurityTelemetryPayload,
  SecurityAuditLog,
  ActiveAdminSessionDto,
  WafSecurityStatus,
} from "../types/admin-security.types";

export interface GetAuditLogsParams {
  category?: string;
  level?: string;
  search?: string;
  limit?: number;
}

export interface EmergencyKillPayload {
  excludeCurrentSession?: boolean;
  currentSessionId?: string;
  reason?: string;
}

export const adminSecurityApi = {
  /**
   * دریافت شاخص‌های کلی امنیت و وضعیت زیرساخت دیتاسنتر
   */
  async getOverview(): Promise<SecurityOverviewDto> {
    return apiClient.get<SecurityOverviewDto>("/security/overview");
  },

  /**
   * دریافت تلمتری کامل و زنده سخت‌افزارها، سوییچ‌ها، آپلینک‌ها و نودهای کلاستر
   */
  async getTelemetry(): Promise<SecurityTelemetryPayload> {
    return apiClient.get<SecurityTelemetryPayload>("/security/telemetry");
  },

  /**
   * دریافت لاگ‌های ممیزی سیستم همراه با فیلترها
   */
  async getAuditLogs(params?: GetAuditLogsParams): Promise<SecurityAuditLog[]> {
    return apiClient.get<SecurityAuditLog[]>("/security/audit-logs", {
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },

  /**
   * دریافت لیست نشست‌های فعال ادمین و مدیران
   */
  async getActiveSessions(): Promise<ActiveAdminSessionDto[]> {
    return apiClient.get<ActiveAdminSessionDto[]>("/security/sessions");
  },

  /**
   * ابطال و خروج یک نشست فعال
   */
  async revokeSession(sessionId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(`/security/sessions/${sessionId}`);
  },

  /**
   * صدور فرمان خروج اضطراری کلی و ابطال تمام نشست‌ها
   */
  async emergencyKillSessions(
    payload: EmergencyKillPayload,
  ): Promise<{ success: boolean; revokedCount: number; message: string }> {
    return apiClient.post<{ success: boolean; revokedCount: number; message: string }>(
      "/security/sessions/emergency-kill",
      payload,
    );
  },

  /**
   * تغییر حالت آماده‌باش زیر حمله (Under Attack Mode)
   */
  async toggleUnderAttackMode(enabled: boolean): Promise<WafSecurityStatus> {
    return apiClient.post<WafSecurityStatus>("/security/waf/toggle", { enabled });
  },

  /**
   * مسدودسازی یک آی‌پی در فایروال
   */
  async blockIp(ip: string, reason?: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>("/security/firewall/block-ip", {
      ip,
      reason,
    });
  },
};
