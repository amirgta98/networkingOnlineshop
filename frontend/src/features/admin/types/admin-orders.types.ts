/**
 * Velox Network Hardware Admin Panel - Orders & Shipment Management Types
 */

export type AdminOrderStatus =
  | "all"
  | "pending_financial" // در انتظار تایید مالی
  | "processing_warehouse" // پردازش و بسته‌بندی انبار
  | "shipping" // تحویل به ناوگان ارسال
  | "delivered" // تحویل موفق
  | "cancelled"; // لغو شده

export type AdminCustomerType = "b2b" | "retail";

export type AdminShippingCarrier = "tipax" | "chapar" | "freight" | "express";

export type AdminPaymentMethod =
  | "bank_transfer_satna" // حواله بانکی ساتنا / پایا
  | "credit_line_b2b" // اعتبار اسنادی و چک صیادی
  | "online_gateway"; // درگاه شاپرک

export interface AdminOrderItem {
  id: string;
  sku: string;
  title: string;
  model: string;
  brand: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  serialNumbers?: string[];
  warranty: string;
}

export interface AdminShippingAddress {
  city: string;
  province: string;
  fullAddress: string;
  postalCode: string;
  recipientName: string;
  recipientPhone: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string; // e.g. "VX-9421"
  trackingCode: string; // شناسه یکتای پیگیری
  customerName: string;
  customerType: AdminCustomerType;
  companyName?: string;
  nationalCode?: string; // شناسه ملی / کد اقتصادی
  phoneNumber: string;
  createdAt: string; // e.g. "۱۴۰۳/۰۸/۲۲ - ۱۰:۳۰"
  status: Exclude<AdminOrderStatus, "all">;
  statusLabel: string;
  totalAmount: number; // جمع اولیه بدون تخفیف و مالیات
  discountAmount: number; // تخفیف سازمانی / همکاری
  vatTaxAmount: number; // ۱۰٪ مالیات بر ارزش افزوده
  payableAmount: number; // مبلغ نهایی قابل پرداخت
  paymentMethod: AdminPaymentMethod;
  paymentReceiptNumber?: string; // شماره پیگیری فیش بانکی / پایا
  paymentReceiptUrl?: string;
  isPaymentVerified: boolean;
  carrier?: AdminShippingCarrier;
  carrierName?: string;
  carrierTrackingCode?: string; // شماره بارنامه
  carrierTrackingUrl?: string;
  shippingAddress: AdminShippingAddress;
  items: AdminOrderItem[];
  adminNotes?: string;
}

export interface StatusMeta {
  label: string;
  badgeVariant: "default" | "orange" | "emerald" | "sky" | "purple" | "rose";
  chipClass: string;
  dotClass: string;
}

export const ORDER_STATUS_CONFIG: Record<Exclude<AdminOrderStatus, "all">, StatusMeta> = {
  pending_financial: {
    label: "در انتظار تایید مالی",
    badgeVariant: "rose",
    chipClass: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    dotClass: "bg-rose-400",
  },
  processing_warehouse: {
    label: "بسته‌بندی و انبار",
    badgeVariant: "orange",
    chipClass: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    dotClass: "bg-orange-400",
  },
  shipping: {
    label: "ناوگان ارسال",
    badgeVariant: "sky",
    chipClass: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    dotClass: "bg-sky-400",
  },
  delivered: {
    label: "تحویل موفق",
    badgeVariant: "emerald",
    chipClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dotClass: "bg-emerald-400",
  },
  cancelled: {
    label: "لغو شده",
    badgeVariant: "default",
    chipClass: "bg-neutral-800 text-neutral-400 border-neutral-700",
    dotClass: "bg-neutral-400",
  },
};

export interface CarrierMeta {
  id: AdminShippingCarrier;
  name: string;
  description: string;
  trackingPrefix: string;
  badgeVariant: "emerald" | "sky" | "orange" | "purple";
  getTrackingUrl: (code: string) => string;
}

export const CARRIER_CONFIG: Record<AdminShippingCarrier, CarrierMeta> = {
  tipax: {
    id: "tipax",
    name: "تیپاکس (سریع‌السیر سراسری)",
    description: "ارسال هوایی و زمینی اکسپرس بسته‌های تا ۳۰ کیلوگرم با بیمه کامل",
    trackingPrefix: "TPX-",
    badgeVariant: "orange",
    getTrackingUrl: (code) => `https://tipaxco.com/tracking?id=${code}`,
  },
  chapar: {
    id: "chapar",
    name: "کالارسان چاپار",
    description: "حمل بار تخصصی تجهیزات مخابراتی به سراسر مراکز استان‌ها",
    trackingPrefix: "CHP-",
    badgeVariant: "sky",
    getTrackingUrl: (code) => `https://tracking.chaparnet.com/?bill=${code}`,
  },
  freight: {
    id: "freight",
    name: "باربری تخصصی سنگین و تجاری",
    description: "ویژه رک‌های سرور ۴۲ یونیت، قرقره‌های ۵۰۰ متری کابل و بارهای حجیم پالتی",
    trackingPrefix: "FRT-",
    badgeVariant: "purple",
    getTrackingUrl: (code) => `https://velox.network/logistics/freight-track/${code}`,
  },
  express: {
    id: "express",
    name: "پیک اختصاصی فوری ولوکس (تهران و البرز)",
    description: "تحویل حضوری با خودروی ایمن ویژه سازمان‌ها ظرف ۲ ساعت کاری",
    trackingPrefix: "VLX-EXP-",
    badgeVariant: "emerald",
    getTrackingUrl: (code) => `https://velox.network/logistics/express-track/${code}`,
  },
};

export const PAYMENT_METHOD_LABELS: Record<AdminPaymentMethod, string> = {
  bank_transfer_satna: "حواله بانکی ساتنا / پایا",
  credit_line_b2b: "اعتبار اسنادی B2B (چک صیادی)",
  online_gateway: "درگاه پرداخت الکترونیک شاپرک",
};
