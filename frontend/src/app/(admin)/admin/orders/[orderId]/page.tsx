import * as React from "react";
import type { Metadata } from "next";
import { AdminOrderDetailView } from "@/features/admin";

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export const metadata: Metadata = {
  title: "پرونده و جزئیات سفارش | پنل مدیریت ققنوس آکادمی",
  description: "مشاهده جزئیات کامل سفارش، اقلام و تجهیزات سخت‌افزاری شبکه، صورت‌حساب مالی، اطلاعات خریدار و رهگیری بارنامه.",
};

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { orderId } = await params;

  return (
    <React.Suspense
      fallback={
        <div className="flex flex-col gap-6 p-4 sm:p-8 max-w-7xl mx-auto" dir="rtl">
          <div className="h-28 w-full bg-neutral-900/60 rounded-3xl border border-neutral-800 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="h-24 bg-neutral-900/40 rounded-2xl border border-neutral-800 animate-pulse" />
            <div className="h-24 bg-neutral-900/40 rounded-2xl border border-neutral-800 animate-pulse" />
            <div className="h-24 bg-neutral-900/40 rounded-2xl border border-neutral-800 animate-pulse" />
            <div className="h-24 bg-neutral-900/40 rounded-2xl border border-neutral-800 animate-pulse" />
          </div>
        </div>
      }
    >
      <AdminOrderDetailView orderId={orderId} />
    </React.Suspense>
  );
}
