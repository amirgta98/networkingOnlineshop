import * as React from "react";
import { ShieldCheck, Network, Cpu, Zap, Layers, Server } from "lucide-react";
import { Product } from "@/features/catalog/types";

export interface ProductOverviewProps {
  product: Product;
  className?: string;
}

export function ProductOverview({ product, className = "" }: ProductOverviewProps) {
  const highlights = [
    {
      icon: Cpu,
      title: "معماری پردازش و توان عملیاتی بدون وقفه",
      desc: `دستگاه ${product.name} با بهره‌گیری از چیپ‌ست‌های مهندسی‌شده پردازش پکت‌ها در لایه سخت‌افزار (ASIC)، سوئیچینگ بدون انسداد (Non-blocking) را در بالاترین بار کاری شبکه تضمین می‌نماید.`,
    },
    {
      icon: ShieldCheck,
      title: "امنیت جامع لایه ۲ و ۳ شبکه",
      desc: "پشتیبانی از کنترل دسترسی پیشرفته (ACLs)، ایزولاسیون VLAN، محافظت در برابر حملات Broadcast Storm و حفاظت از درگاه‌های پورت با مکانیزم‌های 802.1X.",
    },
    {
      icon: Network,
      title: "پایداری لینک و ریداندنسی در سطح سازمانی",
      desc: "امکان تجمیع خطوط با پروتکل LACP (Link Aggregation)، پشتیبانی از پروتکل‌های درخت پوشا (STP/RSTP/MSTP) جهت حذف حلقه‌های ترافیکی و بازیابی لینک زیر چند میلی‌ثانیه.",
    },
    {
      icon: Zap,
      title: "مدیریت بهینه انرژی و توان خروجی",
      desc: "طراحی منطبق بر استانداردهای بازدهی انرژی IEEE 802.3az به همراه کنترل دینامیک دور فن‌ها متناسب با بار حرارتی دستگاه، تضمین‌کننده عملکرد خنک، کم‌صدا و بادوام در رک‌های سرور.",
    },
  ];

  return (
    <div
      className={`rounded-3xl border border-neutral-800/80 bg-[#111114] p-5 sm:p-7 flex flex-col gap-8 ${className}`}
      dir="rtl"
    >
      {/* ── Section Title ─────────────────────────────────────────────────── */}
      <div className="border-b border-neutral-800/80 pb-5">
        <h2 className="text-lg sm:text-xl font-black text-white">
          بررسی تخصصی و معماری سخت‌افزاری {product.name}
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-3xl">
          تحلیل فنی زیرساخت، مزیت‌های رقابتی در کاربردهای انترپرایز و راهنمای استقرار در دیتاسنترها و شبکه‌های اداری پرتردد.
        </p>
      </div>

      {/* ── Feature Highlights Grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {highlights.map(({ icon: Icon, title, desc }, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3.5 rounded-2xl border border-neutral-800 bg-[#141418] p-4 sm:p-5 transition-all duration-300 hover:border-neutral-700 hover:bg-[#16161b]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-950/30 border border-orange-500/20 text-orange-400">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-100">{title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-neutral-400">
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Deployment Architecture Box ──────────────────────────────────── */}
      <div className="rounded-2xl border border-neutral-800 bg-[#0f0f12] p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <Server className="h-5 w-5 text-orange-400" />
          <h3 className="text-sm sm:text-base font-bold text-white">
            سناریوهای توصیه شده برای استقرار (Deployment Scenarios)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/60 p-3.5">
            <span className="inline-block rounded-md bg-orange-600/20 px-2 py-0.5 text-[10px] font-bold text-orange-400 mb-2">
              لایه دسترسی (Access Layer)
            </span>
            <h4 className="text-xs font-bold text-neutral-200">
              شعب و سازمان‌های متوسط و بزرگ
            </h4>
            <p className="mt-1 text-[11px] leading-relaxed text-neutral-400">
              اتصال ایستگاه‌های کاری، دوربین‌های نظارتی مداربسته با توان PoE و اکسس‌پوینت‌های اداری بدون تاخیر.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/60 p-3.5">
            <span className="inline-block rounded-md bg-emerald-600/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 mb-2">
              لایه توزیع (Distribution)
            </span>
            <h4 className="text-xs font-bold text-neutral-200">
              تجمیع لینک‌های فیبر نوری
            </h4>
            <p className="mt-1 text-[11px] leading-relaxed text-neutral-400">
              اتصال آپلینک‌های پرسرعت 1G/10G میان طبقات و بخش‌های مختلف ساختمان به سوی هسته مرکزی شبکه.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/60 p-3.5">
            <span className="inline-block rounded-md bg-indigo-600/20 px-2 py-0.5 text-[10px] font-bold text-indigo-400 mb-2">
              رک سرور دیتاسنتر (Top-of-Rack)
            </span>
            <h4 className="text-xs font-bold text-neutral-200">
              مدیریت و مانیتورینگ سرورها
            </h4>
            <p className="mt-1 text-[11px] leading-relaxed text-neutral-400">
              مناسب اتصال پورت‌های مدیریتی IPMI، iLO و سیستم‌های پردازش ذخیره‌سازی داده (NAS/SAN).
            </p>
          </div>
        </div>
      </div>

      {/* ── Summary & Recommendation ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-emerald-300">
              تاییدیه تیم مهندسی ولوکس ققنوس آکادمی
            </h4>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              این مدل بالاترین بازدهی کارایی به قیمت را در میان تجهیزات هم‌رده سال جاری ثبت کرده است.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
