import * as React from "react";
import { ShieldCheck, Cpu, Clock, FileText } from "lucide-react";

export function ProductTrustBadges({ className = "" }: { className?: string }) {
  const badges = [
    {
      icon: ShieldCheck,
      title: "ضمانت ۱۰۰٪ اصالت تجهیزات",
      desc: "تضمین اصالت اورجینال کمپانی سازنده با سریال نامبر استعلام‌پذیر",
    },
    {
      icon: Cpu,
      title: "تست فلوک و مهلت تست ۷ روزه",
      desc: "تمامی تجهیزات پیش از تحویل بررسی و دارای مهلت تست سلامت می‌باشند",
    },
    {
      icon: Clock,
      title: "ارسال سریع سراسری",
      desc: "تحویل فوری در تهران زیر ۲ ساعت و ارسال اکسپرس به کلیه شهرستان‌ها",
    },
    {
      icon: FileText,
      title: "فاکتور رسمی حقوقی",
      desc: "امکان صدور فاکتور رسمی با شناسه ملی و گواهی ارزش افزوده برای سازمان‌ها",
    },
  ];

  return (
    <div
      className={`grid grid-cols-2 lg:grid-cols-4 gap-3 ${className}`}
      dir="rtl"
    >
      {badges.map(({ icon: Icon, title, desc }, idx) => (
        <div
          key={idx}
          className="flex flex-col gap-1.5 rounded-2xl border border-neutral-800/80 bg-[#121215] p-3.5 transition-all duration-300 hover:border-neutral-700/90"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-950/30 border border-orange-500/20 text-orange-400 mb-1">
            <Icon className="h-4 w-4" />
          </div>
          <h2 className="text-xs font-bold text-neutral-200">{title}</h2>
          <p className="text-[11px] leading-relaxed text-neutral-400">{desc}</p>
        </div>
      ))}
    </div>
  );
}
