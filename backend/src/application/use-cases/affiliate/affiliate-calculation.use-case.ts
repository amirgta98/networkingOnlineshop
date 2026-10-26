import type { IAffiliateRepository } from '../../../domain/repositories/affiliate.repository.interface.js';
import type { AffiliatePartnerEntity, AffiliateSettingsEntity } from '../../../domain/entities/affiliate.entity.js';

export interface ProductDiscountCheckInput {
  productId?: string;
  categoryId?: string;
  sku?: string;
  title?: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  hasTieredDiscount?: boolean;
}

export class AffiliateCalculationService {
  constructor(private readonly affiliateRepository: IAffiliateRepository) {}

  /**
   * Helper to check if a product item is Static IP or Internet
   */
  isStaticIp(sku?: string, title?: string): boolean {
    const s = (sku || '').toLowerCase();
    const t = (title || '').toLowerCase();
    return s.includes('static_ip') || s.includes('ip_static') || s.startsWith('ip-') || t.includes('ip استاتیک') || t.includes('آی پی استاتیک') || t.includes('آی‌پی استاتیک') || t.includes('static ip');
  }

  isInternet(sku?: string, title?: string): boolean {
    const s = (sku || '').toLowerCase();
    const t = (title || '').toLowerCase();
    return (
      s.includes('internet') ||
      s.includes('ftth') ||
      s.includes('vdsl') ||
      s.includes('adsl') ||
      s.includes('isp') ||
      s.startsWith('int-') ||
      t.includes('اینترنت') ||
      t.includes('پهنای باند') ||
      t.includes('فیبر نوری')
    );
  }

  /**
   * Evaluates if an item qualifies for affiliate product discount,
   * strictly adhering to priority rules:
   * 1. Check if affiliate discount enabled globally & for partner
   * 2. Internet and Static IP items NEVER get affiliate discount (they get commission)
   * 3. If product has standard discount (originalPrice > price or discountPercent > 0) -> NO affiliate discount
   * 4. If product has tiered discount -> NO affiliate discount
   * 5. If eligible -> return effective discount percent
   */
  async evaluateProductAffiliateDiscount(
    item: ProductDiscountCheckInput,
    partner: AffiliatePartnerEntity | null,
    settings?: AffiliateSettingsEntity,
  ): Promise<{
    isEligible: boolean;
    discountPercent: number;
    discountAmount: number;
    unitPriceAfterDiscount: number;
    reason?: string;
  }> {
    const config = settings || (await this.affiliateRepository.getSettings());

    // System disabled
    if (!config.isAffiliateSystemEnabled || !config.isProductDiscountEnabled) {
      return { isEligible: false, discountPercent: 0, discountAmount: 0, unitPriceAfterDiscount: item.price, reason: 'سیستم تخفیف همکاری غیرفعال است.' };
    }

    // Partner checks
    if (!partner || partner.status !== 'ACTIVE' || !partner.isDiscountEnabled) {
      return { isEligible: false, discountPercent: 0, discountAmount: 0, unitPriceAfterDiscount: item.price, reason: 'همکار فعال نبوده یا تخفیف وی غیرفعال است.' };
    }

    // Internet and Static IP never receive affiliate discount
    if (this.isStaticIp(item.sku, item.title) || this.isInternet(item.sku, item.title)) {
      return { isEligible: false, discountPercent: 0, discountAmount: 0, unitPriceAfterDiscount: item.price, reason: 'محصولات اینترنت و IP استاتیک مشمول پورسانت بوده و تخفیف همکاری ندارند.' };
    }

    // Check category/product filter restrictions
    const hasProductWhitelist = Boolean(config.eligibleProductIds && config.eligibleProductIds.length > 0);
    const hasCategoryWhitelist = Boolean(config.eligibleCategoryIds && config.eligibleCategoryIds.length > 0);

    if (hasProductWhitelist || hasCategoryWhitelist) {
      let matchesProduct = false;
      let matchesCategory = false;

      if (hasProductWhitelist && item.productId) {
        matchesProduct = config.eligibleProductIds.includes(item.productId);
      }
      if (hasCategoryWhitelist && item.categoryId) {
        matchesCategory = config.eligibleCategoryIds.some(
          (c) => c.toLowerCase() === (item.categoryId || '').toLowerCase()
        );
      }

      const isWhitelisted =
        (hasProductWhitelist && hasCategoryWhitelist && (matchesProduct || matchesCategory)) ||
        (hasProductWhitelist && !hasCategoryWhitelist && matchesProduct) ||
        (!hasProductWhitelist && hasCategoryWhitelist && matchesCategory);

      if (!isWhitelisted) {
        return {
          isEligible: false,
          discountPercent: 0,
          discountAmount: 0,
          unitPriceAfterDiscount: item.price,
          reason: 'محصول یا دسته‌بندی در لیست مشمولین تخفیف همکاری نیست.',
        };
      }
    }

    // Rule 2 & 4: Normal discount check
    const hasNormalDiscount =
      (item.discountPercent !== undefined && item.discountPercent > 0) ||
      (item.originalPrice !== undefined && item.originalPrice > item.price);
    if (hasNormalDiscount) {
      return { isEligible: false, discountPercent: 0, discountAmount: 0, unitPriceAfterDiscount: item.price, reason: 'محصول دارای تخفیف عادی است و با تخفیف همکاری ترکیب نمی‌شود.' };
    }

    // Rule 3 & 4: Stepped / Tiered discount check
    if (item.hasTieredDiscount) {
      return { isEligible: false, discountPercent: 0, discountAmount: 0, unitPriceAfterDiscount: item.price, reason: 'محصول دارای تخفیف پلکانی است و با تخفیف همکاری ترکیب نمی‌شود.' };
    }

    // Rule 5: Eligible! Apply partner discount percent (custom if defined, otherwise global default)
    const discountPercent = partner.getEffectiveDiscountPercent(config.defaultDiscountPercent);
    const discountAmount = Math.round((item.price * discountPercent) / 100);
    const unitPriceAfterDiscount = Math.max(0, item.price - discountAmount);

    return {
      isEligible: true,
      discountPercent,
      discountAmount,
      unitPriceAfterDiscount,
    };
  }

