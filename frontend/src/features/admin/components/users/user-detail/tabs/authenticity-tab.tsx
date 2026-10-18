"use client";

import * as React from "react";
import type { AdminUserAuthenticity } from "@/features/admin/types/admin-users.types";
import { adminUsersApi } from "@/features/admin/api/admin-users-api";
import { toPersianDigits } from "@/shared/lib/utils";
import {
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  RefreshCw,
  Barcode,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { TabPagination } from "../tab-pagination";

interface AuthenticityTabProps {
  userId: string;
}

export function AuthenticityTab({ userId }: AuthenticityTabProps) {
  const [inquiries, setInquiries] = React.useState<AdminUserAuthenticity[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const pageSize = 6;

  const fetchAuthenticity = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminUsersApi.getUserAuthenticity(userId);
      setInquiries(data || []);
    } catch (err: any) {
      console.error("Failed to load user authenticity inquiries:", err);
      setError("خطا در بارگذاری استعلام‌های اصالت و گارانتی کالا.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    fetchAuthenticity();
  }, [fetchAuthenticity]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4" dir="rtl">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/40 animate-pulse h-36"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-2xl border border-red-500/20 bg-red-500/5 text-center flex flex-col items-center justify-center gap-3" dir="rtl">
        <AlertCircle className="h-8 w-8 text-red-400" />
        <p className="text-sm text-neutral-300 font-medium">{error}</p>
        <Button
          size="sm"
          variant="outline"
          onClick={fetchAuthenticity}
          className="gap-2 border-neutral-700 text-neutral-200"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>تلاش مجدد</span>
        </Button>
      </div>
    );
  }

  if (inquiries.length === 0) {
    return (
      <div className="p-12 rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/20 text-center flex flex-col items-center justify-center gap-3" dir="rtl">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-800 text-neutral-400">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-bold text-white">هیچ استعلام اصالتی ثبت نشده است</h3>
        <p className="text-xs text-neutral-400 max-w-sm">
          این کاربر تا کنون شماره سریال یا کد هولوگرام قطعه‌ای را جهت راستی‌آزمایی اصالت در سامانه استعلام نکرده است.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      <div className="flex items-center justify-between text-xs text-neutral-400">
        <span>استعلام‌های اصالت و گارانتی: <strong className="text-white font-mono">{toPersianDigits(inquiries.length)}</strong> مورد</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {inquiries
          .slice((currentPage - 1) * pageSize, currentPage * pageSize)
          .map((inq) => (
          <div
            key={inq.id}
            className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-4 ${
              inq.isAuthentic
                ? "border-emerald-500/30 bg-neutral-900/60 hover:border-emerald-500/50"
                : "border-red-500/30 bg-neutral-900/60 hover:border-red-500/50"
            }`}
          >
            <div className="flex flex-col gap-3">
              {/* Header: Product & Badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                      inq.isAuthentic
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                    }`}
                  >
                    {inq.isAuthentic ? (
                      <ShieldCheck className="h-5 w-5" />
                    ) : (
                      <ShieldAlert className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                      {inq.productName}
                    </h4>
                    <span className="text-[11px] text-neutral-400">
                      برند: {inq.brand} {inq.model ? `| مدل: ${inq.model}` : ""}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full border font-semibold shrink-0 ${
                    inq.isAuthentic
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-red-500/10 text-red-400 border-red-500/30"
                  }`}
                >
                  {inq.statusLabel || (inq.isAuthentic ? "اصالت تایید شده" : "فاقد اصالت")}
                </span>
              </div>

              {/* Serial & Hologram */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs">
                <div>
                  <span className="text-neutral-500 block text-[11px]">شماره سریال قطعه:</span>
                  <span className="font-mono text-emerald-300 font-bold tracking-wider" dir="ltr">
                    {inq.serialNumber}
                  </span>
                </div>
                {inq.hologramCode && (
                  <div>
                    <span className="text-neutral-500 block text-[11px]">کد امنیتی هولوگرام:</span>
                    <span className="font-mono text-neutral-200" dir="ltr">
                      {inq.hologramCode}
                    </span>
                  </div>
                )}
              </div>

              {/* Warranty & Remaining Days */}
              <div className="flex items-center justify-between text-xs text-neutral-300 pt-1">
                <span className="text-[11px] text-neutral-400">
                  نوع ضمانت: <strong className="text-white">{inq.warrantyType}</strong>
                </span>

                {inq.daysRemaining > 0 ? (
                  <span className="text-[11px] text-emerald-400 font-medium">
                    {toPersianDigits(inq.daysRemaining)} روز باقیمانده از گارانتی
                  </span>
                ) : (
                  <span className="text-[11px] text-neutral-500 font-medium">
                    گارانتی منقضی شده
                  </span>
                )}
              </div>
            </div>

            {/* Footer: Date & IP */}
            <div className="flex items-center justify-between pt-3 border-t border-neutral-800/80 text-[11px] text-neutral-500">
              <span className="flex items-center gap-1 font-mono">
                <Calendar className="h-3 w-3" />
                {inq.createdAt}
              </span>

              {inq.inquiryIp && (
                <span className="font-mono" dir="ltr">
                  IP: {inq.inquiryIp}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <TabPagination
        currentPage={currentPage}
        totalItems={inquiries.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
