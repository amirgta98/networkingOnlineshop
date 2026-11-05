"use client";

import * as React from "react";
import { User } from "lucide-react";

export interface AuthorAvatarProps {
  avatarUrl?: string | null;
  name?: string | null;
  role?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  imgClassName?: string;
  shape?: "rounded-lg" | "rounded-xl" | "rounded-2xl" | "rounded-full";
}

export function extractInitials(name?: string | null, fallback = "ق"): string {
  if (!name || !name.trim()) return fallback;
  // Remove common Persian titles
  const clean = name.replace(/^(مهندس|دکتر|خانم|آقای|استاد)\s+/i, "").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}‌${parts[1].charAt(0)}`;
  }
  return parts[0]?.charAt(0) || fallback;
}

const SIZE_MAP = {
  xs: {
    container: "h-6 w-6 text-[10px]",
    icon: "h-3 w-3",
  },
  sm: {
    container: "h-8 w-8 text-xs",
    icon: "h-4 w-4",
  },
  md: {
    container: "h-10 w-10 text-sm",
    icon: "h-5 w-5",
  },
  lg: {
    container: "h-11 w-11 text-sm",
    icon: "h-5 w-5",
  },
  xl: {
    container: "h-12 w-12 text-base",
    icon: "h-6 w-6",
  },
};

export function AuthorAvatar({
  avatarUrl,
  name,
  role,
  size = "sm",
  className = "",
  imgClassName = "",
  shape = "rounded-xl",
}: AuthorAvatarProps) {
  const [hasError, setHasError] = React.useState(false);

  // Reset error when URL changes
  React.useEffect(() => {
    setHasError(false);
  }, [avatarUrl]);

  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.sm;

  // Determine if avatarUrl looks like a real image URL
  const trimmedUrl = avatarUrl?.trim();
  const isImageCandidate =
    trimmedUrl &&
    !hasError &&
    (trimmedUrl.startsWith("/") ||
      trimmedUrl.startsWith("http://") ||
      trimmedUrl.startsWith("https://") ||
      trimmedUrl.startsWith("data:image"));

  const initials = extractInitials(name);

  if (isImageCandidate) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden ${shape} border border-orange-500/30 bg-neutral-900 ${sizeConfig.container} ${className}`}
        title={name ? `${name}${role ? ` (${role})` : ""}` : undefined}
      >
        <img
          src={trimmedUrl}
          alt={name || "نویسنده"}
          onError={() => setHasError(true)}
          className={`h-full w-full object-cover ${imgClassName}`}
          loading="lazy"
        />
      </div>
    );
  }

  // Graceful Fallback: Initials or User Icon
  return (
    <div
      className={`flex shrink-0 items-center justify-center ${shape} bg-gradient-to-br from-orange-600/25 via-neutral-900 to-amber-600/15 border border-orange-500/30 text-orange-400 font-bold font-mono shadow-sm select-none ${sizeConfig.container} ${className}`}
      title={name ? `${name}${role ? ` (${role})` : ""}` : undefined}
    >
      {initials ? (
        <span>{initials}</span>
      ) : (
        <User className={`${sizeConfig.icon} text-orange-400`} />
      )}
    </div>
  );
}
