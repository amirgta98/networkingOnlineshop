import { Injectable, Logger, Inject } from '@nestjs/common';
import type {
  IOrderNotificationService,
  AdminOrderNotificationResult,
  AdminNotificationDispatchDetail,
  CustomerOrderNotificationResult,
  OrderShippedNotificationResult,
} from '../../application/services/order-notification.service.interface.js';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface.js';
import type { ISmsProvider } from './sms-provider.interface.js';
import { USER_REPOSITORY_TOKEN, SMS_PROVIDER_TOKEN } from '../../shared/constants/tokens.js';
import type { Order } from '../../domain/entities/order.entity.js';
import { PhoneNumber } from '../../domain/value-objects/phone-number.vo.js';

export const MELIPAYAMAK_ORDER_NOTIFICATION_DEFAULT_BODY_ID = 563237;
export const MELIPAYAMAK_CUSTOMER_ORDER_NOTIFICATION_DEFAULT_BODY_ID = 563239;
export const MELIPAYAMAK_ORDER_SHIPPED_NOTIFICATION_DEFAULT_BODY_ID = 546532;

/**
 * Converts English digits to Persian numerals (۰-۹).
 */
export function toPersianDigits(value: number | string): string {
  const str = String(value);
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[0-9]/g, (w) => persianDigits[parseInt(w, 10)]);
}

/**
 * Formats a monetary amount in Tomans with Persian comma separators (e.g. ۱۰۰،۰۰۰).
 */
export function formatTomanAmount(amount: bigint | number): string {
  const num = typeof amount === 'bigint' ? Number(amount) : amount;
  const safeNum = Number.isFinite(num) ? num : 0;
  return toPersianDigits(safeNum.toLocaleString('en-US')).replace(/,/g, '،');
}

/**
 * Pre-approved Melipayamak Pattern 563237 template (Admin notification).
 */
export const NEW_ORDER_PATTERN_TEMPLATE =
`سفارش جدید ثبت شد!

شماره سفارش: {۰}  
نام مشتری: {۱}  
مبلغ سفارش: {۲} تومان  
شماره تماس: {۳}

لطفاً سفارش را بررسی و برای آماده‌سازی آن اقدام کنید.  
ققنوس آکادمی`;

/**
 * Substitutes pattern parameters into the human-readable text for admin notification.
 */
export function renderOrderPatternText(args: [string, string, string, string]): string {
  return NEW_ORDER_PATTERN_TEMPLATE
    .replace('{۰}', args[0])
    .replace('{0}', args[0])
    .replace('{۱}', args[1])
    .replace('{1}', args[1])
    .replace('{۲}', args[2])
    .replace('{2}', args[2])
    .replace('{۳}', args[3])
    .replace('{3}', args[3]);
}

/**
 * Pre-approved Melipayamak Pattern 563239 template (Customer confirmation).
 */
export const CUSTOMER_ORDER_PATTERN_TEMPLATE =
`مشتری گرامی، سفارش شما با موفقیت ثبت شد و در حال بررسی است.
شماره سفارش: {۰}
فونیکس آکادمی`;

/**
 * Substitutes pattern parameters into the human-readable text for customer confirmation.
 */
export function renderCustomerOrderPatternText(orderNumber: string): string {
  return CUSTOMER_ORDER_PATTERN_TEMPLATE
    .replace('{۰}', orderNumber)
    .replace('{0}', orderNumber);
}

/**
 * Pre-approved Melipayamak Pattern 546532 template (Order Shipped / Courier Handover notification).
 */
export const ORDER_SHIPPED_PATTERN_TEMPLATE =
`مشتری گرامی، سفارش شما آماده و به {۰} تحویل داده شد.
کد سفارش: {۱}
فونیکس آکادمی`;

/**
 * Substitutes pattern parameters into the human-readable text for shipped order notification.
 */
export function renderOrderShippedPatternText(carrier: string, orderNumber: string): string {
  return ORDER_SHIPPED_PATTERN_TEMPLATE
    .replace('{۰}', carrier)
    .replace('{0}', carrier)
    .replace('{۱}', orderNumber)
    .replace('{1}', orderNumber);
}

