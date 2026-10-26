import * as React from "react";
import type { Metadata } from "next";
import { AdminInstallationDetailView } from "@/features/admin";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "مدیریت و جزئیات پروژه پسیو شبکه | پنل مدیریت ققنوس آکادمی",
  description:
    "مشاهده و ویرایش مشخصات پروژه، مراحل اجرایی، تخصیص سرپرست تیم فنی و صدور پیش‌فاکتور مصوب.",
};

export default async function AdminInstallationDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <React.Suspense
      fallback={
        <div className="flex flex-col gap-6 p-4 max-w-7xl mx-auto" dir="rtl">
          <div className="h-24 w-full bg-neutral-900/60 rounded-2xl border border-neutral-800 animate-pulse" />
          <div className="h-64 w-full bg-neutral-900/40 rounded-2xl border border-neutral-800 animate-pulse" />
        </div>
      }
    >
      <AdminInstallationDetailView id={id} />
    </React.Suspense>
  );
}
