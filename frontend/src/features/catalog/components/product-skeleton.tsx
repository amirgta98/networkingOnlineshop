import * as React from "react";

export function ProductSkeleton() {
  return (
    <div className="flex flex-row sm:flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-[#111114] p-0 animate-pulse" dir="rtl">
      <div className="w-28 xs:w-36 sm:w-full shrink-0 self-stretch sm:self-auto sm:aspect-[4/3] min-h-[140px] xs:min-h-[160px] sm:min-h-0 bg-neutral-900" />
      <div className="flex flex-1 flex-col p-2.5 xs:p-3 sm:p-4 space-y-3 min-w-0 justify-between">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="h-3 w-16 rounded bg-neutral-800" />
            <div className="h-3 w-12 rounded bg-neutral-800" />
          </div>
          <div className="h-4 w-3/4 rounded bg-neutral-800" />
          <div className="hidden sm:block h-3 w-full rounded bg-neutral-850" />
        </div>
        <div className="pt-2 sm:pt-3 border-t border-neutral-800/80 flex flex-col gap-2">
          <div className="h-4 w-20 rounded bg-neutral-800" />
          <div className="flex items-center gap-1.5 sm:gap-2 w-full">
            <div className="h-8 xs:h-9 sm:h-10 flex-1 rounded-xl bg-neutral-800" />
            <div className="h-8 xs:h-9 sm:h-10 w-8 xs:w-9 sm:w-16 rounded-xl bg-neutral-800 shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 w-full max-w-full" dir="rtl">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}
