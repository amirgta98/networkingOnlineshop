import { JobPosition, CareerPerk } from "../types";

export const OPEN_POSITIONS: JobPosition[] = [
  {
    id: "senior-network-engineer",
    title: "مهندس ارشد شبکه و زیرساخت",
    department: "واحد فنی و پشتیبانی",
    type: "تمام وقت (حضوری)",
    experience: "+۳ سال سابقه تخصصی",
    location: "تهران — سهروردی",
    badge: "فوری",
    skills: ["Cisco CCNP", "MikroTik MTCNA", "کانفیگ سوئیچ و روتر", "عیب‌یابی زیرساخت"],
  },
  {
    id: "b2b-sales-specialist",
    title: "کارشناس فروش تجهیزات سازمانی (B2B)",
    department: "دپارتمان فروش و بازرگانی",
    type: "تمام وقت (حضوری)",
    experience: "+۲ سال سابقه فروش تجهیزات IT",
    location: "تهران — سهروردی",
    badge: "پورسانت عالی",
    skills: ["مذاکره سازمانی", "استعلامات و مناقصات", "آشنایی با سخت‌افزار شبکه", "CRM"],
  },
  {
    id: "passive-fiber-tech",
    title: "تکنسین فیبر نوری و پسیو شبکه",
    department: "واحد اجرا و پروژه‌ها",
    type: "پروژه‌ای / تمام وقت",
    experience: "+۱ سال سابقه اجرایی",
    location: "تهران و پروژه‌های سراسری",
    skills: ["فیوژن فیبر نوری", "تست فلوک (Fluke)", "آرایش رک و پچ‌پنل", "کابل‌کشی ساخت‌یافته"],
  },
  {
    id: "content-seo-specialist",
    title: "کارشناس تولید محتوا و سئو تخصصی IT",
    department: "دپارتمان مارکتینگ",
    type: "هیبریدی (حضوری / دورکاری)",
    experience: "+۲ سال سابقه کاری",
    location: "تهران",
    skills: ["تولید محتوای تخصصی شبکه", "سئو On-Page", "ترجمه متون فنی سخت‌افزار", "تحلیل سرچ کنسول"],
  },
];

export const CAREER_PERKS: CareerPerk[] = [
  {
    id: "growth",
    title: "رشد و ارتقای حرفه‌ای مستمر",
    description: "کار در کنار متخصصان ارشد شبکه، دسترسی به جدیدترین تجهیزات سیسکو و حمایت مالی در آزمون‌های بین‌المللی.",
    iconName: "trending-up",
  },
  {
    id: "stability",
    title: "امنیت شغلی و مزایای سازمانی",
    description: "قرارداد رسمی، پرداخت منظم، بیمه تامین اجتماعی از روز اول، بیمه تکمیلی درمان و بسته‌های رفاهی دوره‌ای.",
    iconName: "shield",
  },
  {
    id: "hardware",
    title: "تجهیزات و محیط کاری مدرن",
    description: "سیستم‌های کاری ارتقایافته، لابراتوار اختصاصی تست شبکه و ابزارهای استاندارد اندازه‌گیری و کانفیگ.",
    iconName: "cpu",
  },
  {
    id: "culture",
    title: "فرهنگ سازمانی پویا و مشارکتی",
    description: "فضای شفاف، جلسات بازخورد دوطرفه، فعالیت‌های تیمی و محیطی محترمانه که صدای هر عضو شنیده می‌شود.",
    iconName: "users",
  },
];
