import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-2xl text-base font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--color-primary)] text-[#0a2e28] hover:bg-[var(--color-primary-hover)]",
        secondary:
          "bg-[var(--color-bg-card)] text-[var(--color-fg)] border border-[var(--color-border)] hover:bg-[var(--color-bg-elev)]",
        ghost:
          "bg-transparent text-[var(--color-fg)] hover:bg-[var(--color-bg-card)]",
        danger: "bg-red-500/90 text-white hover:bg-red-500",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-12 px-5",
        lg: "h-14 px-6 text-lg",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";
