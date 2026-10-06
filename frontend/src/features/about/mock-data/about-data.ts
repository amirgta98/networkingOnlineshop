import {
  MilestoneItem,
  CoreValueItem,
  TeamMember,
  StatItem,
  ContactChannel,
  PartnerBrand,
  AboutFAQItem,
} from "../types";

export const ABOUT_STATS: StatItem[] = [
  {
    id: "experience",
    value: 15,
    suffix: "+ سال",
    label: "سابقه تخصصی زیرساخت",
    sublabel: "پیشرو در تامین و اجرای شبکه‌های سازمانی",
    iconName: "award",
  },
  {
    id: "clients",
    value: 12400,
    suffix: "+",
    label: "مشتری سازمانی و همکار",
    sublabel: "بانک‌ها، پتروشیمی، دانشگاه‌ها و ارگان‌ها",
    iconName: "users",
  },
  {
    id: "projects",
    value: 860,
    suffix: "+ پروژه",
    label: "پروژه دیتاسنتر و کابل‌کشی",
    sublabel: "با صدور سرتیفیکیت رسمی تست فلوک",
    iconName: "server",
  },
  {
    id: "authenticity",
    value: 100,
    suffix: "٪",
    label: "تضمین اصالت کالا",
    sublabel: "کارت طلایی گارانتی تعویض ۱۸ ماهه",
    iconName: "shieldCheck",
  },
  {
    id: "products",
    value: 4500,
    suffix: "+ قلم",
    label: "تنوع کالا در انبار مرکزی",
    sublabel: "تجهیزات پسیو، اکتیو، رک و فیبر نوری",
    iconName: "package",
  },
  {
    id: "uptime",
    value: 24,
    suffix: "/۷",
    label: "پشتیبانی و کشیک فنی",
    sublabel: "مشاوره مهندسی و امداد فوری شبکه",
    iconName: "clock",
  },
];

export const MILESTONES: MilestoneItem[] = [
  {
    id: "1391",
    year: "۱۳۹۱",
    title: "تاسیس و راه‌اندازی هسته اولیه",
    summary:
      "تاسیس ققنوس آکادمی با تمرکز بر توزیع بدون واسطه کابل‌های شبکه Cat6 و پچ‌پنل‌های لگراند فرانسه و نگزانس بلژیک.",
    badge: "نقطه آغاز",
    metrics: "تامین ۵۰ پروژه اداری در سال اول",
    iconName: "flag",
  },
  {
    id: "1394",
    year: "۱۳۹۴",
    title: "ورود به حوزه تجهیزات اکتیو سیسکو",
    summary:
      "اخذ مجوز بازرگانی مستقیم و آغاز واردات سوئیچ‌های سری Catalyst، روترهای ISR و ماژول‌های فیبر نوری اورجینال سیسکو.",
    badge: "توسعه بازرگانی",
    metrics: "تامین نیاز ۳۰۰ ارگان دولتی و خصوصی",
    iconName: "network",
  },
  {
    id: "1397",
    year: "۱۳۹۷",
    title: "تاسیس انبار مکانیزه و لابراتوار فنی",
    summary:
      "بهره‌برداری از انبار ۳۰۰۰ متری در تهران و تجهیز آزمایشگاه اختصاصی تست سخت‌افزاری و بردهای سوئیچ تحت لود واقعی.",
    badge: "زیرساخت لجستیک",
    metrics: "کاهش زمان تحویل به کمتر از ۳ ساعت در تهران",
    iconName: "server",
  },
  {
    id: "1400",
    year: "۱۴۰۰",
    title: "راه‌اندازی پرتال هوشمند همکاران B2B",
    summary:
      "رونمایی از سیستم استعلام آنی قیمت سازمانی، فاکتور رسمی با کد اقتصادی و اتصال مستقیم پیمانکاران شبکه در سراسر کشور.",
    badge: "تحول دیجیتال",
    metrics: "بیش از ۳۵۰۰ همکار فعال ثبت‌شده",
    iconName: "shield",
  },
  {
    id: "1402",
    year: "۱۴۰۲",
    title: "تجهیز ناوگان تست فلوک DSX-8000",
    summary:
      "خرید پیشرفته‌ترین دستگاه‌های تست فلوک سری Cat8 و آغاز ارائه گارانتی تعویض بی قید و شرط ۱۸ ماهه برای کلیه پروژه‌ها.",
    badge: "استاندارد جهانی",
    metrics: "تست و تایید بیش از ۱۲۰ هزار نود شبکه",
    iconName: "award",
  },
  {
    id: "1405",
    year: "۱۴۰۵ (اکنون)",
    title: "بزرگترین پلتفرم تخصصی شبکه ایران",
    summary:
      "تبدیل ققنوس آکادمی به مرجع اول استعلام، مشاوره مهندسی، تامین آنلاین و اجرای پروژه‌های دیتاسنتر و کابل‌کشی ساختاریافته در کشور.",
    badge: "پیشرو صنعت",
    metrics: "۱۲۴۰۰+ مشتری و تامین ۹۸٪ نیازمندی‌های شبکه",
    iconName: "sparkles",
  },
];

