"use client";

import * as React from "react";
import Image from "next/image";
import { Server, Briefcase } from "lucide-react";

export interface PortfolioCoverImageProps {
  src?: string | null;
  alt: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
  containerClassName?: string;
  unoptimized?: boolean;
}

export function PortfolioCoverImage({
  src,
  alt,
  fill = true,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  className = "object-cover transition-transform duration-500 group-hover/img:scale-105",
  unoptimized = false,
}: PortfolioCoverImageProps) {
  const [hasError, setHasError] = React.useState(false);
  const [fallbackFailed, setFallbackFailed] = React.useState(false);

  React.useEffect(() => {
    setHasError(false);
    setFallbackFailed(false);
  }, [src]);

  const cleanSrc = src?.trim();
  const defaultAsset = "/images/defaults/portfolio-default.webp";

  const effectiveSrc = !cleanSrc || hasError ? defaultAsset : cleanSrc;

  if (fallbackFailed) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#080c14] via-[#0f172a] to-[#0a101d] p-6 text-center select-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(16,185,129,0.3) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 mb-3 shadow-lg shadow-emerald-950/50">
          <Server className="h-7 w-7" />
        </div>
        <div className="relative text-sm font-bold text-white max-w-[85%] truncate mb-1">
          {alt || "پروژه مهندسی ققنوس"}
        </div>
        <div className="relative text-[11px] text-neutral-400 flex items-center gap-1">
          <Briefcase className="h-3 w-3 text-emerald-400" />
          <span>پروژه‌های اجرایی، دیتاسنتر و زیرساخت شبکه</span>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={effectiveSrc}
      alt={alt || "پروژه مهندسی"}
      fill={fill}
      priority={priority}
      sizes={sizes}
      unoptimized={unoptimized}
      onError={() => {
        if (!hasError) {
          setHasError(true);
        } else {
          setFallbackFailed(true);
        }
      }}
      className={className}
    />
  );
}
