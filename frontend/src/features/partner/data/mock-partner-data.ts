import type {
  WholesaleProduct,
  PartnerOrder,
  PartnerRfq,
  PartnerCheque,
  PartnerInvoice,
  PartnerProjectSite,
  PartnerAgent,
  PartnerWarrantyItem,
  PartnerTicket,
  PartnerInternetService,
  P2PInternetPlan,
  StaticIpPackageDefinition,
  PartnerStaticIpSubscription,
} from "../types/partner.types";

export const MOCK_WHOLESALE_PRODUCTS: WholesaleProduct[] = [];

export const MOCK_PARTNER_ORDERS: PartnerOrder[] = [];

export const MOCK_PARTNER_RFQS: PartnerRfq[] = [];

export const MOCK_PARTNER_CHEQUES: PartnerCheque[] = [];

export const MOCK_PARTNER_INVOICES: PartnerInvoice[] = [];

export const MOCK_PARTNER_PROJECT_SITES: PartnerProjectSite[] = [];

export const MOCK_PARTNER_AGENTS: PartnerAgent[] = [];

export const MOCK_PARTNER_WARRANTY_ITEMS: PartnerWarrantyItem[] = [];

export const MOCK_PARTNER_TICKETS: PartnerTicket[] = [];

export const MOCK_PARTNER_PROFILE_DATA = {
  companyName: "",
  brandName: "",
  tierName: "همکار رسمی (Tier A)",
  registrationNumber: "",
  nationalId: "",
  economicCode: "",
  establishedYear: "",
  officialAddress: "",
  postalCode: "",
  officialPhone: "",
  officialFax: "",
  financialEmail: "",
  procurementEmail: "",
  officialIban: "",
  bankName: "",
  legalDocs: [],
  accountManager: {
    name: "پشتیبانی سازمانی و امور همکاران",
    role: "واحد مهندسی و اکانت منیجر همکاران تجاری",
    phone: "۰۲۱-۸۸۲۰۰۱۹۰ داخلی ۴۰۲",
    directMobile: "",
    email: "partner@fonix-accademic.ir",
    avatar: "/avatars/account-manager.jpg",
  },
};

export const MOCK_PARTNER_INTERNET_SERVICES: PartnerInternetService[] = [];

