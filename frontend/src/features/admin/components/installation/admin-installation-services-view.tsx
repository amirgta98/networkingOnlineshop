"use client";

import * as React from "react";
import Link from "next/link";
import {
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Layers,
  Server,
  Network,
  Camera,
  Wifi,
  Cpu,
  Zap,
  Hammer,
} from "lucide-react";
import { INSTALLATION_SERVICES } from "@/features/installation/mock-data/installation-data";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";

const ICON_MAP: Record<string, React.ElementType> = {
  network: Network,
  server: Server,
  camera: Camera,
  wifi: Wifi,
  cpu: Cpu,
  zap: Zap,
  layers: Layers,
};

export function AdminInstallationServicesView() {
  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Info */}
      <div className="p-5 rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[var(--theme-foreground)]">
            کاتالوگ و تعرفه خدمات اجرای شبکه و پسیو
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            استانداردهای مهندسی بین‌المللی (TIA-568-D، TIA-942)، ابزارهای تست فلوک و تعرفه‌های مصوب پایه
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/installation" target="_blank">
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 text-xs text-neutral-300 border-neutral-700"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>مشاهده در پرتال عمومی</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {INSTALLATION_SERVICES.map((svc) => {
          const IconComp = ICON_MAP[svc.iconName] || Wrench;
          return (
            <div
              key={svc.id}
              className="rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 space-y-4 hover:border-orange-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0">
                    <IconComp className="h-5 w-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
                    {svc.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-neutral-200">{svc.title}</h3>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed line-clamp-2">
                    {svc.shortDesc}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-neutral-800/80 text-xs">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>استاندارد مرجع:</span>
                    <span className="font-mono text-[11px] text-neutral-300">{svc.standard}</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>مدت گارانتی مکتوب:</span>
                    <span className="font-bold text-emerald-400">
                      {toPersianDigits(svc.warrantyMonths)} ماه طلایی
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>تخمین زمان اجرا:</span>
                    <span className="text-neutral-300">{svc.durationEstimate}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-neutral-400 block mb-1">
                    ابزارهای سنجش و اجرای پروژه:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {svc.toolsUsed.map((tool, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-300"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price footer */}
              <div className="pt-4 border-t border-[var(--theme-border-color)] flex items-center justify-between">
                <span className="text-[11px] text-neutral-400">{svc.unit}</span>
                <span className="text-xs font-bold text-orange-400">
                  شروع از {formatPrice(svc.basePriceEstimate)} تومان
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
