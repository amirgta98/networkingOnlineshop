"use client";

import * as React from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Award,
  Users,
  Cpu,
  FileCheck2,
} from "lucide-react";
import { INSTALLATION_GUARANTEES } from "../mock-data/installation-data";

export function InstallationGuarantees() {
  const getGuaranteeIcon = (iconName: string) => {
    switch (iconName) {
      case "fluke":
        return <FileCheck2 className="h-6 w-6 text-amber-400" />;
      case "shield-check":
        return <ShieldCheck className="h-6 w-6 text-emerald-400" />;
      case "award":
        return <Award className="h-6 w-6 text-blue-400" />;
      default:
        return <Users className="h-6 w-6 text-purple-400" />;
    }
  };

  return (
    <section className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-2 text-right">
        <div className="inline-flex items-center gap-1.5 self-start text-xs font-bold text-emerald-400">
          <ShieldCheck className="h-4 w-4" />
          <span>تضمین رسمی کیفیت و مسئولیت‌پذیری</span>
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">
          استانداردهای کیفی و ضمانت‌نامه مکتوب ققنوس آکادمی
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
          ما کیفیت اجرای فیزیکی و سیگنالی زیرساخت شما را با قوی‌ترین تعهدات حقوقی و مهندسی بیمه و تضمین می‌کنیم.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {INSTALLATION_GUARANTEES.map((item) => (
          <div
            key={item.title}
            className={`rounded-2xl border ${item.border} bg-gradient-to-b ${item.color} p-5 flex flex-col justify-between text-right backdrop-blur-sm shadow-lg`}
          >
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black/40 border border-white/10 mb-4">
                {getGuaranteeIcon(item.iconName)}
              </div>
              <h3 className="text-sm font-bold text-white mb-2 leading-snug">
                {item.title}
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              <span>GUARANTEED BY GHOGHNOOS ACADEMY</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