export const CORE_VALUES: CoreValueItem[] = [
  {
    id: "authenticity",
    title: "اصالت قطعی ۱۰۰٪ قطعات",
    description:
      "تمام سوئیچ‌ها، ماژول‌ها و کابل‌ها همراه با هولوگرام اصالت، سریال نامبر قابل استعلام از پایگاه سازنده و برگه سبز ترخیص گمرکی ارائه می‌شوند.",
    highlight: "ضمانت مادام‌العمر اصالت",
    iconName: "shieldCheck",
  },
  {
    id: "engineering",
    title: "مشاوره مهندسی عمیق قبل از خرید",
    description:
      "کارشناسان فنی ما دارای مدارک بین‌المللی CCIE، CCNP و فلوک هستند و پیش از نهایی شدن خرید، دیاگرام شبکه و سناریوی توسعه شما را به دقت ارزیابی می‌کنند.",
    highlight: "مشاوره کاملاً رایگان",
    iconName: "cpu",
  },
  {
    id: "speed",
    title: "لجستیک برق‌آسا و اکسپرس",
    description:
      "با داشتن انبار مکانیزه در تهران، سفارش‌های فوری شهر تهران ظرف کمتر از ۳ ساعت و سفارش‌های شهرستان‌ها با بسته‌بندی امن ظرف ۲۴ ساعت تحویل می‌شوند.",
    highlight: "تحویل فوق سریع انبار",
    iconName: "truck",
  },
  {
    id: "support",
    title: "پشتیبانی و کشیک ۲۴/۷ شبکه",
    description:
      "مشکلات شبکه زمان نمی‌شناسند؛ تیم فنی و پشتیبان اورژانسی ققنوس آکادمی در تمام ساعات شبانه‌روز و حتی روزهای تعطیل پاسخگوی موارد اضطراری دیتاسنترهاست.",
    highlight: "پاسخگویی بدون وقفه",
    iconName: "headset",
  },
  {
    id: "pricing",
    title: "قیمت‌گذاری شفاف و بی‌واسطه",
    description:
      "به دلیل واردات مستقیم بدون دخالت دلالان و واسطه‌ها، همواره منصفانه‌ترین قیمت‌های بازار همراه با فاکتور رسمی معتبر شرکتی را دریافت می‌کنید.",
    highlight: "فاکتور رسمی معتبر مالیاتی",
    iconName: "tag",
  },
  {
    id: "warranty",
    title: "گارانتی طلایی تعویض ۱۸ ماهه",
    description:
      "سخت‌افزارهای تحویل شده تحت پوشش گارانتی طلایی تعویض قطعه در صورت بروز نقص فنی هستند تا کارفرمایان با خیالی کاملا آسوده سرمایه‌گذاری کنند.",
    highlight: "۱۸ ماه تعویض بی‌قید و شرط",
    iconName: "refreshCw",
  },
];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "rezaei",
    name: "مهندس علیرضا رضایی",
    role: "مدیرعامل و بنیان‌گذار",
    department: "مدیریت ارشد",
    certification: "Cisco CCIE Enterprise #48921",
    experience: "۱۸ سال تجربه",
    bio: "طراح و ناظر ارشد بیش از ۵۰ دیتاسنتر بانکی و سازمانی در کشور، متخصص زیرساخت‌های پرسرعت فیبر نوری و معماری شبکه‌های مقیاس‌پذیر.",
    avatarInitials: "ع‌ر",
    email: "rezaei@ghoghnoos.academy",
    linkedin: "https://linkedin.com",
  },
  {
    id: "mohammadi",
    name: "مهندس سارا محمدی",
    role: "معاونت فنی و طراحی زیرساخت",
    department: "دپارتمان مهندسی",
    certification: "CCNP Data Center & VMware VCP",
    experience: "۱۳ سال تجربه",
    bio: "راهبر پروژه‌های کابل‌کشی ساختاریافته در پروژه‌های ملی، متخصص آزمون‌های اعتبارسنجی فرکانسی و تحلیل تست ریپورت‌های فلوک DSX-8000.",
    avatarInitials: "س‌م",
    email: "mohammadi@ghoghnoos.academy",
    linkedin: "https://linkedin.com",
  },
  {
    id: "kazemi",
    name: "مهندس محمدرضا کاظمی",
    role: "سرپرست لابراتوار تست و کنترل کیفیت",
    department: "کیفیت و بازرسی کالا",
    certification: "Fluke Networks Certified Trainer",
    experience: "۱۲ سال تجربه",
    bio: "مسئول ارزیابی اصالت بردهای سخت‌افزاری سوئیچ‌های سیسکو، تست توان پاورها، حرارت‌سنجی قطعات و تضمین بدون نقص بودن کالاهای ارسالی.",
    avatarInitials: "م‌ک",
    email: "kazemi@ghoghnoos.academy",
    linkedin: "https://linkedin.com",
  },
  {
    id: "sharifi",
    name: "مریم شریفی",
    role: "مدیر فروش و خدمات مشتریان سازمانی B2B",
    department: "فروش سازمانی",
    certification: "Executive MBA & CRM Master",
    experience: "۱۰ سال تجربه",
    bio: "هماهنگ‌کننده قراردادهای کلان دولتی و خصوصی، نظارت بر ارسال به موقع فاکتورهای رسمی و پیگیری رضایت‌سنجی مداوم کارفرمایان محترم.",
    avatarInitials: "م‌ش",
    email: "sharifi@ghoghnoos.academy",
    linkedin: "https://linkedin.com",
  },
  {
    id: "nikpour",
    name: "مهندس کامران نیک‌پور",
    role: "معمار ارشد امنیت شبکه و فایروال",
    department: "امنیت سایبری",
    certification: "Fortinet NSE 7 & Palo Alto PCNSE",
    experience: "۱۱ سال تجربه",
    bio: "پیکربندی سناریوهای HA، پیاده‌سازی فایروال‌های پیشرفته نسل جدید FortiGate و سیسکو ASA، و بهینه‌سازی جریان داده‌ها در شبکه‌های حیاتی.",
    avatarInitials: "ک‌ن",
    email: "nikpour@ghoghnoos.academy",
    linkedin: "https://linkedin.com",
  },
];

