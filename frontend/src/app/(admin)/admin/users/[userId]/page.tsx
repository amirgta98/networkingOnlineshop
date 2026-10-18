import * as React from "react";
import type { Metadata } from "next";
import { UserDetailView } from "@/features/admin";

interface PageProps {
  params: Promise<{ userId: string }>;
}

export const metadata: Metadata = {
  title: "پروفایل و مدیریت کاربر | پنل مدیریت ققنوس آکادمی",
  description: "مشاهده جزییات حساب کاربری، آدرس‌ها، سبد خرید، سفارش‌ها، کیف پول، استعلام‌ها و نشست‌های فعال.",
};

export default async function AdminUserDetailPage({ params }: PageProps) {
  const { userId } = await params;

  return (
    <React.Suspense
      fallback={
        <div className="flex flex-col gap-6 p-4 sm:p-8 max-w-7xl mx-auto" dir="rtl">
          <div className="h-28 w-full bg-neutral-900/60 rounded-2xl border border-neutral-800 animate-pulse" />
          <div className="h-12 w-full bg-neutral-900/40 rounded-2xl border border-neutral-800 animate-pulse" />
          <div className="h-96 w-full bg-neutral-900/20 rounded-2xl border border-neutral-800 animate-pulse" />
        </div>
      }
    >
      <UserDetailView userId={userId} />
    </React.Suspense>
  );
}
