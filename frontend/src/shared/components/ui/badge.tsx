import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default: "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900",
        secondary: "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200",
        outline: "border border-neutral-200 text-neutral-800 dark:border-neutral-700 dark:text-neutral-200",
        success: "bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40",
        warning: "bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40",
        destructive: "bg-red-50 text-red-700 border border-red-200/60 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