export const MOCK_P2P_PLANS: P2PInternetPlan[] = [
  {
    id: "p2p_50_500",
    name: "پلن ۵۰ مگابیت اختصاصی",
    speedMbps: 50,
    speedLabel: "۵۰ مگابیت",
    trafficGb: 500,
    trafficLabel: "۵۰۰ گیگابایت",
    ratio: "1:1",
    sla: "۹۹.۹۵٪",
    baseMonthlyRetailPrice: 1_800_000,
    partnerMonthlyPrice: 1_440_000,
    pingGuarantee: "زیر ۵ میلی‌ثانیه",
    recommendedFor: "دفاتر کار کوچک، انتقال تصویر دوربین‌های مداربسته و سیستم‌های حسابداری",
    features: [
      "ضریب اشتراک ۱ به ۱ واقعی (بدون افت ساعات اوج)",
      "آپلود و دانلود برابر ۵۰ مگابیت بر ثانیه",
      "پایداری ۹۹.۹۵٪ SLA با پشتیبانی دکل ۲۴ ساعته",
      "امکان تخصیص رسمی ۱ عدد IP استاتیک",
    ],
  },
  {
    id: "p2p_100_1000",
    name: "پلن ۱۰۰ مگابیت اختصاصی",
    speedMbps: 100,
    speedLabel: "۱۰۰ مگابیت",
    trafficGb: 1000,
    trafficLabel: "۱ ترابایت",
    ratio: "1:1",
    sla: "۹۹.۹۵٪",
    baseMonthlyRetailPrice: 2_900_000,
    partnerMonthlyPrice: 2_290_000,
    pingGuarantee: "زیر ۴ میلی‌ثانیه",
    recommendedFor: "شرکت‌های متوسط، شعب اداری، ویدئو کنفرانس‌های چندطرفه 4K و سرورهای داخلی",
    features: [
      "پینگ تک‌رقمی فوق‌العاده پایدار در سراسر کشور",
      "لینک ماکروویو اختصاصی با روترهای میکروتیک CCR",
      "ترافیک نامتقارن صفر (تضمین متقارن ۱:۱)",
      "پشتیبانی فنی NOC شیفت شبانه‌روزی",
    ],
  },
  {
    id: "p2p_200_2500",
    name: "پلن ۲۰۰ مگابیت پروژه‌ای",
    speedMbps: 200,
    speedLabel: "۲۰۰ مگابیت",
    trafficGb: 2500,
    trafficLabel: "۲.۵ ترابایت",
    ratio: "1:1",
    sla: "۹۹.۹۹٪",
    baseMonthlyRetailPrice: 4_600_000,
    partnerMonthlyPrice: 3_590_000,
    pingGuarantee: "زیر ۳ میلی‌ثانیه",
    recommendedFor: "کارخانجات، پروژه‌های پیمانکاری، شرکت‌های نرم‌افزاری و کارگاه‌های عمرانی",
    features: [
      "پرفروش‌ترین پلن پروژه‌ای همکاران تجاری ققنوس آکادمی",
      "تضمین آپ‌تایم ۹۹.۹۹٪ با خسارت نقدی تاخیر",
      "رادیو وایرلس پشتیبان با سوییچ خودکار Failover",
      "امکان تعریف ۱ عدد آی‌پی استاتیک روی لینک",
    ],
    isPopular: true,
  },
  {
    id: "p2p_300_5000",
    name: "پلن ۳۰۰ مگابیت دیتاسنتر",
    speedMbps: 300,
    speedLabel: "۳۰۰ مگابیت",
    trafficGb: 5000,
    trafficLabel: "۵ ترابایت",
    ratio: "1:1",
    sla: "۹۹.۹۹٪",
    baseMonthlyRetailPrice: 6_800_000,
    partnerMonthlyPrice: 5_250_000,
    pingGuarantee: "زیر ۳ میلی‌ثانیه",
    recommendedFor: "دیتاسنترها، هلدینگ‌های چندشعبه، سرورهای پایگاه داده و استودیوهای رندر",
    features: [
      "پهنای باند کاملاً اختصاصی دیتاسنتری با رادیوهای مجوزدار",
      "تخصیص آی‌پی تمیز با ثبت کامل در RIPE",
      "پایش پکت‌لاس ۲۴/۷ با ارسال آلارم اختصاصی به ادمین شبکه",
      "نصب و برپایی دکل وایرلس ظرف حداکثر ۴۸ ساعت",
    ],
  },
  {
    id: "p2p_500_10000",
    name: "پلن ۵۰۰ مگابیت سازمانی",
    speedMbps: 500,
    speedLabel: "۵۰۰ مگابیت",
    trafficGb: 10000,
    trafficLabel: "۱۰ ترابایت",
    ratio: "1:1",
    sla: "۹۹.۹۹٪",
    baseMonthlyRetailPrice: 11_500_000,
    partnerMonthlyPrice: 8_900_000,
    pingGuarantee: "زیر ۲ میلی‌ثانیه",
    recommendedFor: "سازمان‌های بزرگ، بیمارستان‌ها، پلتفرم‌های ابری و مراکز تماس با ترافیک سنگین",
    features: [
      "مسیر رادیویی دوطرفه با لینک پروتکشن Redundant",
      "پینگ تک‌رقمی پایدار متصل به مرکز تبادل ترافیک IXP",
      "تخصیص آی‌پی استاتیک سازمانی با Reverse DNS",
      "حضور کارشناس ارشد شبکه ققنوس آکادمی در زمان تست تحویل سرعت",
    ],
  },
  {
    id: "p2p_1000_unlimited",
    name: "پلن ۱ گیگابیت متقارن",
    speedMbps: 1000,
    speedLabel: "۱۰۰۰ مگابیت (1Gbps)",
    trafficGb: 0,
    trafficLabel: "نامحدود واقعی",
    ratio: "1:1",
    sla: "۹۹.۹۹٪",
    baseMonthlyRetailPrice: 19_000_000,
    partnerMonthlyPrice: 14_900_000,
    pingGuarantee: "زیر ۲ میلی‌ثانیه",
    recommendedFor: "پایگاه‌های عظیم داده، اپراتورها، سرورهای هاستینگ ابری و دفاتر مرکزی هلدینگ‌ها",
    features: [
      "ظرفیت پهنای باند کامل ۱۰۰۰ مگابیت بر ثانیه واقعی",
      "ترافیک کاملاً نامحدود و بدون مصرف منصفانه (Zero FUP)",
      "نصب دکل مهاری تا ارتفاع ۶۰ متر و تجهیزات صنعتی درجه یک",
      "پشتیبانی مستقیم مدیر فنی ارشد زیرساخت ققنوس آکادمی",
    ],
  },
];

