import { apiClient } from "@/shared/lib/api-client";
import type { SiteContactSettings, UpdateSiteContactSettingsDto } from "../types";

export const contactSettingsApi = {
  /**
   * Retrieves public contact, phone, messenger and address settings
   */
  async getContactSettings(): Promise<SiteContactSettings> {
    return apiClient.get<SiteContactSettings>("/site-settings/contact");
  },

  /**
   * Updates site contact settings (Admin only)
   */
  async updateContactSettings(
    dto: UpdateSiteContactSettingsDto,
  ): Promise<SiteContactSettings> {
    return apiClient.put<SiteContactSettings>("/admin/site-settings/contact", dto);
  },
};
