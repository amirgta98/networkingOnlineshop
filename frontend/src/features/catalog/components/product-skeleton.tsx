import * as React from "react";

export function ProductSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-[#111114] p-0 animate-pulse" dir="rtl">
      <div className="aspect-[16/10] sm:aspect-[4/3] w-full bg-neutral-900" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-3 w-16 rounded bg-neutral-800" />
          <div className="h-3 w-12 rounded bg-neutral-800" />
        </div>
        <div className="h-4 w-3/4 rounded bg-neutral-800" />
        <div className="h-3 w-full rounded bg-neutral-850" />
        <div className="pt-3 border-t border-neutral-800/80 flex justify-between items-center">
          <div className="h-5 w-24 rounded bg-neutral-800" />
          <div className="h-9 w-full rounded-xl bg-neutral-800 mt-2" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5" dir="rtl">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}
