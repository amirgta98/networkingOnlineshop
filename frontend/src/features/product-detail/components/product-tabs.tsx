"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, BookOpen, MessageSquare, Download } from "lucide-react";
import { ProductDetailTabId, ProductDetailTab } from "../types";
import { toPersianDigits } from "@/shared/lib/utils";

export interface ProductTabsProps {
  activeTab: ProductDetailTabId;
  onTabChange: (tabId: ProductDetailTabId) => void;
  reviewCount?: number;
  className?: string;
}

export function ProductTabs({
  activeTab,
  onTabChange,
  reviewCount = 0,
  className = "",
}: ProductTabsProps) {
  const tabs: (ProductDetailTab & { icon: React.ElementType })[] = [
    {
      id: "specs",
      label: "مشخصات فنی سخت‌افزار",
      icon: SlidersHorizontal,
    },
    {
      id: "overview",
      label: "بررسی تخصصی و معماری",
      icon: BookOpen,
    },
    {
      id: "reviews",
      label: "نظرات و پرسش‌های فنی",
      badge: reviewCount > 0 ? toPersianDigits(reviewCount) : undefined,
      icon: MessageSquare,
    },
    {
      id: "downloads",
      label: "دیتاشیت و مستندات",
      icon: Download,
    },
  ];

  return (
    <div
      className={`border-b border-neutral-800 bg-[#0c0c0e]/80 backdrop-blur-md rounded-2xl p-1.5 ${className}`}
      dir="rtl"
    >
      <div
        className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none"
        role="tablist"
        aria-label="بخش‌های جزئیات محصول"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold transition-colors cursor-pointer select-none whitespace-nowrap ${
                isActive ? "text-white" : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {/* Active animated pill background */}
              {isActive && (
                <motion.div
                  layoutId="activeProductTabIndicator"
                  className="absolute inset-0 rounded-xl bg-neutral-800/95 border border-neutral-700/80 shadow-md"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                />
              )}

              <span className="relative z-10 flex items-center gap-2">
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? "text-orange-400" : "text-neutral-500"
                  }`}
                />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                      isActive
                        ? "bg-orange-500/20 text-orange-300"
                        : "bg-neutral-800 text-neutral-400"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
