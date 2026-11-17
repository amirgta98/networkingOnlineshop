import Link from "next/link";
import { ArrowRight, FileQuestion } from "lucide-react";

export default function GlobalNotFound() {
  return (
    <div
      className="flex min-h-[70vh] items-center justify-center px-4 py-20"
      dir="rtl"
    >
      <div className="mx-auto max-w-md rounded-3xl border border-neutral-800 bg-[#111114]/90 p-8 text-center shadow-2xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-400">
          <FileQuestion className="h-7 w-7" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white">
          صفحه مورد نظر یافت نشد (۴۰۴)
        </h1>
        <p className="mt-3 text-xs sm:text-sm leading-relaxed text-neutral-400">
          صفحه‌ای که به دنبال آن هستید حذف شده، منتقل شده یا آدرس آن تغییر کرده است.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-500 px-5 py-2.5 text-xs font-bold text-white transition-colors"
          >
            <span>بازگشت به صفحه اصلی</span>
            <ArrowRight className="h-4 w-4 rotate-180" />
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900 hover:border-neutral-600 px-5 py-2.5 text-xs font-semibold text-neutral-200 transition-colors"
          >
            <span>کاتالوگ محصولات</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
