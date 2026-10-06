import { SupportTicket } from "../types/support.types";

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: "tkt-01",
    ticketNumber: "TCK-1403-772",
    subject: "مشکل در ترانکینگ 802.1Q و Native VLAN روی سوئیچ سیسکو ۲۹۶۰",
    department: "cisco_switching",
    departmentLabel: "دپارتمان سوئیچینگ و روترهای سازمانی (CCIE)",
    priority: "high",
    priorityLabel: "اولویت بالا",
    status: "answered",
    statusLabel: "پاسخ داده شد توسط کارشناس ارشد",
    createdAt: "۱۴۰۳/۰۸/۲۴ - ۱۱:۳۰",
    updatedAt: "۱۴۰۳/۰۸/۲۴ - ۱۲:۰۵",
    assignedEngineer: {
      name: "مهندس شایان کاظمی",
      title: "معمار ارشد زیرساخت شبکه (CCIE Enterprise #48192)",
    },
    messages: [
      {
        id: "msg-1",
        senderName: "عرفان رضایی",
        senderRole: "user",
        content: "با سلام و احترام، دو دستگاه سوئیچ ۲۹۶۰ سیسکو با پورت گیگابیت آپلینک به هم متصل هستند. ترافیک VLAN 10 به درستی عبور می‌کند اما پکت‌های VLAN 20 روی پورت Trunk دیسکارد می‌شوند. فایل شو رانینگ کانفیگ ضمیمه شده است.",
        createdAt: "۱۴۰۳/۰۸/۲۴ - ۱۱:۳۰",
        attachments: [
          { name: "Cisco2960_SwitchA_running_config.txt", size: "18 KB", type: "config" },
        ],
      },
      {
        id: "msg-2",
        senderName: "مهندس شایان کاظمی (CCIE)",
        senderRole: "engineer_ccie",
        content: "درود بر شما جناب مهندس، لاگ ارسالی بررسی شد. بر روی پورت Gi0/24 سوئیچ B دستور switchport trunk allowed vlan تنظیم شده و عدد 20 در لیست مجاز تعریف نشده بود. لطفاً دستور زیر را در مد اینترفیس وارد فرمایید:\n\ninterface GigabitEthernet0/24\n switchport trunk allowed vlan add 20\n\nهمچنین تست پینگ را مجدداً تکرار فرمایید. نتیجه را به من اطلاع دهید.",
        createdAt: "۱۴۰۳/۰۸/۲۴ - ۱۲:۰۵",
      },
    ],
  },
  {
    id: "tkt-02",
    ticketNumber: "TCK-1403-609",
    subject: "استعلام تاییدیه رسمی تست فلوک کابل‌های نگزنس پچ پنل",
    department: "fiber_cabling",
    departmentLabel: "کابل‌کشی ساختاریافته و فیبر نوری",
    priority: "normal",
    priorityLabel: "عادی",
    status: "resolved",
    statusLabel: "حل شده و بسته",
    createdAt: "۱۴۰۳/۰۸/۱۰ - ۰۹:۰۰",
    updatedAt: "۱۴۰۳/۰۸/۱۰ - ۱۰:۱۵",
    assignedEngineer: {
      name: "مهندس فرشاد نوری",
      title: "متخصص فلوک نتورکز و تست‌های OTDR",
    },
    messages: [
      {
        id: "msg-3",
        senderName: "عرفان رضایی",
        senderRole: "user",
        content: "سلام، فایل PDF کارنامه تست فلوک DSX-8000 مربوط به فاکتور INV-1403-8821 جهت تحویل به ناظر پروژه مورد نیاز است.",
        createdAt: "۱۴۰۳/۰۸/۱۰ - ۰۹:۰۰",
      },
      {
        id: "msg-4",
        senderName: "مهندس فرشاد نوری",
        senderRole: "engineer_ccie",
        content: "با احترام، فایل رسمی پاس فلوک پرمننت با حاشیه امن ۶ دسی‌بل به پیوست تیکت ارسال گردید. فایل ممهور به مهر واحد لابراتوار شبکه ولوکس می‌باشد.",
        createdAt: "۱۴۰۳/۰۸/۱۰ - ۱۰:۱۵",
        attachments: [
          { name: "Fluke_DSX8000_Report_PermanentLink.pdf", size: "1.4 MB", type: "doc" },
        ],
      },
    ],
  },
];