export const CONTACT_CHANNELS: ContactChannel[] = [
  {
    id: "main-phone",
    title: "خط ویژه ارتباط و مشاوره",
    subtitle: "پاسخگویی اصلی، مشاوره خرید و خدمات",
    primaryValue: "۰۹۱۳۴۷۶۱۰۹۷",
    actionLabel: "تماس مستقیم",
    actionHref: "tel:09134761097",
    badge: "شماره اصلی",
    type: "phone",
  },
  {
    id: "support-phone-1",
    title: "خط تماس پشتیبانی و فروش",
    subtitle: "پاسخگویی سریع کارشناسان و پیگیری سفارشات",
    primaryValue: "۰۹۲۲۴۷۶۱۰۹۷",
    actionLabel: "تماس با خط ۲",
    actionHref: "tel:09224761097",
    badge: "خط همراه ۲",
    type: "phone",
  },
  {
    id: "support-phone-2",
    title: "خط تماس مشاوره فنی و زیرساخت",
    subtitle: "مشاوره تخصصی دوره‌ها و راهکارهای شبکه",
    primaryValue: "۰۹۳۵۴۷۶۱۰۹۷",
    actionLabel: "تماس با خط ۳",
    actionHref: "tel:09354761097",
    badge: "خط همراه ۳",
    type: "phone",
  },
  {
    id: "support-phone-3",
    title: "خط تماس کشیک شبانه‌روزی",
    subtitle: "پشتیبانی اضطراری حوادث و عیب‌یابی ۲۴ ساعته",
    primaryValue: "۰۹۰۰۴۷۶۱۰۹۷",
    actionLabel: "تماس با خط ۴",
    actionHref: "tel:09004761097",
    badge: "۲۴/۷ فعال",
    type: "phone",
  },
  {
    id: "whatsapp",
    title: "ارتباط مستقیم در واتس‌اپ",
    subtitle: "ارسال لیست قطعات و پیام فوری در پیام‌رسان",
    primaryValue: "۰۹۱۳۴۷۶۱۰۹۷",
    actionLabel: "شروع چت واتس‌اپ",
    actionHref: "https://wa.me/989134761097",
    badge: "پاسخگویی آنلاین",
    type: "messenger",
  },
  {
    id: "email",
    title: "ایمیل رسمی و مکاتبات سازمانی",
    subtitle: "ارسال مناقصات، درخواست‌های دولتی و اسناد رسمی",
    primaryValue: "info@ghoghnoos.academy",
    actionLabel: "ارسال ایمیل",
    actionHref: "mailto:info@ghoghnoos.academy",
    badge: "رسمی",
    type: "email",
  },
];

