import Link from "next/link";
import { ArrowRight, PackageX } from "lucide-react";
import { Container } from "@/shared/components/ui/container";

export default function ProductNotFound() {
  return (
    <div className="py-20 sm:py-28 min-h-[60vh] flex items-center" dir="rtl">
      <Container>
        <div className="mx-auto max-w-lg rounded-3xl border border-neutral-800 bg-[#111114]/90 p-8 sm:p-10 text-center shadow-2xl">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-400">
            <PackageX className="h-7 w-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            محصول مورد نظر یافت نشد
          </h1>
          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-neutral-400">
            این محصول ممکن است از کاتالوگ حذف شده باشد، آدرس آن تغییر کرده باشد یا در حال حاضر غیرفعال باشد.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-500 px-5 py-2.5 text-xs font-bold text-white transition-colors"
            >
              <span>مشاهده همه محصولات</span>
              <ArrowRight className="h-4 w-4 rotate-180" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900 hover:border-neutral-600 px-5 py-2.5 text-xs font-semibold text-neutral-200 transition-colors"
            >
              <span>صفحه اصلی</span>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
