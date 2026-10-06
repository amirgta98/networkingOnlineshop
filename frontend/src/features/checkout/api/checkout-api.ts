import { apiClient } from "@/shared/lib/api-client";
import {
  DeliveryMethod,
  PaymentMethod,
  CouponDiscount,
  CreateOrderPayload,
  PlacedOrderDetails,
  ShippingAddress,
  LegalInvoiceData,
  OrderFinancialSummary,
} from "../types";
import { CartItem } from "@/features/cart/types";

export const PROVINCES_AND_CITIES: Record<string, string[]> = {
  تهران: ["تهران", "شهریار", "اسلامشهر", "شهر ری", "پردیس", "دماوند", "رباط کریم", "ورامین"],
  البرز: ["کرج", "فردیس", "کمال‌شهر", "هشتگرد", "نظرآباد", "محمدشهر"],
  اصفهان: ["اصفهان", "کاشان", "خمینی‌شهر", "نجف‌آباد", "شاهین‌شهر", "فولادشهر", "مبارکه"],
  فارس: ["شیراز", "مرودشت", "جهرم", "فسا", "کازرون", "لار"],
  خراسان_رضوی: ["مشهد", "نیشابور", "سبزوار", "تربت حیدریه", "قوچان", "سرخس"],
  آذربایجان_شرقی: ["تبریز", "مراغه", "مرند", "میانه", "اهر", "بناب"],
  خوزستان: ["اهواز", "دزفول", "آبادان", "بندر ماهشهر", "خرمشهر", "شوشتر"],
  مازندران: ["ساری", "بابل", "آمل", "قائم‌شهر", "تنکابن", "چالوس", "نوشهر"],
  یزد: ["یزد", "میبد", "اردکان", "بافق", "مهریز"],
  کرمان: ["کرمان", "سیرجان", "رفسنجان", "جیرفت", "بم"],
  قم: ["قم", "سلفچگان", "قنوات"],
  مرکزی: ["اراک", "ساوه", "خمین", "محلات", "دلیجان"],
  گیلان: ["رشت", "بندر انزلی", "لاهیجان", "لنگرود", "تالش"],
  قزوین: ["قزوین", "الوند", "تاکستان", "آبیک", "بوئین‌زهرا"],
  هرمزگان: ["بندرعباس", "قشم", "کیش", "بندر لنگه", "میناب"],
};

export const DEFAULT_DELIVERY_METHODS: DeliveryMethod[] = [
  {
    id: "express_courier",
    title: "پیک اختصاصی ققنوس آکادمی (تهران و حومه)",
    subtitle: "ارسال سریع با بسته‌بندی ضدضربه قطعات حساس شبکه",
    description: "تحویل در بازه زمانی انتخابی، بیمه سلامت فیزیکی رک‌ها و ماژول‌های نوری، تحویل تا درب دیتاسنتر یا شرکت",
    cost: 45000,
    freeThreshold: 5000000,
    estimatedDeliveryTime: "امروز (بازه ۲ تا ۴ ساعته)",
    iconName: "zap",
    isExpress: true,
  },
  {
    id: "tipax_express",
    title: "تیپاکس و چاپار اکسپرس (سراسر کشور)",
    subtitle: "ارسال هوایی و زمینی سریع به تمام نقاط ایران",
    description: "کد رهگیری پیامکی آنی، پوشش کامل بیمه حمل تجهیزات شبکه تا سقف ۱۰۰ میلیون تومان",
    cost: 75000,
    freeThreshold: 8000000,
    estimatedDeliveryTime: "۲۴ الی ۴۸ ساعت کاری",
    iconName: "truck",
  },
  {
    id: "heavy_freight",
    title: "باربری و ناوگان اختصاصی (تجهیزات سنگین)",
    subtitle: "مخصوص رک‌های سرور ایستاده (24U الی 44U)، قرقره‌های کابل و یو‌پی‌اس",
    description: "بسته‌بندی پالت چوبی و فوم محافظ صنعتی، تخلیه ایمن در محل پروژه یا سایت مشتری",
    cost: 140000,
    estimatedDeliveryTime: "۲ الی ۳ روز کاری",
    iconName: "package",
  },
  {
    id: "warehouse_pickup",
    title: "تحویل حضوری در انبار مرکزی ققنوس آکادمی",
    subtitle: "تهران، خیابان ولیعصر، بالاتر از طالقانی، مجتمع تجهیزات شبکه",
    description: "تحویل فوری در ساعات کاری (۹ الی ۱۸) با امکان تست و بررسی پلمپ کالا در محل انبار",
    cost: 0,
    estimatedDeliveryTime: "آماده تحویل پس از ۱ ساعت",
    iconName: "building2",
  },
];

