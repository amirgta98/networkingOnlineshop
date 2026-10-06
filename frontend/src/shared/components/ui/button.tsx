import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

/**
 * Button — Shared UI Component
 *
 * All color tokens reference CSS variables from the central theme system
 * (--theme-primary, --theme-foreground, etc.) so the button automatically
 * responds to runtime theme changes from the Admin Theme Customizer.
 *
 * Never hardcode hex values here — always use CSS variable references.
 */
export const buttonVariants = cva(
  // Base: layout, transitions, focus ring, interactions
  [
    "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium",
    "transition-all duration-150 cursor-pointer select-none",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.97]",
    // Focus: web-interface-guidelines — never outline-none without replacement
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--theme-background)]",
  ],
  {
    variants: {
      variant: {
        /** Primary action — uses --theme-primary */
        default: [
          "bg-[var(--theme-primary)] text-white shadow-sm",
          "hover:opacity-90",
        ],
        /** Secondary muted action */
        secondary: [
          "bg-[var(--theme-surface-alt)] text-[var(--theme-foreground)]",
          "hover:bg-[var(--theme-muted-bg)]",
          "border border-[var(--theme-border-color)]",
        ],
        /** Outlined — transparent background */
        outline: [
          "border border-[var(--theme-border-color)] bg-transparent",
          "text-[var(--theme-foreground)]",
          "hover:bg-[var(--theme-surface-alt)]",
        ],
        /** Ghost — no background or border */
        ghost: [
          "text-[var(--theme-muted)] hover:bg-[var(--theme-surface-alt)]",
          "hover:text-[var(--theme-foreground)]",
        ],
        /** Accent — uses --theme-accent (LED green / status) */
        accent: [
          "bg-[var(--theme-accent)] text-white shadow-sm",
          "hover:opacity-90",
        ],
        /** Destructive — danger actions only */
        destructive: [
          "bg-red-600 text-white shadow-sm hover:bg-red-700",
          "focus-visible:ring-red-500",
        ],
      },
      size: {
        sm:   "h-8 px-3 text-xs rounded-[var(--theme-radius-sm)]",
        md:   "h-10 px-4 text-sm rounded-[var(--theme-radius-base)]",
        lg:   "h-12 px-6 text-base rounded-[var(--theme-radius-lg)]",
        icon: "h-10 w-10 p-0 rounded-[var(--theme-radius-base)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Shows a spinner and disables the button while true. */
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