export const OFFICE_LOCATION = {
  city: "تهران",
  fullAddress:
    "تهران، خیابان ولیعصر، بالاتر از تقاطع میرداماد، مجتمع تجاری و اداری پایتخت، برج شماره ۲، طبقه ۷، واحد ۷۰۴",
  postalCode: "۱۹۶۹۷۶۴۳۲۱",
  centralWarehouse:
    "تهران، جاده مخصوص کرج، کیلومتر ۱۱، شهرک صنعتی استقلال، خیابان شهید مطهری، پلاک ۱۸ (محل بارگیری و ارسال اکسپرس)",
  workingHoursWeekday: "شنبه تا چهارشنبه: ۸:۳۰ صبح الی ۱۸:۰۰ عصر",
  workingHoursThursday: "پنج‌شنبه‌ها: ۸:۳۰ صبح الی ۱۴:۰۰ بعدازظهر",
  technicalEmergency: "پشتیبانی فنی و قطعی‌های بحرانی: ۲۴ ساعته / ۷ روز هفته",
  metroAccess: "ایستگاه مترو میرداماد (خط ۱) — فاصله پیاده‌روی: ۵ دقیقه",
  brtAccess: "ایستگاه بی‌آرتی میرداماد — خط تجریش به راه‌آهن",
  coordinates: {
    lat: 35.7592,
    lng: 51.4116,
  },
  googleMapsUrl: "https://maps.google.com/?q=35.7592,51.4116",
  wazeUrl: "https://waze.com/ul?ll=35.7592,51.4116&navigate=yes",
  neshanUrl: "https://neshan.org/maps/@35.7592,51.4116,16z",
  baladUrl: "https://balad.ir/location?latitude=35.7592&longitude=51.4116",
};