export const MOCK_STATIC_IP_PACKAGES: StaticIpPackageDefinition[] = [
  {
    id: "ip_pkg_1",
    ipCount: 1,
    usableIps: 1,
    subnetMask: "/32 Single Host",
    label: "۱ عدد IP استاتیک اختصاصی (تکی)",
    baseMonthlyRetailPrice: 120_000,
    partnerMonthlyPrice: 95_000,
    setupFee: 0,
    features: [
      "انتقال تصویر دوربین‌های مداربسته (CCTV NVR/DVR)",
      "دسترسی ریموت به سیستم حسابداری و اتوماسیون اداری",
      "عدم تغییر آدرس در ریستارت مودم یا قطع برق",
    ],
    recommendedFor: "دفاتر کار، مغازه‌ها، دوربین مداربسته و سیستم‌های حضور غیاب",
  },
  {
    id: "ip_pkg_2",
    ipCount: 2,
    usableIps: 2,
    subnetMask: "/32 Dual IP",
    label: "۲ عدد IP استاتیک اختصاصی",
    baseMonthlyRetailPrice: 230_000,
    partnerMonthlyPrice: 180_000,
    setupFee: 50_000,
    features: [
      "تفکیک ترافیک دوربین و سرور محلی",
      "پیکربندی Dual WAN روی روترهای میکروتیک",
      "راه‌اندازی سرور داخلی با دو لینک مجزا",
    ],
    recommendedFor: "شرکت‌های کوچک با نیاز به تفکیک ریموت دسکتاپ و دوربین",
  },
  {
    id: "ip_pkg_4",
    ipCount: 4,
    usableIps: 1,
    subnetMask: "/30 Subnet (۱ آی‌پی WAN)",
    label: "بلاک ۴ تایی IP استاتیک (/30 Subnet)",
    baseMonthlyRetailPrice: 390_000,
    partnerMonthlyPrice: 295_000,
    setupFee: 120_000,
    features: [
      "اتصال روترهای مرزی BGP / میکروتیک / سیسکو",
      "راه‌اندازی فایروال سخت‌افزاری (FortiGate / Sophos / pfSense)",
      "تنظیم رکوردهای رسمی RDNS برای میل‌سرور شرکتی",
    ],
    recommendedFor: "شرکت‌های متوسط با میل‌سرور اختصاصی یا فایروال مرزی",
  },
  {
    id: "ip_pkg_8",
    ipCount: 8,
    usableIps: 5,
    subnetMask: "/29 Subnet (۵ آی‌پی عمومی قابل استفاده)",
    label: "بلاک ۸ تایی IP استاتیک سازمانی (/29 Subnet)",
    baseMonthlyRetailPrice: 720_000,
    partnerMonthlyPrice: 540_000,
    setupFee: 220_000,
    features: [
      "تفکیک وب‌سرور، میل‌سرور، دوربین و VPN روی آدرس‌های مجزا",
      "امکان پیاده‌سازی DMZ پیشرفته در زیرساخت شبکه شرکت",
      "مانیتورینگ پکت‌لاس ۲۴ ساعته از مرکز داده ققنوس آکادمی",
      "تاییدیه مکتوب مالکیت سازمانی و مستندات RIPE",
    ],
    recommendedFor: "شرکت‌های بزرگ، استارتاپ‌ها، سرورهای هاستینگ داخلی و دفاتر چندشعبه",
    isPopular: true,
  },
  {
    id: "ip_pkg_16",
    ipCount: 16,
    usableIps: 13,
    subnetMask: "/28 Subnet (۱۳ آی‌پی عمومی قابل استفاده)",
    label: "بلاک ۱۶ تایی IP دیتاسنتر (/28 Subnet)",
    baseMonthlyRetailPrice: 1_350_000,
    partnerMonthlyPrice: 990_000,
    setupFee: 350_000,
    features: [
      "کلاسترینگ سرورها با معماری High Availability (HA)",
      "اختصاص آی‌پی‌های مستقل به دپارتمان‌های امنیتی مختلف",
      "پشتیبانی کامل از پروتکل‌های مسیریابی دینامیک OSPF و BGP",
      "مشاوره فنی رایگان جهت طراحی جداول مسیریابی و NAT",
    ],
    recommendedFor: "دیتاسنترها، هلدینگ‌ها، پلتفرم‌های ابری و مراکز داده پشتیبان",
  },
  {
    id: "ip_pkg_32",
    ipCount: 32,
    usableIps: 29,
    subnetMask: "/27 Subnet (۲۹ آی‌پی عمومی قابل استفاده)",
    label: "بلاک ۳۲ تایی IP سازمانی (/27 Subnet)",
    baseMonthlyRetailPrice: 2_600_000,
    partnerMonthlyPrice: 1_890_000,
    setupFee: 500_000,
    features: [
      "ساب‌نت بزرگ سازمانی با قابلیت Route مستقیم به ASN شرکت",
      "مدیریت مستقل رکوردهای Reverse DNS در سامانه ققنوس آکادمی",
      "پشتیبانی از ساب‌نتینگ اختصاصی برای شعب متعدد",
      "گارانتی تخصیص آی‌پی‌های تمیز بدون سابقه بلک‌لیست بین‌المللی",
    ],
    recommendedFor: "شرکت‌های مخابراتی، بانک‌ها، مراکز داده ابری و شبکه‌های بزرگ",
  },
];

export const MOCK_PARTNER_STATIC_IP_SUBSCRIPTIONS: PartnerStaticIpSubscription[] = [];