/**
 * Normalizes carrier code or name into user-friendly Persian company name.
 */
export function formatCarrierName(carrier?: string | null): string {
  if (!carrier || !carrier.trim()) {
    return 'شرکت ملی پست';
  }
  const raw = carrier.trim();
  const lower = raw.toLowerCase();

  const standardMappings: Record<string, string> = {
    tipax: 'شرکت تیپاکس',
    chapar: 'کالارسان چاپار',
    freight: 'شرکت باربری',
    express: 'پیک اختصاصی',
    post: 'شرکت ملی پست',
    pishtaz: 'پست پیشتاز',
  };

  if (standardMappings[lower]) {
    return standardMappings[lower];
  }

  return raw;
}

@Injectable()
export class AdminOrderNotificationService implements IOrderNotificationService {
  private readonly logger = new Logger(AdminOrderNotificationService.name);

  /**
   * Tracks recently notified orders for admins to prevent duplicate SMS dispatches.
   * Keyed by orderId and orderNumber.
   */
  private readonly notifiedOrders = new Set<string>();

  /**
   * Tracks recently notified orders for customers to prevent duplicate confirmation SMS.
   * Keyed by orderId and orderNumber.
   */
  private readonly notifiedCustomerOrders = new Set<string>();

  /**
   * Tracks recently notified orders for shipping handover to prevent duplicate SMS.
   * Keyed by orderId and orderNumber.
   */
  private readonly notifiedShippedOrders = new Set<string>();

  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @Inject(SMS_PROVIDER_TOKEN)
    private readonly smsProvider: ISmsProvider,
  ) {}

  /**
   * Clears the notified orders caches (mainly for test isolation).
   */
  public clearNotifiedCache(): void {
    this.notifiedOrders.clear();
    this.notifiedCustomerOrders.clear();
    this.notifiedShippedOrders.clear();
  }

  async notifyAdminsOfNewOrder(order: Order): Promise<AdminOrderNotificationResult> {
    if (!order) {
      this.logger.warn('[OrderNotification] Null or undefined order provided. Skipping notification.');
      return {
        orderId: '',
        orderNumber: '',
        totalAdmins: 0,
        successfulCount: 0,
        failedCount: 0,
        skipped: true,
        reason: 'invalid_order',
      };
    }

    // 1. Idempotency Check: Prevent duplicate notifications for the same order
    const orderKey = order.id || order.orderNumber;
    if (this.notifiedOrders.has(orderKey) || this.notifiedOrders.has(order.orderNumber)) {
      this.logger.warn(
        `[OrderNotification] Notification already processed for order ${order.orderNumber}. Skipping duplicate dispatch.`,
      );
      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        totalAdmins: 0,
        successfulCount: 0,
        failedCount: 0,
        skipped: true,
        reason: 'duplicate',
      };
    }

    // Mark order as notified immediately to guard against concurrent duplicates
    this.notifiedOrders.add(orderKey);
    if (order.orderNumber) {
      this.notifiedOrders.add(order.orderNumber);
    }

    // Keep bounded cache to prevent memory leak (retains up to 5,000 recent orders)
    if (this.notifiedOrders.size > 5000) {
      const iterator = this.notifiedOrders.values();
      for (let i = 0; i < 1000; i++) {
        const next = iterator.next();
        if (next.done) break;
        this.notifiedOrders.delete(next.value);
      }
    }

    // 2. Discover active, eligible admins dynamically from the database
    let candidateAdmins = [];
    try {
      candidateAdmins = await this.userRepository.findAll({ role: 'admin' });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `[OrderNotification] Failed to query administrators from database: ${errorMsg}`,
      );
      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        totalAdmins: 0,
        successfulCount: 0,
        failedCount: 0,
        reason: 'database_query_error',
      };
    }

    // Filter active administrators
    const activeAdmins = candidateAdmins.filter((admin) => {
      const isActive = admin.isActive !== false;
      const statusActive = !admin.status || admin.status.toUpperCase() === 'ACTIVE';
      return isActive && statusActive;
    });

    // 3. Validate mobile numbers and deduplicate across administrators
    const seenPhones = new Set<string>();
    const eligibleAdmins: Array<{ adminId: string; adminName: string; phone: string }> = [];

    for (const admin of activeAdmins) {
      const rawPhone = admin.phone
        ? typeof admin.phone === 'string'
          ? admin.phone
          : admin.phone.value
        : '';

      if (!rawPhone || !PhoneNumber.isValid(rawPhone)) {
        this.logger.warn(
          `[OrderNotification] Admin ${admin.name} (ID: ${admin.id}) has invalid or missing mobile number. Skipping.`,
        );
        continue;
      }

      const normalized = PhoneNumber.normalize(rawPhone);
      if (seenPhones.has(normalized)) {
        const masked = `${normalized.substring(0, 4)}***${normalized.substring(7)}`;
        this.logger.warn(
          `[OrderNotification] Duplicate mobile number ${masked} found for admin ${admin.name}. Skipping to prevent duplicate SMS.`,
        );
        continue;
      }

      seenPhones.add(normalized);
      eligibleAdmins.push({
        adminId: admin.id,
        adminName: admin.name,
        phone: normalized,
      });
    }

    if (eligibleAdmins.length === 0) {
      this.logger.warn(
        `[OrderNotification] No active admins with valid mobile numbers found for order ${order.orderNumber}. Notification aborted.`,
      );
      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        totalAdmins: 0,
        successfulCount: 0,
        failedCount: 0,
        reason: 'no_eligible_admins',
      };
    }

    // 4. Prepare Melipayamak Pattern 563237 parameters
    const rawPatternId = Number(process.env.MELIPAYAMAK_ORDER_PATTERN_ID);
    const patternId =
      Number.isFinite(rawPatternId) && rawPatternId > 0
        ? rawPatternId
        : MELIPAYAMAK_ORDER_NOTIFICATION_DEFAULT_BODY_ID;

    // Pattern Variables:
    // {0} = Order Number
    // {1} = Customer Full Name
    // {2} = Payable Order Amount in Tomans (formatted with thousands separator)
    // {3} = Customer Phone Number
    const rawCustomerPhone = order.phoneNumber ? PhoneNumber.normalize(order.phoneNumber) : '';
    const args: [string, string, string, string] = [
      toPersianDigits(order.orderNumber || ''),
      (order.customerName || 'مشتری').trim(),
      formatTomanAmount(order.payableAmount ?? 0),
      rawCustomerPhone ? toPersianDigits(rawCustomerPhone) : 'نامشخص',
    ];

    const renderedText = renderOrderPatternText(args);

    this.logger.log(
      `[OrderNotification] Dispatching order notification for ${order.orderNumber} to ${eligibleAdmins.length} active admin(s)...`,
    );

    // 5. Send notification concurrently to all eligible admins (Promise.allSettled)
    const dispatchDetails: AdminNotificationDispatchDetail[] = [];

    const dispatchPromises = eligibleAdmins.map(async (admin) => {
      const maskedPhone = `${admin.phone.substring(0, 4)}***${admin.phone.substring(7)}`;
      try {
        if (typeof this.smsProvider.sendPattern !== 'function') {
          const errMsg = 'The configured SMS provider does not support pattern dispatch.';
          this.logger.error(`[OrderNotification] ${errMsg}`);
          return {
            adminId: admin.adminId,
            adminName: admin.adminName,
            phone: admin.phone,
            success: false,
            errorMessage: errMsg,
          };
        }

        const result = await this.smsProvider.sendPattern(admin.phone, patternId, args, {
          title: 'اطلاع‌رسانی ثبت سفارش جدید',
          renderedText,
          orderNumber: order.orderNumber,
          customerName: args[1],
          adminName: admin.adminName,
        });

        if (result.success) {
          this.logger.log(
            `[OrderNotification] SMS successfully dispatched to admin ${admin.adminName} (${maskedPhone}) for order ${order.orderNumber}. RefId: ${result.messageId ?? 'N/A'}`,
          );
          return {
            adminId: admin.adminId,
            adminName: admin.adminName,
            phone: admin.phone,
            success: true,
            messageId: result.messageId,
          };
        } else {
          this.logger.error(
            `[OrderNotification] SMS dispatch failed for admin ${admin.adminName} (${maskedPhone}) for order ${order.orderNumber}: ${result.errorMessage ?? 'Unknown error'}`,
          );
          return {
            adminId: admin.adminId,
            adminName: admin.adminName,
            phone: admin.phone,
            success: false,
            errorMessage: result.errorMessage,
          };
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        this.logger.error(
          `[OrderNotification] Unexpected exception dispatching SMS to admin ${admin.adminName} (${maskedPhone}) for order ${order.orderNumber}: ${errorMsg}`,
        );
        return {
          adminId: admin.adminId,
          adminName: admin.adminName,
          phone: admin.phone,
          success: false,
          errorMessage: errorMsg,
        };
      }
    });

    const settledResults = await Promise.allSettled(dispatchPromises);
    let successfulCount = 0;
    let failedCount = 0;

    for (const settled of settledResults) {
      if (settled.status === 'fulfilled') {
        dispatchDetails.push(settled.value);
        if (settled.value.success) {
          successfulCount++;
        } else {
          failedCount++;
        }
      } else {
        failedCount++;
        dispatchDetails.push({
          adminId: 'unknown',
          adminName: 'unknown',
          phone: '',
          success: false,
          errorMessage: settled.reason instanceof Error ? settled.reason.message : String(settled.reason),
        });
      }
    }

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalAdmins: eligibleAdmins.length,
      successfulCount,
      failedCount,
      details: dispatchDetails,
    };
  }

  async notifyCustomerOfNewOrder(
    order: Order,
    customerPhone?: string,
  ): Promise<CustomerOrderNotificationResult> {
    if (!order) {
      this.logger.warn('[CustomerOrderNotification] Null or undefined order provided. Skipping notification.');
      return {
        orderId: '',
        orderNumber: '',
        customerPhone: '',
        success: false,
        skipped: true,
        reason: 'invalid_order',
      };
    }

    // 1. Idempotency Check: Prevent duplicate confirmation SMS dispatches for the same order
    const orderKey = order.id || order.orderNumber;
    if (this.notifiedCustomerOrders.has(orderKey) || this.notifiedCustomerOrders.has(order.orderNumber)) {
      this.logger.warn(
        `[CustomerOrderNotification] Confirmation SMS already processed for order ${order.orderNumber}. Skipping duplicate dispatch.`,
      );
      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerPhone: customerPhone || order.phoneNumber,
        success: false,
        skipped: true,
        reason: 'duplicate',
      };
    }

    // Mark customer order as notified immediately to guard against concurrent duplicates
    this.notifiedCustomerOrders.add(orderKey);
    if (order.orderNumber) {
      this.notifiedCustomerOrders.add(order.orderNumber);
    }

    // Keep bounded cache to prevent memory leak (retains up to 5,000 recent orders)
    if (this.notifiedCustomerOrders.size > 5000) {
      const iterator = this.notifiedCustomerOrders.values();
      for (let i = 0; i < 1000; i++) {
        const next = iterator.next();
        if (next.done) break;
        this.notifiedCustomerOrders.delete(next.value);
      }
    }

    // 2. Resolve and validate recipient phone number
    // Priority:
    //   1) Authenticated customer profile phone (login phone)
    //   2) Order contact phone
    //   3) Shipping address phone
    const candidatePhone = (
      customerPhone ||
      order.phoneNumber ||
      order.shippingAddress?.phoneNumber ||
      ''
    ).trim();

    if (!candidatePhone || !PhoneNumber.isValid(candidatePhone)) {
      this.logger.warn(
        `[CustomerOrderNotification] Order ${order.orderNumber} has no valid customer mobile number (input: '${candidatePhone}'). Skipping confirmation SMS.`,
      );
      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerPhone: candidatePhone,
        success: false,
        skipped: true,
        reason: 'invalid_or_missing_customer_phone',
      };
    }

    const normalizedPhone = PhoneNumber.normalize(candidatePhone);
    const maskedPhone = `${normalizedPhone.substring(0, 4)}***${normalizedPhone.substring(7)}`;

    // 3. Prepare Melipayamak Pattern 563239 parameters
    const rawPatternId = Number(process.env.MELIPAYAMAK_CUSTOMER_ORDER_PATTERN_ID);
    const patternId =
      Number.isFinite(rawPatternId) && rawPatternId > 0
        ? rawPatternId
        : MELIPAYAMAK_CUSTOMER_ORDER_NOTIFICATION_DEFAULT_BODY_ID;

    // Pattern Variable:
    // {0} = Order Number (in Persian digits)
    const persianOrderNumber = toPersianDigits(order.orderNumber || '');
    const args: [string] = [persianOrderNumber];
    const renderedText = renderCustomerOrderPatternText(persianOrderNumber);

    this.logger.log(
      `[CustomerOrderNotification] Dispatching order confirmation SMS to customer (${maskedPhone}) for order ${order.orderNumber}...`,
    );

    // 4. Send notification via configured SMS provider
    try {
      if (typeof this.smsProvider.sendPattern !== 'function') {
        const errMsg = 'The configured SMS provider does not support pattern dispatch.';
        this.logger.error(`[CustomerOrderNotification] ${errMsg}`);
        return {
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerPhone: normalizedPhone,
          success: false,
          errorMessage: errMsg,
        };
      }

      const result = await this.smsProvider.sendPattern(normalizedPhone, patternId, args, {
        title: 'تایید ثبت سفارش برای مشتری',
        renderedText,
        recipientLabel: 'مشتری (شماره لاگین)',
        orderNumber: order.orderNumber,
        customerName: order.customerName,
      });

      if (result.success) {
        this.logger.log(
          `[CustomerOrderNotification] Confirmation SMS successfully dispatched to customer (${maskedPhone}) for order ${order.orderNumber}. RefId: ${result.messageId ?? 'N/A'}`,
        );
        return {
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerPhone: normalizedPhone,
          success: true,
          messageId: result.messageId,
        };
      } else {
        this.logger.error(
          `[CustomerOrderNotification] Confirmation SMS failed for customer (${maskedPhone}) for order ${order.orderNumber}: ${result.errorMessage ?? 'Unknown error'}`,
        );
        return {
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerPhone: normalizedPhone,
          success: false,
          errorMessage: result.errorMessage,
        };
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `[CustomerOrderNotification] Unexpected exception dispatching SMS to customer (${maskedPhone}) for order ${order.orderNumber}: ${errorMsg}`,
      );
      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerPhone: normalizedPhone,
        success: false,
        errorMessage: errorMsg,
      };
    }
  }

  async notifyCustomerOfOrderShipped(
    order: Order,
    carrier?: string,
    customerPhone?: string,
  ): Promise<OrderShippedNotificationResult> {
    const formattedCarrier = formatCarrierName(carrier || order?.shippingCarrier);

    if (!order) {
      this.logger.warn('[OrderShippedNotification] Null or undefined order provided. Skipping notification.');
      return {
        orderId: '',
        orderNumber: '',
        carrier: formattedCarrier,
        success: false,
        skipped: true,
        reason: 'invalid_order',
      };
    }

    // 1. Idempotency Check: Prevent duplicate shipping SMS dispatches for the same order
    const orderKey = order.id || order.orderNumber;
    if (this.notifiedShippedOrders.has(orderKey) || this.notifiedShippedOrders.has(order.orderNumber)) {
      this.logger.warn(
        `[OrderShippedNotification] Shipping SMS already processed for order ${order.orderNumber}. Skipping duplicate dispatch.`,
      );
      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerPhone: customerPhone || order.phoneNumber,
        carrier: formattedCarrier,
        success: false,
        skipped: true,
        reason: 'duplicate',
      };
    }

    // Mark as notified immediately
    this.notifiedShippedOrders.add(orderKey);
    if (order.orderNumber) {
      this.notifiedShippedOrders.add(order.orderNumber);
    }

    // Keep bounded cache to prevent memory leak (retains up to 5,000 recent orders)
    if (this.notifiedShippedOrders.size > 5000) {
      const iterator = this.notifiedShippedOrders.values();
      for (let i = 0; i < 1000; i++) {
        const next = iterator.next();
        if (next.done) break;
        this.notifiedShippedOrders.delete(next.value);
      }
    }

    // 2. Resolve recipient mobile number
    // Priority:
    //   1) Explicit customerPhone argument
    //   2) Authenticated user login phone from database (via order.userId)
    //   3) Order contact phone / Shipping address phone
    let candidatePhone = customerPhone?.trim();

    if (!candidatePhone && order.userId) {
      try {
        const user = await this.userRepository.findById(order.userId);
        if (user?.phone) {
          candidatePhone = typeof user.phone === 'string' ? user.phone : user.phone.value;
        }
      } catch (err: unknown) {
        this.logger.warn(
          `[OrderShippedNotification] Unable to query user profile for customer phone: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
    }

    if (!candidatePhone) {
      candidatePhone = (order.phoneNumber || order.shippingAddress?.phoneNumber || '').trim();
    }

    if (!candidatePhone || !PhoneNumber.isValid(candidatePhone)) {
      this.logger.warn(
        `[OrderShippedNotification] Order ${order.orderNumber} has no valid customer mobile number (input: '${candidatePhone}'). Skipping shipping SMS.`,
      );
      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerPhone: candidatePhone,
        carrier: formattedCarrier,
        success: false,
        skipped: true,
        reason: 'invalid_or_missing_customer_phone',
      };
    }

    const normalizedPhone = PhoneNumber.normalize(candidatePhone);
    const maskedPhone = `${normalizedPhone.substring(0, 4)}***${normalizedPhone.substring(7)}`;

    // 3. Prepare Melipayamak Pattern 546532 parameters
    const rawPatternId = Number(process.env.MELIPAYAMAK_ORDER_SHIPPED_PATTERN_ID);
    const patternId =
      Number.isFinite(rawPatternId) && rawPatternId > 0
        ? rawPatternId
        : MELIPAYAMAK_ORDER_SHIPPED_NOTIFICATION_DEFAULT_BODY_ID;

    // Pattern Variables:
    // {0} = Carrier / Logistics Company Name
    // {1} = Order Code / Number (in Persian digits)
    const persianOrderNumber = toPersianDigits(order.orderNumber || '');
    const args: [string, string] = [formattedCarrier, persianOrderNumber];
    const renderedText = renderOrderShippedPatternText(formattedCarrier, persianOrderNumber);

    this.logger.log(
      `[OrderShippedNotification] Dispatching shipping SMS to customer (${maskedPhone}) for order ${order.orderNumber} (Carrier: ${formattedCarrier})...`,
    );

    // 4. Send notification via configured SMS provider
    try {
      if (typeof this.smsProvider.sendPattern !== 'function') {
        const errMsg = 'The configured SMS provider does not support pattern dispatch.';
        this.logger.error(`[OrderShippedNotification] ${errMsg}`);
        return {
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerPhone: normalizedPhone,
          carrier: formattedCarrier,
          success: false,
          errorMessage: errMsg,
        };
      }

      const result = await this.smsProvider.sendPattern(normalizedPhone, patternId, args, {
        title: 'تحویل سفارش به پست و باربری',
        renderedText,
        recipientLabel: 'مشتری (شماره لاگین)',
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        carrier: formattedCarrier,
      });

      if (result.success) {
        this.logger.log(
          `[OrderShippedNotification] Shipping SMS successfully dispatched to customer (${maskedPhone}) for order ${order.orderNumber}. RefId: ${result.messageId ?? 'N/A'}`,
        );
        return {
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerPhone: normalizedPhone,
          carrier: formattedCarrier,
          success: true,
          messageId: result.messageId,
        };
      } else {
        this.logger.error(
          `[OrderShippedNotification] Shipping SMS failed for customer (${maskedPhone}) for order ${order.orderNumber}: ${result.errorMessage ?? 'Unknown error'}`,
        );
        return {
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerPhone: normalizedPhone,
          carrier: formattedCarrier,
          success: false,
          errorMessage: result.errorMessage,
        };
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `[OrderShippedNotification] Unexpected exception dispatching shipping SMS to customer (${maskedPhone}) for order ${order.orderNumber}: ${errorMsg}`,
      );
      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerPhone: normalizedPhone,
        carrier: formattedCarrier,
        success: false,
        errorMessage: errorMsg,
      };
    }
  }
}