export const PARTNER_BRANDS: PartnerBrand[] = [
  {
    id: "cisco",
    name: "Cisco Systems",
    tier: "تامین‌کننده ارشد سوئیچ و روتر",
    description: "سوئیچ‌های سری Catalyst، روترهای ISR و سوئیچ‌های Nexus با لایسنس معتبر",
    country: "آمریکا",
  },
  {
    id: "mikrotik",
    name: "MikroTik",
    tier: "توزیع‌کننده رسمی تجهیزات روتینگ",
    description: "روتربوردهای سری Cloud Core، اکسس‌پوینت‌های اداری و سوئیچ‌های سری CRS",
    country: "لتونی",
  },
  {
    id: "legrand",
    name: "Legrand France",
    tier: "پارتنر رسمی زیرساخت پسیو",
    description: "کابل‌های شبکه Cat6 UTP/SFTP، کیستون، پچ‌پنل و ترانک لگراند اورجینال",
    country: "فرانسه",
  },
  {
    id: "nexans",
    name: "Nexans Cabling",
    tier: "همکار رسمی تجهیزات پسیو مس و فیبر",
    description: "کابل‌های نسوز، کابل‌های تست پاس، پچ‌کورد و پچ‌پنل‌های پرسرعت نگزانس",
    country: "بلژیک",
  },
  {
    id: "fluke",
    name: "Fluke Networks",
    tier: "تجهیزات مرجع تست و اعتبارسنجی",
    description: "دستگاه‌های آنالیز شبکه DSX-8000 و ادوات فیوژن و بازرسی متالیک فیبر نوری",
    country: "آمریکا",
  },
  {
    id: "schneider",
    name: "Schneider Electric",
    tier: "تجهیزات توزیع توان و رک",
    description: "رک‌های سرور استاندارد، پاور ماژول‌های هوشمند PDU و ادوات مدیریت حرارتی",
    country: "فرانسه",
  },
];

export const ABOUT_FAQS: AboutFAQItem[] = [
  {
    id: "faq-1",
    category: "company",
    question: "ققنوس آکادمی چه تفاوتی با سایر فروشندگان تجهیزات شبکه دارد؟",
    answer:
      "ققنوس آکادمی تنها یک فروشگاه کالای ساده نیست، بلکه یک تیم مهندسی تخصصی زیرساخت است. تمامی محصولات ما مستقیماً وارد شده، در لابراتوار تخصصی تست فنی می‌شوند، با گارانتی طلایی تعویض ۱۸ ماهه ارائه می‌گردند و پیش از خرید، مشاوره تخصصی مهندسی توسط دارندگان مدارک CCIE به کارفرمایان ارائه می‌شود.",
  },
  {
    id: "faq-2",
    category: "warranty",
    question: "شرایط گارانتی و نحوه احراز اصالت قطعات به چه صورت است؟",
    answer:
      "کلیه کالاهای ققنوس آکادمی با سریال نامبر یکتا در سیستم ثبت شده و دارای کارت گارانتی معتبر شرکتی هستند. در صورت بروز هرگونه عیب سخت‌افزاری طی ۱۸ ماه، قطعه معیوب بدون اتلاف وقت تعویض خواهد شد. همچنین اصالت کالاها از طریق سریال نامبر در وبسایت رسمی سازنده (مانند Cisco و MikroTik) کاملاً قابل اعتبارسنجی است.",
  },
  {
    id: "faq-3",
    category: "procurement",
    question: "آیا برای خریدهای سازمانی و دولتی فاکتور رسمی و کد اقتصادی صادر می‌شود؟",
    answer:
      "بله، ققنوس آکادمی یک شرکت ثبت‌شده رسمی با شناسه ملی و گواهی ارزش افزوده فعال است. کلیه سفارش‌ها همراه با فاکتور رسمی معتبر در سامانه مودیان مالیاتی کشور ثبت و ارائه می‌گردند.",
  },
  {
    id: "faq-4",
    category: "visit",
    question: "آیا امکان مراجعه حضوری و رویت کالاها قبل از خرید وجود دارد؟",
    answer:
      "بله، کارفرمایان و همکاران گرامی می‌توانند در ساعات اداری (شنبه تا چهارشنبه ۸:۳۰ تا ۱۸:۰۰) با هماهنگی قبلی به دفتر مرکزی ققنوس آکادمی در برج پایتخت مراجعه فرمایند و کالاها و تجهیزات نمونه را از نزدیک بررسی نمایند.",
  },
  {
    id: "faq-5",
    category: "procurement",
    question: "سفارش‌ها چگونه به شهرستان‌ها ارسال می‌شوند و چقدر زمان می‌برد؟",
    answer:
      "سفارش‌های تهران با پیک اختصاصی ظرف کمتر از ۳ ساعت و سفارش‌های شهرستان با بسته‌بندی ضدضربه از طریق باربری‌های معتبر، تیپاکس اکسپرس، یا خطوط هوایی ظرف ۲۴ الی ۴۸ ساعت به مقصد می‌رسند.",
  },
];