export const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "online_gateway",
    type: "gateway",
    title: "درگاه پرداخت اینترنتی شاپرک (کارت‌های عضو شتاب)",
    subtitle: "پرداخت سریع و امن آنلاین با تمام کارت‌های بانکی کشور",
    description: "اتصال به درگاه‌های دارای مجوز رسمی بانک مرکزی با پروتکل رمزنگاری پیشرفته TLS 1.3",
    iconName: "credit-card",
    gateways: [
      { id: "saman", name: "درگاه سامان کیش (بانک سامان)", bankName: "سامان" },
      { id: "mellat", name: "به‌پرداخت ملت (بانک ملت)", bankName: "ملت" },
      { id: "sadad", name: "سداد ملی (بانک ملی ایران)", bankName: "ملی" },
      { id: "zarinpal", name: "زرین‌پال (پذیرنده جامع)", bankName: "زرین‌پال" },
    ],
  },
  {
    id: "corporate_credit",
    type: "credit",
    title: "پرداخت اعتباری سازمانی (ویژه همکاران B2B)",
    subtitle: "تسویه اعتباری با سررسید ۳۰، ۶۰ یا ۹۰ روزه",
    description: "مخصوص شرکت‌ها و پیمانکاران دارای قرارداد فعال تأمین کالا و سقف اعتبار مصوب در ققنوس آکادمی",
    iconName: "wallet",
  },
  {
    id: "bank_wire",
    type: "bank_transfer",
    title: "واریز مستقیم به شماره شبا / حساب بانکی شرکت",
    subtitle: "صدور پیش‌فاکتور رسمی با اعتبار ۴۸ ساعته جهت پرداخت حسابداری",
    description: "مناسب برای ارگان‌های دولتی و نهادهای حقوقی با الزام پرداخت از طریق ساتنا یا پایا شرکتی",
    iconName: "building-bank",
  },
  {
    id: "sayad_cheque",
    type: "cheque",
    title: "پرداخت با چک صیادی بنفش (خریدهای عمده و پروژه‌ای)",
    subtitle: "استعلام آنی وضعیت اعتباری صیاد و ثبت در سامانه پیچک",
    description: "ویژه سفارش‌های بالای ۵۰ میلیون تومان تجهیزات پسیو و اکتیو زیرساخت شبکه",
    iconName: "file-text",
  },
];

export const PRESET_SAVED_ADDRESSES: ShippingAddress[] = [
  {
    id: "addr-1",
    title: "دفتر مرکزی / اتاق سرور",
    recipientName: "مهندس عرفان رضایی",
    phoneNumber: "09121234567",
    province: "تهران",
    city: "تهران",
    postalCode: "1998765432",
    address: "خیابان ولیعصر، نرسیده به میدان ونک، خیابان دامن‌افشار، پلاک ۳۴، طبقه ۵، واحد ۱۰ (دیتاسنتر)",
    buildingNumber: "۳۴",
    unit: "۱۰",
    deliveryNotes: "لطفاً تحویل حراست و مهندسی شبکه داده شود.",
    recipientIsSelf: true,
  },
  {
    id: "addr-2",
    title: "سایت پروژه شهرک صنعتی",
    recipientName: "مهندس علی حسینی",
    phoneNumber: "09129876543",
    province: "البرز",
    city: "کرج",
    postalCode: "3134567890",
    address: "شهرک صنعتی بهارستان، خیابان گلستان چهارم، پلاک ۱۲، سوله تجهیزات زیرساخت",
    buildingNumber: "۱۲",
    unit: "سوله اصلی",
    deliveryNotes: "نیاز به بالابر جهت انتقال رک‌های 42U به طبقه دوم",
    recipientIsSelf: false,
  },
];

export const PRESET_LEGAL_DATA: LegalInvoiceData = {
  companyName: "شرکت ارتباطات شبکه و داده گستران نوین (سهامی خاص)",
  nationalId: "10103567890",
  economicCode: "411567894321",
  registrationNumber: "456789",
  province: "تهران",
  city: "تهران",
  postalCode: "1998765432",
  address: "خیابان ولیعصر، بالاتر از میدان ونک، برج پارس، طبقه ۹، واحد ۹۰۲",
  phoneNumber: "09134761097",
};

/**
 * Validates a discount / partner promo coupon
 */
export async function validateCoupon(code: string, subtotal: number): Promise<CouponDiscount> {
  const normalizedCode = code.trim().toUpperCase();

  // Simulated latency
  await new Promise((res) => setTimeout(res, 400));

  if (normalizedCode === "NETMARKET") {
    const amount = Math.min(500000, Math.round(subtotal * 0.05));
    return {
      code: "NETMARKET",
      amount,
      percentage: 5,
      description: "تخفیف ویژه جشنواره شبکه‌کاران (۵٪ تا سقف ۵۰۰ هزار تومان)",
    };
  }

  if (normalizedCode === "VIP50" || normalizedCode === "VIP") {
    const amount = 350000;
    return {
      code: "VIP50",
      amount,
      description: "تخفیف طلایی اعضای VIP ققنوس آکادمی (۳۵۰ هزار تومان)",
    };
  }

  if (normalizedCode === "OFF10") {
    const amount = Math.min(1000000, Math.round(subtotal * 0.1));
    return {
      code: "OFF10",
      amount,
      percentage: 10,
      description: "تخفیف ۱۰٪ ویژه خریدهای عمده تجهیزات پسیو شبکه",
    };
  }

  if (normalizedCode === "CISCO2026") {
    const amount = 700000;
    return {
      code: "CISCO2026",
      amount,
      description: "کد تخفیف اختصاصی ماژول‌ها و سوئیچ‌های سازمانی سیسکو",
    };
  }

  throw new Error("کد تخفیف وارد شده نامعتبر، منقضی شده یا شرایط سقف خرید را ندارد.");
}

