import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service.js';
import { SiteContactSettingsDto } from '../../dto/site-settings/site-contact-settings.dto.js';

export const DEFAULT_SITE_CONTACT_SETTINGS = {
  id: 'default',
  recruitmentTelegram: '@ghoghnoos_academy',
  recruitmentPhone: '09134761097',
  recruitmentEmail: 'careers@ghoghnoos.academy',
  mainPhone: '09134761097',
  supportPhone1: '09224761097',
  supportPhone2: '09354761097',
  emergencyPhone: '09004761097',
  generalEmail: 'info@ghoghnoos.academy',
  whatsappNumber: '09134761097',
  instagramUrl: 'https://instagram.com/ghoghnoos_academy',
  linkedinUrl: 'https://linkedin.com/company/ghoghnoos-academy',
  youtubeUrl: 'https://youtube.com/@ghoghnoos_academy',
  aparatUrl: 'https://aparat.com/ghoghnoos_academy',
  telegramChannelUrl: 'https://t.me/ghoghnoos_academy',
  address: 'تهران، خیابان ولیعصر، بالاتر از تقاطع میرداماد، مجتمع تجاری و اداری پایتخت، برج شماره ۲، طبقه ۷، واحد ۷۰۴',
  postalCode: '1969764321',
  googleMapsUrl: 'https://maps.google.com/?q=35.7592,51.4116',
  neshanUrl: 'https://neshan.org/maps/@35.7592,51.4116,16z',
  baladUrl: 'https://balad.ir/location?latitude=35.7592&longitude=51.4116',
};

@Injectable()
export class SiteSettingsService {
  private readonly logger = new Logger(SiteSettingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves current site contact and social settings (Singleton).
   * If not yet seeded in the database, automatically creates and returns the default config.
   */
  async getContactSettings() {
    try {
      let settings = await this.prisma.siteContactSettings.findUnique({
        where: { id: 'default' },
      });

      if (!settings) {
        this.logger.log('SiteContactSettings not found, creating initial default record...');
        settings = await this.prisma.siteContactSettings.create({
          data: DEFAULT_SITE_CONTACT_SETTINGS,
        });
      }

      return settings;
    } catch (error) {
      this.logger.error('Error fetching site contact settings:', error);
      // Fallback in case of database connectivity glitch
      return {
        ...DEFAULT_SITE_CONTACT_SETTINGS,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  }

  /**
   * Updates or creates the singleton site contact settings.
   */
  async updateContactSettings(dto: SiteContactSettingsDto) {
    // Sanitize values
    const dataToUpdate: Record<string, string | null | undefined> = {};

    const fields: (keyof SiteContactSettingsDto)[] = [
      'recruitmentTelegram',
      'recruitmentPhone',
      'recruitmentEmail',
      'mainPhone',
      'supportPhone1',
      'supportPhone2',
      'emergencyPhone',
      'generalEmail',
      'whatsappNumber',
      'instagramUrl',
      'linkedinUrl',
      'youtubeUrl',
      'aparatUrl',
      'telegramChannelUrl',
      'address',
      'postalCode',
      'googleMapsUrl',
      'neshanUrl',
      'baladUrl',
    ];

    for (const field of fields) {
      if (dto[field] !== undefined) {
        dataToUpdate[field] = dto[field];
      }
    }

    const updated = await this.prisma.siteContactSettings.upsert({
      where: { id: 'default' },
      update: dataToUpdate,
      create: {
        ...DEFAULT_SITE_CONTACT_SETTINGS,
        ...dataToUpdate,
      },
    });

    this.logger.log('SiteContactSettings successfully updated by admin');
    return updated;
  }
}
