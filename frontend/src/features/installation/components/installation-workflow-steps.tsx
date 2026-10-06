"use client";

import * as React from "react";
import {
  FileText,
  MapPin,
  Calculator,
  Wrench,
  Award,
  Clock,
  ArrowDown,
} from "lucide-react";
import { INSTALLATION_WORKFLOW_STEPS } from "../mock-data/installation-data";

export function InstallationWorkflowSteps() {
  const getStepIcon = (iconName: string) => {
    switch (iconName) {
      case "file-text":
        return <FileText className="h-5 w-5 text-orange-400" />;
      case "map-pin":
        return <MapPin className="h-5 w-5 text-sky-400" />;
      case "calculator":
        return <Calculator className="h-5 w-5 text-emerald-400" />;
      case "tool":
        return <Wrench className="h-5 w-5 text-amber-400" />;
      default:
        return <Award className="h-5 w-5 text-purple-400" />;
    }
  };

  return (
    <section id="installation-workflow" className="scroll-mt-24 space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-2 text-right">
        <div className="inline-flex items-center gap-1.5 self-start text-xs font-bold text-orange-400">
          <Clock className="h-4 w-4" />
          <span>مراحل اجرای مهندسی و شفاف</span>
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">
          ۵ گام از ثبت درخواست تا تحویل سرتیفیکیت نهایی
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
          فرآیند کاری ما کاملاً شفاف، قابل پیگیری و بر پایه زمان‌بندی دقیق بدون هرگونه وقفه ناگهانی طراحی شده است.
        </p>
      </div>

      {/* Steps List */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {INSTALLATION_WORKFLOW_STEPS.map((stepItem, index) => (
          <div
            key={stepItem.step}
            className="relative rounded-2xl border border-neutral-800/90 bg-[#121216]/95 p-5 flex flex-col justify-between text-right group hover:border-neutral-700 transition-colors"
          >
            {/* Top row with Step number + Duration */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-2xl font-black text-orange-500/40 group-hover:text-orange-500 transition-colors">
                  {stepItem.step}
                </span>
                <span className="text-[10px] font-medium text-neutral-400 bg-neutral-800/80 px-2 py-0.5 rounded-full">
                  {stepItem.duration}
                </span>
              </div>

              {/* Icon & Title */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-800/80 border border-neutral-700/50">
                  {getStepIcon(stepItem.iconName)}
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
                  {stepItem.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-xs text-neutral-400 leading-relaxed mt-2">
                {stepItem.description}
              </p>
            </div>

            {/* Bottom connector indicator */}
            <div className="mt-4 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-[10px] text-neutral-500">
              <span>گام {index + 1} از ۵</span>
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-700 group-hover:bg-orange-500 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
