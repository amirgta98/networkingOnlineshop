import { ArticleCategory, ArticleItem } from "../types";

export interface ArticleCategoryTab {
  id: ArticleCategory;
  label: string;
  count: number;
}

export const ARTICLE_CATEGORIES: ArticleCategoryTab[] = [
  { id: "all", label: "همه مقالات", count: 4 },
  { id: "switching", label: "سوئیچینگ و مسیریابی", count: 1 },
  { id: "fiber", label: "فیبر نوری و انتقال", count: 1 },
  { id: "mikrotik", label: "میکروتیک و امنیت", count: 1 },
  { id: "passive", label: "استانداردها و پسیو", count: 1 },
];

export const ARTICLES_DATA: ArticleItem[] = [
  {
    id: "art-1",
    title:
      "مقایسه سوئیچ لایه ۲ و لایه ۳: کدام معماری برای سازمان شما مناسب است؟",
    slug: "l2-vs-l3-switch-comparison-guide",
    excerpt:
      "بررسی تفاوت‌های کلیدی میان سوئیچینگ لایه پیوند داده و مسیریابی لایه شبکه، نحوه مدیریت Inter-VLAN Routing، و استراتژی کاهش سربار روتر اصلی در شبکه‌های سازمانی.",
    paragraphs: [
      "یکی از اساسی‌ترین تصمیمات در طراحی زیرساخت شبکه هر سازمان، انتخاب صحیح بین سوئیچ‌های لایه ۲ (Layer 2 Switching) و سوئیچ‌های چندلایه‌ای یا لایه ۳ (Layer 3 Routing Switches) است. در حالی که سوئیچ‌های لایه ۲ تنها بر اساس آدرس فیزیکی MAC و در یک دامنه انتشار (Broadcast Domain) واحد عمل می‌کنند، سوئیچ‌های لایه ۳ توانایی تصمیم‌گیری هوشمند بر اساس آدرس‌های منطقی IP را دارا هستند.",
      "مهم‌ترین برتری سوئیچ لایه ۳ در سازمان‌های متوسط و بزرگ، توانایی انجام فرآیند Inter-VLAN Routing با سرعت سیم (Wire-Speed) است. در شبکه‌های سنتی که تنها از سوئیچ لایه ۲ استفاده می‌کردند، ترافیک میان VLANها ناچار به خروج از سوئیچ و ورود به پورت روتر (معماری معروف Router-on-a-Stick) بود که گلوگاه پردازشی شدیدی ایجاد می‌کرد.",
      "با سوئیچ‌های سری Catalyst 9200 یا 9300 سیسکو، روتینگ میان سگمنت‌ها توسط چیپ‌ست‌های اختصاصی ASIC انجام می‌شود؛ بدین معنا که تاخیر بسته به میکروثانیه می‌رسد و روتر اصلی تنها وظیفه اتصال به اینترنت و ارتباطات امن بیرونی را بر عهده خواهد داشت.",
    ],
    category: "switching",
    categoryName: "سوئیچینگ و مسیریابی",
    readTime: "۵ دقیقه مطالعه",
    publishedAt: "۱۴۰۳/۰۶/۱۵",
    author: {
      name: "مهندس علیرضا رضایی",
      role: "معمار ارشد زیرساخت‌های سیسکو",
      avatarText: "ع‌ر",
    },
    keyTakeaways: [
      "سوئیچ لایه ۲ برای سگمنت‌های محلی و دسترسی کلاینت‌ها (Access Layer) اقتصادی و کافی است.",
      "سوئیچ لایه ۳ گلوگاه Router-on-a-Stick را به کلی حذف کرده و ترافیک بین VLANها را با سرعت سخت‌افزاری هدایت می‌کند.",
      "برای شبکه‌های دارای بیش از ۵۰ کلاینت یا تجهیزات VoIP و دیتاسنتر، استفاده از سوئیچ لایه ۳ در لایه Distribution الزامی است.",
    ],
    tags: ["سوئیچ لایه ۳", "سیسکو", "VLAN", "Inter-VLAN", "Routing"],
    views: "۱,۸۵۰ بازدید",
    badgeColor: "text-orange-400",
    glowColor: "rgba(234, 88, 12, 0.18)",
    imageUrl:
      "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1000&auto=format&fit=crop&q=80",
    gallery: [
      {
        id: "art1-m1",
        type: "image",
        url: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&auto=format&fit=crop&q=80",
        title: "معماری سوئیچ‌های چندلایه‌ای و ترافیک لایه ۳",
        caption: "تفاوت مسیر عبور بسته‌های داده در پردازش سخت‌افزاری ASIC لایه ۳ در برابر سوئیچینگ سنتی",
      },
      {
        id: "art1-m2",
        type: "video",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1000&auto=format&fit=crop&q=80",
        title: "آموزش ویدیویی هدایت ترافیک Inter-VLAN و رفع گلوگاه روتینگ",
        caption: "بررسی سناریوی عملی پیاده‌سازی SVI روی سیسکو کاتالیست و تست سرعت Wire-Speed",
        duration: "۰۴:۲۰",
      },
      {
        id: "art1-m3",
        type: "image",
        url: "https://images.unsplash.com/photo-1520869562399-e772f042f422?w=1200&auto=format&fit=crop&q=80",
        title: "توپولوژی ستون فقرات شبکه و سوئیچ‌های توزیع Distribution",
        caption: "طراحی ریداندنسی با پروتکل‌های HSRP و پیوندهای چندگانه فیبر نوری",
      },
    ],
  },
  {
    id: "art-2",
    title:
      "فیبر نوری سینگل‌مود در برابر مالتی‌مود: راهنمای انتخاب کابل و ماژول SFP+",
    slug: "single-mode-vs-multi-mode-fiber-optic",
    excerpt:
      "راهنمای کاربردی انتخاب میان فیبر Single-Mode و Multi-Mode (OM3/OM4)، تفاوت طول موج‌ها (850nm در برابر 1310nm) و انتخاب ماژول ترنسیور متناسب با فاصله و بودجه.",
    paragraphs: [
      "با افزایش روزافزون حجم داده‌ها و پهنای باند مورد نیاز در دیتاسنترها و شبکه‌های اداری، کابل‌های مسی دیگر پاسخگوی نیازهای ارتباطی فواصل طولانی و سرعت‌های بالای ۱۰G نیستند. در این میان، انتخاب بین کابل فیبر نوری سینگل‌مود (SMF) و مالتی‌مود (MMF) همواره از دغدغه‌های مهندسان خرید و طراحان شبکه است.",
      "فیبرهای نوری مالتی‌مود (به ویژه استانداردهای OM3 و OM4) دارای قطر هسته بزرگتر (۵۰ میکرومتر) هستند که به چندین حالت موجی نور اجازه عبور می‌دهد. این کابل‌ها در ترکیب با ماژول‌های 10GBASE-SR با طول موج ۸۵۰ نانومتر، برای فواصل کوتاه تا ۳۰۰ الی ۴۰۰ متر (درون رک‌ها، اتاق‌های سرور و ارتباط بین طبقات یک ساختمان) بسیار مقرون‌به‌صرفه و بهینه‌اند.",
      "در طرف مقابل، فیبرهای سینگل‌مود (استاندارد OS2) دارای قطر هسته باریک (۹ میکرومتر) هستند که نور لیزر را در یک مسیر مستقیم بدون انکسارهای مخرب هدایت می‌کند. این ویژگی باعث حذف پدیده Modal Dispersion شده و امکان انتقال پهنای باند 10G و حتی 100G را تا فواصل ۱۰، ۴۰ و ۸۰ کیلومتر با ماژول‌های LR و ER فراهم می‌سازد.",
    ],
    category: "fiber",
    categoryName: "فیبر نوری و انتقال",
    readTime: "۷ دقیقه مطالعه",
    publishedAt: "۱۴۰۳/۰۶/۰۲",
    author: {
      name: "مهندس نیما صادقی",
      role: "متخصص ارشد شبکه‌های پسیو و فیبر",
      avatarText: "ن‌ص",
    },
    keyTakeaways: [
      "برای فواصل زیر ۳۰۰ متر درون ساختمان و دیتاسنتر، فیبر OM3/OM4 همراه ترنسیورهای SR اقتصادی‌ترین گزینه است.",
      "برای ارتباط بین ساختمان‌ها، فواصل بالای ۴۰۰ متر و سایت‌های خارج شهری، همواره فیبر سینگل‌مود OS2 با ماژول LR انتخاب شود.",
      "ماژول‌های SFP+ سینگل‌مود نسبت به مالتی‌مود گران‌ترند، اما خود کابل سینگل‌مود هزینه تولید پایین‌تری دارد.",
    ],
    tags: ["فیبر نوری", "سینگل‌مود", "مالتی‌مود", "SFP+", "OM4"],
    views: "۲,۳۴۰ بازدید",
    badgeColor: "text-cyan-400",
    glowColor: "rgba(6, 182, 212, 0.18)",
    imageUrl:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1000&auto=format&fit=crop&q=80",
    gallery: [
      {
        id: "art2-m1",
        type: "image",
        url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80",
        title: "بررسی ساختار فیزیکی کابل‌های فیبر نوری OM4 و OS2",
        caption: "مقایسه قطر هسته ۵۰ میکرومتری مالتی‌مود با هسته ۹ میکرومتری سینگل‌مود",
      },
      {
        id: "art2-m2",
        type: "video",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=1000&auto=format&fit=crop&q=80",
        title: "ویدیو مراحل فیوژن فیبر نوری و تست افت سیگنال با دستگاه OTDR",
        caption: "آموزش گام‌به‌گام کریمپ، کریمپ‌زدایی، پولیش و اتصال فیبر با دستگاه جوش فیوژن",
        duration: "۰۳:۱۰",
      },
      {
        id: "art2-m3",
        type: "image",
        url: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&auto=format&fit=crop&q=80",
        title: "ماژول‌های ترنسیور سیسکو 10G SFP+ و کابل‌های داپلوکس LC",
        caption: "تفاوت ماژول‌های برد کوتاه SR با طول موج ۸۵۰nm و ماژول‌های LR با طول موج ۱۳۱۰nm",
      },
    ],
  },
  {
    id: "art-3",
    title:
      "بهینه‌سازی پهنای باند و QoS در روترهای میکروتیک برای پایداری تماس‌های VoIP",
    slug: "mikrotik-qos-voip-optimization-guide",
    excerpt:
      "آموزش گام‌به‌گام پیاده‌سازی صف‌های اختصاصی Queue Tree و قوانین علامت‌گذاری Mangle در سیستم‌عامل RouterOS برای ریشه‌کن کردن تاخیر، جیتر و افت پکت در ارتباطات صوتی و تصویری.",
    paragraphs: [
      "یکی از رایج‌ترین مشکلات در شبکه‌های سازمانی، افت کیفیت صدای مکالمات سانترال VoIP (نظیر ایزابل، استریسک یا سیسکو CUCM) در زمان دانلود فایل‌های حجیم یا پخش آنلاین ویدیو توسط کاربران است. چشم‌انداز کیفیت سرویس (Quality of Service) بر این اصل استوار است که ترافیک حساس به زمان، باید قبل از سایر داده‌ها در صف ارسال قرار گیرد.",
      "در روترهای میکروتیک، قدرتمندترین ابزار برای کنترل ترافیک، ترکیب تب Mangle در فایروال با ساختار سلسله‌مراتبی Queue Tree است. با علامت‌گذاری بسته‌های ورودی بر مبنای پورت‌های پروتکل SIP (معمولاً UDP 5060) و محدوده‌های صوتی RTP (معمولاً 10000 تا 20000)، می‌توان به این بسته‌ها نشان اختصاصی (Packet Mark) تخصیص داد.",
      "در مرحله بعد، با ایجاد یک صف در Queue Tree با اولویت Priority=1 و اختصاص تضمین حداقل پهنای باند (Limit At)، حتی اگر پهنای باند اینترنت به ۱۰۰٪ اشغال برسد، صدای تلفن‌ها بدون کمترین Jitter و قطعی ارسال خواهد شد و سایر بسته‌های ترافیکی مانند وب‌گردی در اولویت‌های پایین‌تر قرار می‌گیرند.",
    ],
    category: "mikrotik",
    categoryName: "میکروتیک و امنیت",
    readTime: "۶ دقیقه مطالعه",
    publishedAt: "۱۴۰۳/۰۵/۲۰",
    author: {
      name: "مهندس پوریا کریمی",
      role: "مدرس دوره‌های پیشرفته میکروتیک (MTCINE)",
      avatarText: "پ‌ک",
    },
    keyTakeaways: [
      "بسته‌های صوتی VoIP به پهنای باند اندک (حدود ۱۰۰ کیلوبیت بر ثانیه به ازای هر تماس) اما تاخیر زیر ۵۰ میلی‌ثانیه نیاز دارند.",
      "استفاده از Simple Queue برای سازمان‌های پرمصرف مناسب نیست؛ همواره از Queue Tree و علامت‌گذاری Mangle بهره ببرید.",
      "تنظیم مقدار Limit At تضمین می‌کند که سهم پهنای باند تلفن‌ها هرگز توسط سایر دانلودها غصب نشود.",
    ],
    tags: ["میکروتیک", "QoS", "VoIP", "Queue Tree", "RouterOS"],
    views: "۳,۱۱۰ بازدید",
    badgeColor: "text-indigo-400",
    glowColor: "rgba(99, 102, 241, 0.18)",
    imageUrl:
      "https://images.unsplash.com/photo-1520869562399-e772f042f422?w=1000&auto=format&fit=crop&q=80",
    gallery: [
      {
        id: "art3-m1",
        type: "image",
        url: "https://images.unsplash.com/photo-1520869562399-e772f042f422?w=1200&auto=format&fit=crop&q=80",
        title: "پیکربندی صف‌های تو در تو Queue Tree در RouterOS",
        caption: "تنظیم تخصیص تضمین حداقل پهنای باند (Limit At) و حداکثر پهنای باند (Max Limit)",
      },
      {
        id: "art3-m2",
        type: "video",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1000&auto=format&fit=crop&q=80",
        title: "ویدیو آموزش پیکربندی عملی Mangle و اولویت‌بندی VoIP در میکروتیک",
        caption: "علامت‌گذاری پکت‌های پروتکل‌های صوتی SIP و RTP در محیط WinBox",
        duration: "۰۵:۱۵",
      },
      {
        id: "art3-m3",
        type: "image",
        url: "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=1200&auto=format&fit=crop&q=80",
        title: "تست افت پکت و تحلیل شاخص MOS مکالمات صوتی تحت بار ترافیکی",
        caption: "کاهش جیتر ترافیک VoIP به زیر ۵ میلی‌ثانیه حتی در شرایط اشغال کامل پهنای باند خطوط",
      },
    ],
  },
  {
    id: "art-4",
    title:
      "استانداردهای کابل‌کشی ساخت‌یافته و تفاوت Cat6 با Cat6A در استقرار دیتاسنتر",
    slug: "structured-cabling-cat6-vs-cat6a-datacenter",
    excerpt:
      "بررسی دقیق ویژگی‌های الکتریکی، فرکانس کاری، ضخامت هادی مسی و مقابله با نویز بین کابلی (Alien Crosstalk) جهت کابل‌کشی زیرساخت‌های نسل جدید.",
    paragraphs: [
      "کابل‌کشی ساخت‌یافته (Structured Cabling) فونداسیون هر شبکه مدرن است. در صورتی که بستر فیزیکی کابل‌کشی به اشتباه طراحی یا پیاده‌سازی شود، قوی‌ترین سوئیچ‌ها و سرورها نیز با خطاهای پکت (FCS Errors) و افت سرعت دست به گریبان خواهند شد.",
      "کابل‌های Cat6 استاندارد تا فرکانس ۲۵۰ مگاهرتز را پشتیبانی می‌کنند و می‌توانند سرعت 10G را تنها در فواصل کوتاه (حداکثر ۳۷ تا ۵۵ متر در صورت نبود نویز شدید محیطی) انتقال دهند. در مقابل، کابل Cat6A با فرکانس کاری ۵۰۰ مگاهرتز و ساختار ضخیم‌تر شیلددار (مانند SF/UTP یا S/FTP) توانایی تضمین‌شده انتقال 10Gbps را تا ۱۰۰ متر کامل داراست.",
      "در محیط‌های پرتراکم مانند دیتاسنترها که ده‌ها رشته کابل در کنار یکدیگر درون لدر و ترانک قرار می‌گیرند، نویز القایی متقابل میان کابل‌های مجاور (Alien Crosstalk) پدیدار می‌شود. کابل‌های Cat6A با عایق‌بندی تک‌تک زوج‌سیم‌ها این نویز را به صفر رسانده و از استانداردهای TIA/EIA-568 برای ۲۰ سال آینده پشتیبانی می‌کنند.",
    ],
    category: "passive",
    categoryName: "استانداردها و پسیو",
    readTime: "۴ دقیقه مطالعه",
    publishedAt: "۱۴۰۳/۰۵/۰۸",
    author: {
      name: "مهندس فرزاد معتمدی",
      role: "کارشناس استانداردهای کابل‌کشی BICSI",
      avatarText: "ف‌م",
    },
    keyTakeaways: [
      "برای کابل‌کشی ایستگاه‌های کاری عادی، کابل Cat6 UTP مقرون‌به‌صرفه و مناسب است.",
      "برای دیتاسنتر، رک‌های سروری و پیاده‌سازی PoE Type 4، حتماً کابل Cat6A شیلددار انتخاب شود.",
      "رعایت شعاع خمش کابل (Bend Radius) و پرهیز از بستن بیش از حد محکم بست کمربندی، ضامن عبور تست فلوک (Fluke Test) است.",
    ],
    tags: ["Cat6A", "کابل شبکه", "دیتاسنتر", "تست فلوک", "پسیو"],
    views: "۱,۹۸۰ بازدید",
    badgeColor: "text-emerald-400",
    glowColor: "rgba(16, 185, 129, 0.18)",
    imageUrl:
      "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=1000&auto=format&fit=crop&q=80",
    gallery: [
      {
        id: "art4-m1",
        type: "image",
        url: "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=1200&auto=format&fit=crop&q=80",
        title: "برش مقطع عرضی کابل Cat6A S/FTP",
        caption: "شیلد آلومینیومی هر زوج سیم به همراه بافت مسی بیرونی برای مقابله با امواج الکترومغناطیسی",
      },
      {
        id: "art4-m2",
        type: "video",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1000&auto=format&fit=crop&q=80",
        title: "ویدیو راهنمای استاندارد کابل‌کشی دیتاسنتر و جلوگیری از Alien Crosstalk",
        caption: "نکات استاندارد خمیدگی کابل، پرچ کیستون‌های Cat6A و اخذ سرتیفیکیت با تستر Fluke DSX-8000",
        duration: "۰۳:۴۵",
      },
      {
        id: "art4-m3",
        type: "image",
        url: "https://images.unsplash.com/photo-1520869562399-e772f042f422?w=1200&auto=format&fit=crop&q=80",
        title: "گواهی تست پاس‌شده فلوک چنل و پرمننت لینک Cat6A",
        caption: "تاییدیه فرکانس ۵۰۰ مگاهرتز با حاشیه امن بالای ۸ دسی‌بل",
      },
    ],
  },
];
