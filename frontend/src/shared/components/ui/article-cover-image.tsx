"use client";

import * as React from "react";
import Image from "next/image";
import { BookOpen, Sparkles } from "lucide-react";

export interface ArticleCoverImageProps {
  src?: string | null;
  alt: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
  containerClassName?: string;
  unoptimized?: boolean;
}

export function ArticleCoverImage({
  src,
  alt,
  fill = true,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  className = "object-cover transition-transform duration-500 group-hover/img:scale-105",
  unoptimized = false,
}: ArticleCoverImageProps) {
  const [hasError, setHasError] = React.useState(false);
  const [fallbackFailed, setFallbackFailed] = React.useState(false);

  React.useEffect(() => {
    setHasError(false);
    setFallbackFailed(false);
  }, [src]);

  const cleanSrc = src?.trim();
  const defaultAsset = "/images/defaults/article-default.webp";

  // If initial src is invalid or empty, immediately use default asset
  const effectiveSrc = !cleanSrc || hasError ? defaultAsset : cleanSrc;

  if (fallbackFailed) {
    // Pure CSS/SVG Inline Fallback if even static image failed
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0c0d14] via-[#121624] to-[#0a0c12] p-6 text-center select-none overflow-hidden">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(249,115,22,0.3) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600/20 border border-orange-500/40 text-orange-400 mb-3 shadow-lg shadow-orange-950/50">
          <BookOpen className="h-7 w-7" />
        </div>
        <div className="relative text-sm font-bold text-white max-w-[85%] truncate mb-1">
          {alt || "دانشنامه و مقالات تخصصی"}
        </div>
        <div className="relative text-[11px] text-neutral-400 flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-orange-400" />
          <span>ققنوس آکادمی • تحلیل و بررسی فنی</span>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={effectiveSrc}
      alt={alt || "مقاله تخصصی"}
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
