import * as React from "react";
import { FileText, Download, ShieldCheck, HardDriveDownload } from "lucide-react";
import { Product } from "@/features/catalog/types";
import { DownloadItem } from "../types";

export interface ProductDownloadsProps {
  product: Product;
  className?: string;
}

export function ProductDownloads({ product, className = "" }: ProductDownloadsProps) {
  const downloads: DownloadItem[] = [
    {
      id: "dl-1",
      title: `دیتاشیت فنی رسمی ${product.name}`,
      fileName: `${product.sku || product.slug}-datasheet.pdf`,
      fileSize: "۲.۴ مگابایت",
      format: "PDF",
      description: "مشخصات کامل سخت‌افزاری، معماری ASIC، نمودار پورت‌ها و جداول توان مصرفی",
      downloadUrl: "#",
    },
    {
      id: "dl-2",
      title: "راهنمای نصب و راه‌اندازی سریع در رک (Quick Start Guide)",
      fileName: `${product.sku || product.slug}-qig.pdf`,
      fileSize: "۱.۱ مگابایت",
      format: "PDF",
      description: "دستورالعمل بستن گوشواره‌های رک، اتصال کابل پاور و دسترسی به پورت کنسول",
      downloadUrl: "#",
    },
    {
      id: "dl-3",
      title: "آرشیو فایل‌های SNMP MIB و تمپلیت‌های مانیتورینگ Zabbix",
      fileName: `${product.sku || product.slug}-mibs-v2.zip`,
      fileSize: "۵۸۰ کیلوبایت",
      format: "ZIP",
      description: "فایل‌های تعریف سنسورهای مانیتورینگ ترافیک پورت‌ها، دما و وضعیت منبع تغذیه",
      downloadUrl: "#",
    },
  ];

  return (
    <div
      className={`rounded-3xl border border-neutral-800/80 bg-[#111114] p-5 sm:p-7 flex flex-col gap-6 ${className}`}
      dir="rtl"
    >
      <div className="border-b border-neutral-800/80 pb-4">
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          <HardDriveDownload className="h-5 w-5 text-orange-400" />
          <span>مستندات، فایل‌ها و دیتاشیت‌های فنی {product.name}</span>
        </h2>
        <p className="mt-1 text-xs text-neutral-400">
          دانلود مستقیم اسناد رسمی کمپانی سازنده بدون نیاز به عضویت
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {downloads.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-neutral-800/80 bg-[#141418] p-4 transition-all duration-200 hover:border-neutral-700"
          >
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-950/30 border border-orange-500/20 text-orange-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-white">
                    {item.title}
                  </h3>
                  <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[9px] font-mono font-bold text-neutral-300">
                    {item.format}
                  </span>
                </div>
                <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
                  {item.description}
                </p>
                <span className="mt-1 inline-block text-[10px] font-mono text-neutral-500">
                  {item.fileName} ({item.fileSize})
                </span>
              </div>
            </div>

            <a
              href={item.downloadUrl}
              download={item.fileName}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700 px-4 py-2.5 text-xs font-bold transition-all shrink-0 active:scale-95"
            >
              <Download className="h-3.5 w-3.5 text-orange-400" />
              <span>دانلود فایل</span>
            </a>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs text-neutral-400 pt-2 border-t border-neutral-800/60">
        <ShieldCheck className="h-4 w-4 text-emerald-400" />
        <span>تمامی فایل‌ها توسط اسکنر امنیتی ققنوس آکادمی بررسی و عاری از هرگونه ویروس می‌باشند.</span>
      </div>
    </div>
  );
}