  /**
   * Processes commission generation for an order placed by / attributed to a partner.
   * Prevents duplicates by verifying existing order commissions.
   */
  async processOrderCommissions(
    order: {
      id: string;
      orderNumber: string;
      payableAmount: number;
      items: Array<{
        sku?: string;
        title?: string;
        quantity: number;
        unitPrice: number;
      }>;
    },
    partnerId: string,
  ): Promise<number> {
    const partner = await this.affiliateRepository.findPartnerById(partnerId);
    if (!partner || partner.status !== 'ACTIVE' || !partner.isCommissionEnabled) {
      return 0;
    }

    const settings = await this.affiliateRepository.getSettings();
    if (!settings.isAffiliateSystemEnabled) {
      return 0;
    }

    // Idempotency check: don't recreate commissions if this order has already generated commissions
    const existingCommissions = await this.affiliateRepository.findCommissions({ orderId: order.id });
    if (existingCommissions && existingCommissions.total > 0) {
      return 0;
    }

    let totalGeneratedCommission = 0;

    for (const item of order.items) {
      const isIp = this.isStaticIp(item.sku, item.title);
      const isNet = this.isInternet(item.sku, item.title);

      if (!isIp && !isNet) {
        continue;
      }

      if (isIp && settings.isStaticIpCommissionEnabled) {
        const unitCommission = partner.getEffectiveStaticIpCommission(settings.defaultStaticIpCommission);
        const totalCommission = unitCommission * item.quantity;
        await this.affiliateRepository.createCommission({
          partnerId: partner.id,
          orderId: order.id,
          orderNumber: order.orderNumber,
          productType: 'STATIC_IP',
          productTitle: item.title || 'IP استاتیک اختصاصی',
          quantity: item.quantity,
          unitCommission,
          totalCommission,
          status: 'PENDING',
          notes: `پورسانت ${item.quantity} عدد IP استاتیک (سفارش ${order.orderNumber})`,
          partnerName: partner.user?.name,
        });
        totalGeneratedCommission += totalCommission;
      } else if (isNet && settings.isInternetCommissionEnabled) {
        const unitCommission = partner.getEffectiveInternetCommission(settings.defaultInternetCommission);
        const totalCommission = unitCommission * item.quantity;
        await this.affiliateRepository.createCommission({
          partnerId: partner.id,
          orderId: order.id,
          orderNumber: order.orderNumber,
          productType: 'INTERNET',
          productTitle: item.title || 'سرویس اینترنت سازمانی',
          quantity: item.quantity,
          unitCommission,
          totalCommission,
          status: 'PENDING',
          notes: `پورسانت ${item.quantity} سرویس اینترنت (سفارش ${order.orderNumber})`,
          partnerName: partner.user?.name,
        });
        totalGeneratedCommission += totalCommission;
      }
    }

    // Update partner sales and orders count ONCE per order
    await this.affiliateRepository.updatePartner(partner.id, {
      totalSales: partner.totalSales + order.payableAmount,
      totalOrders: partner.totalOrders + 1,
    });

    return totalGeneratedCommission;
  }
}