/**
 * Calculates complete financial breakdown
 */
export function calculateOrderFinancials(
  items: CartItem[],
  deliveryMethodId: string,
  invoiceType: "personal" | "legal",
  appliedCoupon: CouponDiscount | null
): OrderFinancialSummary {
  const subtotal = items.reduce(
    (sum, item) => sum + (item.unitPrice ?? item.product.price) * item.quantity,
    0
  );

  const selectedDelivery =
    DEFAULT_DELIVERY_METHODS.find((d) => d.id === deliveryMethodId) || DEFAULT_DELIVERY_METHODS[0];

  const isFreeShipping = Boolean(
    selectedDelivery.cost === 0 ||
      (selectedDelivery.freeThreshold && subtotal >= selectedDelivery.freeThreshold)
  );

  const shippingCost = isFreeShipping ? 0 : selectedDelivery.cost;

  const couponDiscount = appliedCoupon ? appliedCoupon.amount : 0;
  const discountTotal = couponDiscount;

  // 10% VAT according to Iranian official tax law for legal/corporate invoices
  const vatTax = invoiceType === "legal" ? Math.round((subtotal - discountTotal) * 0.1) : 0;

  const payableTotal = Math.max(0, subtotal - discountTotal + shippingCost + vatTax);

  return {
    subtotal,
    discountTotal,
    couponDiscount,
    shippingCost,
    vatTax,
    payableTotal,
    isFreeShipping,
  };
}

/**
 * Places an order via backend or local mock
 */
export async function placeOrder(
  payload: CreateOrderPayload,
  cartItems: CartItem[]
): Promise<PlacedOrderDetails> {
  // Try backend if available
  if (process.env.NEXT_PUBLIC_API_URL) {
    try {
      const response = await apiClient.post<PlacedOrderDetails>("/orders/create", payload);
      return response;
    } catch (err) {
      console.warn("[Checkout API] Backend order submission failed, falling back to mock:", err);
    }
  }

  // Realistic mock latency
  await new Promise((res) => setTimeout(res, 1200));

  const deliveryMethod =
    DEFAULT_DELIVERY_METHODS.find((d) => d.id === payload.deliveryMethodId) ||
    DEFAULT_DELIVERY_METHODS[0];

  const paymentMethod =
    DEFAULT_PAYMENT_METHODS.find((p) => p.id === payload.paymentMethodId) ||
    DEFAULT_PAYMENT_METHODS[0];

  const subtotal = cartItems.reduce(
    (acc, it) => acc + (it.unitPrice ?? it.product.price) * it.quantity,
    0
  );

  const isFreeShipping = Boolean(
    deliveryMethod.cost === 0 ||
      (deliveryMethod.freeThreshold && subtotal >= deliveryMethod.freeThreshold)
  );
  const shippingCost = isFreeShipping ? 0 : deliveryMethod.cost;

  let couponAmount = 0;
  if (payload.couponCode) {
    if (payload.couponCode.toUpperCase() === "NETMARKET") couponAmount = Math.round(subtotal * 0.05);
    else if (payload.couponCode.toUpperCase() === "VIP50") couponAmount = 350000;
    else if (payload.couponCode.toUpperCase() === "OFF10") couponAmount = Math.round(subtotal * 0.1);
    else if (payload.couponCode.toUpperCase() === "CISCO2026") couponAmount = 700000;
  }

  const vatTax = payload.invoiceType === "legal" ? Math.round((subtotal - couponAmount) * 0.1) : 0;
  const payableTotal = subtotal - couponAmount + shippingCost + vatTax;

  const orderNum = Math.floor(100000 + Math.random() * 900000).toString();
  const trackingNum = "NET-" + Math.floor(10000000 + Math.random() * 90000000).toString();

  const orderDetails: PlacedOrderDetails = {
    orderId: `ord_${Date.now()}`,
    orderNumber: orderNum,
    trackingCode: trackingNum,
    createdAt: new Date().toISOString(),
    items: cartItems,
    shippingAddress: payload.shippingAddress,
    invoiceType: payload.invoiceType,
    legalInvoice: payload.legalInvoice,
    deliveryMethod,
    deliveryTimeSlot: payload.deliveryTimeSlot,
    paymentMethod,
    financialSummary: {
      subtotal,
      discountTotal: couponAmount,
      couponDiscount: couponAmount,
      shippingCost,
      vatTax,
      payableTotal,
      isFreeShipping,
    },
    paymentStatus:
      paymentMethod.type === "gateway"
        ? "completed"
        : paymentMethod.type === "credit"
        ? "credit_approved"
        : paymentMethod.type === "bank_transfer"
        ? "pending_transfer"
        : "pending_cheque",
  };

  return orderDetails;
}
