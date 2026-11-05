export interface SiteContactSettings {
  id: string;
  recruitmentTelegram: string;
  recruitmentPhone: string;
  recruitmentEmail: string;
  mainPhone: string;
  supportPhone1: string;
  supportPhone2: string;
  emergencyPhone: string;
  generalEmail: string;
  whatsappNumber: string;
  instagramUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  aparatUrl: string;
  telegramChannelUrl: string;
  address: string;
  postalCode: string;
  googleMapsUrl: string;
  neshanUrl: string;
  baladUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export type UpdateSiteContactSettingsDto = Partial<Omit<SiteContactSettings, "id" | "createdAt" | "updatedAt">>;
