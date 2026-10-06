import { ProjectCategory, ProjectItem } from "../types";

export interface ProjectCategoryTab {
  id: ProjectCategory;
  label: string;
  count: number;
}

export const PORTFOLIO_CATEGORIES: ProjectCategoryTab[] = [
  { id: "all", label: "همه پروژه‌ها", count: 4 },
  { id: "datacenter", label: "دیتاسنتر و اتاق سرور", count: 1 },
  { id: "switching", label: "سوئیچینگ و فیبر نوری", count: 1 },
  { id: "wireless", label: "شبکه بی‌سیم سازمانی", count: 1 },
  { id: "security", label: "امنیت و فایروالینگ", count: 1 },
];

export const PORTFOLIO_PROJECTS: ProjectItem[] = [
  {
    id: "proj-1",
    title: "طراحی و پیاده‌سازی زیرساخت دیتاسنتر و اتاق سرور مرکزی",
    slug: "zagros-petrochemical-datacenter",
    client: "مجتمع پتروشیمی زاگرس",
    category: "datacenter",
    categoryName: "دیتاسنتر و اتاق سرور",
    year: "۱۴۰۲",
    location: "عسلویه، بوشهر",
    summary:
      "پیاده‌سازی صفر تا صد پسیو و اکتیو دیتاسنتر اختصاصی شامل ۱۲ رک ۴۲ یونیت استاندارد، ترانک‌های فیبر نوری OM4 و کابل‌کشی شیلددار Cat6A با تضمین دسترسی ۲۴/۷.",
    description:
      "در این پروژه ملی، دپارتمان مهندسی ققنوس آکادمی عهده‌دار طراحی پلان توزیع ترافیک، آرایش رک‌های سروری و سوئیچی، ایجاد مسیرهای مجزای کابل‌کشی زیر کف کاذب، سیستم مانیتورینگ محیطی و اجرای ریداندنسی کامل تغذیه و لینک‌های ارتباطی بود.",
    challenge:
      "دمای محیطی بالا و شرایط خورنده منطقه عسلویه، تداخلات شدید الکترومغناطیسی ناشی از تجهیزات صنعتی و لزوم حفظ اتصال پایدار خطوط تولید بدون ثانیه‌ای قطعی.",
    solution:
      "استفاده از کابل‌های ضد حریق و کم‌دود LSZH لگراند، ماژول‌های فیبر سینگل‌مود با حفاظت بالا، سوئیچ‌های صنعتی مقاوم در برابر حرارت سیسکو نکسوس و استقرار سیستم کولینگ دقیق In-Row.",
    results: [
      "دستیابی به پایداری عملکردی ۹۹.۹۹۵٪ بدون هیچ‌گونه افت پهنای باند",
      "کاهش دمای کاری رک‌ها به میزان ۱۲ درجه سانتی‌گراد با طراحی صحیح راهرو گرم/سرد",
      "قابلیت ارتقا و توسعه تا ۲.۵ برابر ظرفیت فعلی بدون نیاز به توقف سرویس",
    ],
    metrics: [
      { label: "پایداری زیرساخت", value: "۹۹.۹۹٪", hint: "آپتایم تضمین‌شده" },
      { label: "رک استاندارد", value: "۱۲ عدد", hint: "۴۲ یونیت عمودی" },
      { label: "نود فعال شبکه", value: "+۱,۴۰۰", hint: "پورت‌های Cat6A و فیبر" },
    ],
    hardwareUsed: [
      { name: "سوئیچ‌های هسته Nexus 9300", brand: "Cisco", count: "۴ دستگاه" },
      { name: "تجهیزات پسیو و پچ‌پنل‌های Cat6A", brand: "Legrand", count: "۲۴ پنل" },
      { name: "کابل‌های فیبر نوری OM4 مالتی‌مود", brand: "Nexans", count: "۳,۵۰۰ متر" },
      { name: "رک‌های ماژولار و PDUهای هوشمند", brand: "APC", count: "۱۲ دستگاه" },
    ],
    tags: ["دیتاسنتر", "سیسکو نکسوس", "لگراند", "Cat6A", "کف کاذب"],
    status: "in_support",
    statusLabel: "پشتیبانی فعال",
    accentColor: "text-amber-400",
    glowColor: "rgba(245, 158, 11, 0.18)",
    imageUrl:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1000&auto=format&fit=crop&q=80",
    gallery: [
      {
        id: "p1-m1",
        type: "image",
        url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80",
        title: "نمای رک‌های سروری و دیتاسنتر پتروشیمی زاگرس",
        caption: "آرایش رک‌های ۴۲ یونیت استاندارد و راهروی هوای سرد مجهز به سنسورهای محیطی",
      },
      {
        id: "p1-m2",
        type: "video",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1000&auto=format&fit=crop&q=80",
        title: "مستند ویدیویی پیاده‌سازی و تست دیتاسنتر زاگرس",
        caption: "تور ویدیویی از تجهیزات پسیو، کابل‌کشی کف کاذب و سیستم ریداندنسی تغذیه",
        duration: "۰۳:۴۰",
      },
      {
        id: "p1-m3",
        type: "image",
        url: "https://images.unsplash.com/photo-1520869562399-e772f042f422?w=1200&auto=format&fit=crop&q=80",
        title: "پچینگ ترانک فیبر نوری OM4 و کابل‌کشی Cat6A",
        caption: "مدیریت حرفه‌ای کابل‌ها با داکت‌های اختصاصی بدون تداخل الکترومغناطیسی",
      },
      {
        id: "p1-m4",
        type: "image",
        url: "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=1200&auto=format&fit=crop&q=80",
        title: "سامانه مانیتورینگ هوشمند برق و کولینگ In-Row",
        caption: "پایش لحظه‌ای دما، رطوبت و توان مصرفی PDUهای هوشمند برند APC",
      },
    ],
  },
  {
    id: "proj-2",
    title: "مدرنیزاسیون شبکه سوئیچینگ ۱۰G و ریداندنسی دوگانه",
    slug: "parsian-financial-switching-10g",
    client: "هلدینگ مالی و اعتباری پارسیان",
    category: "switching",
    categoryName: "سوئیچینگ و فیبر نوری",
    year: "۱۴۰۳",
    location: "تهران، میرداماد",
    summary:
      "مهاجرت معماری سوئیچینگ سازمان از ۱G به بک‌بون ۱۰ گیگابیت فیبر نوری با سوئیچ‌های Catalyst 9200L و ایجاد ریداندنسی کامل در لایه توزیع و دسترسی.",
    description:
      "این پروژه با هدف از بین بردن گلوگاه‌های انتقال تراکنش‌های مالی، کاهش زمان پاسخگویی پایگاه‌های داده و برقراری ارتباط پایدار بین طبقات مرکزی ساختمان هلدینگ اجرا شد. با استفاده از فناوری Stacking، چندین سوئیچ فیزیکی به یک نهاد منطقی یکپارچه تبدیل شدند.",
    challenge:
      "جابجایی و تعویض زیرساخت سوئیچینگ بدون قطعی در ساعات اداری و حساسیت بسیار بالای تاخیر (Latency) در تراکنش‌های بانکی کاربران.",
    solution:
      "پیاده‌سازی پروتکل‌های HSRP و LACP به همراه ترانک‌های دوگانه فیبر نوری با ماژول‌های پرسرعت 10G SFP+ و جابجایی ترافیک طی شیفت‌های برنامه‌ریزی‌شده شبانه.",
    results: [
      "افزایش ۱۰ برابری پهنای باند ستون فقرات شبکه سازمان",
      "کاهش تاخیر بین سوئیچی به زیر ۱ میلی‌ثانیه در بارهای سنگین تراکنشی",
      "تضمین جابجایی خودکار ترافیک در کسری از ثانیه در صورت بروز قطعی در هر کابل",
    ],
    metrics: [
      { label: "سرعت بک‌بون", value: "10 Gbps", hint: "پورت‌های SFP+" },
      { label: "کاهش لتنسی", value: "۶۵٪", hint: "بهبود سرعت تراکنش" },
      { label: "پورت‌های سوئیچ", value: "+۵۲۰", hint: "گیگابیت با PoE+" },
    ],
    hardwareUsed: [
      { name: "سوئیچ Catalyst 9200L 48P PoE+", brand: "Cisco", count: "۱۰ دستگاه" },
      { name: "ماژول‌های SFP+ 10G-SR", brand: "Cisco", count: "۲۴ عدد" },
      { name: "پچ‌کورد و پیگ‌تیل‌های فیبر نوری", brand: "Nexans", count: "۹۶ رشته" },
      { name: "کابل‌های Stacking پرسرعت", brand: "Cisco", count: "۸ عدد" },
    ],
    tags: ["سیسکو", "سوئیچینگ 10G", "Stacking", "فیبر نوری", "ریداندنسی"],
    status: "completed",
    statusLabel: "تکمیل شده",
    accentColor: "text-orange-400",
    glowColor: "rgba(234, 88, 12, 0.18)",
    imageUrl:
      "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1000&auto=format&fit=crop&q=80",
    gallery: [
      {
        id: "p2-m1",
        type: "image",
        url: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&auto=format&fit=crop&q=80",
        title: "استک سوئیچ‌های Catalyst 9200L سیسکو",
        caption: "اتصال Stacking با پهنای باند ۱۶۰ گیگابیت بر ثانیه و بک‌بون ریداندنت",
      },
      {
        id: "p2-m2",
        type: "video",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1000&auto=format&fit=crop&q=80",
        title: "تست عملیاتی سوئیچینگ Failover و مانیتورینگ ترافیک 10G",
        caption: "آزمون قطع کابل ترانک و جابجایی خودکار ترافیک در کسری از ثانیه بدون افت سرویس",
        duration: "۰۲:۱۵",
      },
      {
        id: "p2-m3",
        type: "image",
        url: "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=1200&auto=format&fit=crop&q=80",
        title: "پچ‌پنل‌های ماژولار فیبر نوری و پیگ‌تیل‌های Nexans",
        caption: "اتصالات فیبر سینگل‌مود و مالتی‌مود با کانکتورهای LC پولیش APC",
      },
    ],
  },
  {
    id: "proj-3",
    title: "طراحی و استقرار شبکه بی‌سیم سراسری با استاندارد Wi-Fi 6",
    slug: "iust-campus-wifi6-deployment",
    client: "پردیس مهندسی دانشگاه علم و صنعت",
    category: "wireless",
    categoryName: "شبکه بی‌سیم سازمانی",
    year: "۱۴۰۲",
    location: "تهران، رسالت",
    summary:
      "پوشش یکپارچه بی‌سیم در ۵ دانشکده، فضاهای آزمایشگاهی و سالن‌های همایش با بیش از ۶۵ اکسس‌پوینت سقفی UniFi 6 Pro و کنترلر متمرکز مدیریت ابری.",
    description:
      "پروژه پوشش وای‌فای پردیس با شبیه‌سازی رادیویی (Heatmap RF)، تعیین دقیق محل نصب اکسس‌پوینت‌ها برای حداقل هم‌پوشانی فرکانسی و اعمال سیاست‌های احراز هویت مجزا (Captive Portal) برای اساتید، دانشجویان و میهمانان طراحی و پیاده‌سازی گردید.",
    challenge:
      "تراکم بسیار بالای کاربران همزمان (High Density) در آمفی‌تئاترها و دیوارهای ضخیم بتنی ساختمان‌های قدیمی دانشگاه.",
    solution:
      "استفاده از فناوری MU-MIMO 4x4، باند فرکانسی ۵ گیگاهرتز با کانال‌های بهینه‌شده، استقرار قابلیت Fast Roaming (802.11r/k/v) و کنترل خودکار توان رادیویی (Auto TX Power).",
    results: [
      "پوشش یکنواخت سیگنال با قدرت حداقل -65 dBm در تمامی نقاط پرتردد",
      "پشتیبانی موفق از بیش از ۲,۵۰۰ کلاینت همزمان بدون قطعی اتصال و رومینگ",
      "مدیریت پهنای باند و مانیتورینگ متمرکز لحظه‌ای از طریق پنل مدیریتی",
    ],
    metrics: [
      { label: "کاربران همزمان", value: "+۲,۵۰۰", hint: "بدون افت کیفیت" },
      { label: "اکسس‌پوینت فعال", value: "۶۵ عدد", hint: "Wi-Fi 6 سقفی" },
      { label: "پوشش بدون قطعی", value: "۱۰۰٪", hint: "رومینگ یکپارچه" },
    ],
    hardwareUsed: [
      { name: "اکسس‌پوینت UniFi 6 Pro", brand: "Ubiquiti", count: "۶۵ دستگاه" },
      { name: "سوئیچ UniFi PoE+ Enterprise 48", brand: "Ubiquiti", count: "۳ دستگاه" },
      { name: "کنسول Dream Machine Pro Max", brand: "Ubiquiti", count: "۲ دستگاه" },
    ],
    tags: ["Wi-Fi 6", "یوبیکیوتی", "UniFi", "شبکه بی‌سیم", "رومینگ هوشمند"],
    status: "completed",
    statusLabel: "تکمیل شده",
    accentColor: "text-emerald-400",
    glowColor: "rgba(16, 185, 129, 0.18)",
    imageUrl:
      "https://images.unsplash.com/photo-1520869562399-e772f042f422?w=1000&auto=format&fit=crop&q=80",
    gallery: [
      {
        id: "p3-m1",
        type: "image",
        url: "https://images.unsplash.com/photo-1520869562399-e772f042f422?w=1200&auto=format&fit=crop&q=80",
        title: "نصب اکسس‌پوینت‌های سقفی UniFi 6 Pro",
        caption: "طراحی زاویه دید و پوشش یکنواخت امواج در سالن‌های همایش دانشگاه علم و صنعت",
      },
      {
        id: "p3-m2",
        type: "video",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1000&auto=format&fit=crop&q=80",
        title: "تست سرعت و رومینگ هوشمند در محوطه دانشکده‌ها",
        caption: "بررسی جابجایی کلاینت‌ها بین سلول‌های وای‌فای با صفر میلی‌ثانیه قطعی",
        duration: "۰۱:۵۰",
      },
      {
        id: "p3-m3",
        type: "image",
        url: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&auto=format&fit=crop&q=80",
        title: "کنسول مرکزی مدیریت و تحلیل نقشه حرارتی (Heatmap)",
        caption: "پایش بلادرنگ وضعیت اتصال ۲۵۰۰ کاربر همزمان و مدیریت توان فرکانسی",
      },
    ],
  },
  {
    id: "proj-4",
    title: "امنیت مرزی شبکه، فایروالینگ سخت‌افزاری و VPN سایت‌به‌سایت",
    slug: "alborz-pharma-secure-networking",
    client: "گروه دارویی و شیمیایی البرز",
    category: "security",
    categoryName: "امنیت و فایروالینگ",
    year: "۱۴۰۳",
    location: "البرز و شعب سراسری کشور",
    summary:
      "برقراری ارتباط امن و رمزنگاری‌شده بین کارخانجات مرکزی و ۸ دفتر استانی با روترهای MikroTik CCR و فایروالینگ لایه ۷ جهت جلوگیری از نفوذ سایبری.",
    description:
      "به منظور حفظ محرمانگی فرمولاسیون‌های تولیدی و اتصال پایدار سیستم ERP سازمانی به انبارهای پخش دارویی، زیرساخت امنیتی با فایروال‌های پرسرعت چند هسته‌ای و تانل‌های پشتیبان پیاده‌سازی شد.",
    challenge:
      "خطر نفوذ باج‌افزارها از طریق اینترنت، ناپایداری خطوط مخابراتی شعب شهرستانی و نیاز به انتقال بیدرنگ داده‌های مالی و انبارداری.",
    solution:
      "ایجاد تانل‌های رمزنگاری شتاب‌یافته WireGuard و IPsec با پشتیبان‌گیری خودکار از طریق خطوط MPLS و LTE، پیاده‌سازی تفکیک امنیتی زون‌ها و فیلترینگ پورت‌ها.",
    results: [
      "مسدودسازی کامل تلاش‌های غیرمجاز و صفر شدن رخدادهای امنیتی سایبری",
      "تضمین اتصال شعب استانی با قابلیت Failover کمتر از ۳ ثانیه",
      "پایش لحظه‌ای ترافیک ورودی/خروجی و گزارش‌گیری مدون تهدیدات شبکه",
    ],
    metrics: [
      { label: "دفاتر متصل", value: "۹ شعبه", hint: "ارتباط سراسری رمزنگاری" },
      { label: "زمان سوئیچ Failover", value: "< ۳ ثانیه", hint: "انتقال خودکار ترافیک" },
      { label: "پهنای باند رمزنگاری", value: "5 Gbps", hint: "شتاب‌یافته سخت‌افزاری" },
    ],
    hardwareUsed: [
      { name: "روتر کلاود Core Router CCR2004", brand: "MikroTik", count: "۴ دستگاه" },
      { name: "روترهای شعب RB5009UG+S+IN", brand: "MikroTik", count: "۸ دستگاه" },
      { name: "ماژول‌های فیبر و مبدل‌های صنعتی", brand: "MikroTik", count: "۱۶ عدد" },
    ],
    tags: ["میکروتیک", "فایروال", "VPN سایت‌به‌سایت", "امنیت شبکه", "WireGuard"],
    status: "in_support",
    statusLabel: "پشتیبانی فعال",
    accentColor: "text-indigo-400",
    glowColor: "rgba(99, 102, 241, 0.18)",
    imageUrl:
      "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=1000&auto=format&fit=crop&q=80",
    gallery: [
      {
        id: "p4-m1",
        type: "image",
        url: "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=1200&auto=format&fit=crop&q=80",
        title: "استقرار روترهای صنعتی MikroTik CCR2004",
        caption: "پردازش چند هسته‌ای تانل‌های رمزگذاری‌شده بدون افت پکت در ترافیک سنگین",
      },
      {
        id: "p4-m2",
        type: "video",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1520869562399-e772f042f422?w=1000&auto=format&fit=crop&q=80",
        title: "ویدیو بررسی تانل‌های امن WireGuard و آزمون امنیت فایروال",
        caption: "شبیه‌سازی نفوذ سایبری و تست مقاومت قوانین فایروالینگ لایه ۷ در برابر حملات DDoS",
        duration: "۰۲:۳۰",
      },
      {
        id: "p4-m3",
        type: "image",
        url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80",
        title: "داشبورد پایش تهدیدات امنیتی و ترافیک شعب",
        caption: "اتصال پایدار سیستم مالی ERP کارخانه با انبارها از طریق پروتکل‌های رمزنگاری اختصاصی",
      },
    ],
  },
];
