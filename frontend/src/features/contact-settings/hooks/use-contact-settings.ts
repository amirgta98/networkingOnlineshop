"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contactSettingsApi } from "../api/contact-settings-api";
import type { SiteContactSettings, UpdateSiteContactSettingsDto } from "../types";

export const DEFAULT_CONTACT_SETTINGS: SiteContactSettings = {
  id: "default",
  recruitmentTelegram: "@ghoghnoos_academy",
  recruitmentPhone: "09134761097",
  recruitmentEmail: "careers@ghoghnoos.academy",
  mainPhone: "09134761097",
  supportPhone1: "09224761097",
  supportPhone2: "09354761097",
  emergencyPhone: "09004761097",
  generalEmail: "info@ghoghnoos.academy",
  whatsappNumber: "09134761097",
  instagramUrl: "https://instagram.com/ghoghnoos_academy",
  linkedinUrl: "https://linkedin.com/company/ghoghnoos-academy",
  youtubeUrl: "https://youtube.com/@ghoghnoos_academy",
  aparatUrl: "https://aparat.com/ghoghnoos_academy",
  telegramChannelUrl: "https://t.me/ghoghnoos_academy",
  address:
    "تهران، خیابان ولیعصر، بالاتر از تقاطع میرداماد، مجتمع تجاری و اداری پایتخت، برج شماره ۲، طبقه ۷، واحد ۷۰۴",
  postalCode: "۱۹۶۹۷۶۴۳۲۱",
  googleMapsUrl: "https://maps.google.com/?q=35.7592,51.4116",
  neshanUrl: "https://neshan.org/maps/@35.7592,51.4116,16z",
  baladUrl: "https://balad.ir/location?latitude=35.7592&longitude=51.4116",
};

export const CONTACT_SETTINGS_QUERY_KEY = ["site-contact-settings"] as const;

export function useContactSettings() {
  const query = useQuery<SiteContactSettings>({
    queryKey: CONTACT_SETTINGS_QUERY_KEY,
    queryFn: async () => {
      try {
        const res = await contactSettingsApi.getContactSettings();
        return {
          ...DEFAULT_CONTACT_SETTINGS,
          ...(res || {}),
        };
      } catch (err) {
        console.warn(
          "Could not fetch remote contact settings, using fallback defaults:",
          err,
        );
        return DEFAULT_CONTACT_SETTINGS;
      }
    },
    initialData: DEFAULT_CONTACT_SETTINGS,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
  });

  return {
    settings: query.data || DEFAULT_CONTACT_SETTINGS,
    ...query,
  };
}

export function useUpdateContactSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateSiteContactSettingsDto) =>
      contactSettingsApi.updateContactSettings(dto),
    onSuccess: (updated) => {
      queryClient.setQueryData(CONTACT_SETTINGS_QUERY_KEY, updated);
      queryClient.invalidateQueries({ queryKey: CONTACT_SETTINGS_QUERY_KEY });
    },
  });
}
