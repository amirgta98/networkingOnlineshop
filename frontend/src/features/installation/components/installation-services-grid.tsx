"use client";

import * as React from "react";
import {
  Network,
  Server,
  Camera,
  Wifi,
  Cpu,
  Zap,
  Shield,
  Wrench,
  CheckCircle2,
  ArrowLeft,
  ChevronDown,
  Sparkles,
  Info,
} from "lucide-react";
import { INSTALLATION_SERVICES } from "../mock-data/installation-data";
import { InstallationServiceCategory, InstallationServiceItem } from "../types";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";

interface InstallationServicesGridProps {
  selectedServiceId: InstallationServiceCategory;
  onSelectService: (serviceId: InstallationServiceCategory) => void;
}

export function InstallationServicesGrid({
  selectedServiceId,
  onSelectService,
}: InstallationServicesGridProps) {
  const [expandedServiceId, setExpandedServiceId] = React.useState<string | null>(null);

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case "network":
        return <Network className="h-5 w-5 text-orange-400" />;
      case "server":
        return <Server className="h-5 w-5 text-amber-400" />;
      case "camera":
        return <Camera className="h-5 w-5 text-sky-400" />;
      case "wifi":
        return <Wifi className="h-5 w-5 text-emerald-400" />;
      case "cpu":
        return <Cpu className="h-5 w-5 text-indigo-400" />;
      case "zap":
        return <Zap className="h-5 w-5 text-yellow-400" />;
      case "shield":
        return <Shield className="h-5 w-5 text-teal-400" />;
      default:
        return <Wrench className="h-5 w-5 text-neutral-400" />;
    }
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedServiceId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="installation-services" className="scroll-mt-24 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-2 text-right">
        <div className="inline-flex items-center gap-1.5 self-start text-xs font-bold text-orange-400">
          <Sparkles className="h-4 w-4" />
          <span>خدمات مهندسی شبکه و زیرساخت</span>
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">
          دسته‌بندی تخصص‌ها و خدمات اجرایی ققنوس آکادمی
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
          کلیه خدمات بر اساس چک‌لیست‌های بین‌المللی TIA/EIA و BICSI با مدرن‌ترین تجهیزات کالیبره انجام می‌شوند.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {INSTALLATION_SERVICES.map((service) => {
          const isSelected = selectedServiceId === service.id;
          const isExpanded = expandedServiceId === service.id;

          return (
            <div
              key={service.id}
              onClick={() => onSelectService(service.id)}
              className={`group relative rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "border-orange-500 bg-orange-950/20 shadow-lg shadow-orange-950/40 ring-1 ring-orange-500/50"
                  : "border-neutral-800/80 bg-[#121216]/90 hover:border-neutral-700 hover:bg-neutral-900/60"
              }`}
            >
              {/* Top Row: Icon + Badge */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
                      isSelected
                        ? "bg-orange-500/20 border-orange-500/40"
                        : "bg-neutral-800/60 border-neutral-700/50 group-hover:border-neutral-600"
                    }`}
                  >
                    {getServiceIcon(service.iconName)}
                  </div>
                  <span className="text-[10px] font-semibold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
                    {service.badge}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-white text-right leading-snug pt-1">
                  {service.title}
                </h3>

                {/* Short Desc */}
                <p className="text-xs text-neutral-400 text-right leading-relaxed line-clamp-3">
                  {service.shortDesc}
                </p>

                {/* Collapsible features drawer */}
                {isExpanded && (
                  <div className="pt-3 border-t border-neutral-800/80 space-y-2.5 text-right animate-fade-in">
                    <p className="text-[11px] text-neutral-300 leading-relaxed">
                      {service.fullDesc}
                    </p>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-neutral-400">ویژگی‌های شاخص:</span>
                      {service.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[11px] text-neutral-300">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-1 text-[10px] text-neutral-500">
                      <span>ابزارهای مورد استفاده: </span>
                      <span className="text-neutral-400">{service.toolsUsed.join(" • ")}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 mt-3 border-t border-neutral-800/60 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={(e) => toggleExpand(service.id, e)}
                  className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <span>{isExpanded ? "بستن جزئیات" : "مشاهده جزئیات"}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      isExpanded ? "rotate-180 text-orange-400" : ""
                    }`}
                  />
                </button>

                <div
                  className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors ${
                    isSelected
                      ? "bg-orange-500 text-white"
                      : "bg-neutral-800 text-neutral-300 group-hover:bg-neutral-700"
                  }`}
                >
                  <span>{isSelected ? "انتخاب شده" : "انتخاب"}</span>
                  <ArrowLeft className="h-3 w-3" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
