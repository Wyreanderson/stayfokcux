import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-12 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] px-4 text-base text-[var(--color-fg)] placeholder:text-[var(--color-fg-dim)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-[120px] w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] px-4 py-3 text-base text-[var(--color-fg)] placeholder:text-[var(--color-fg-dim)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "h-12 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] px-4 text-base text-[var(--color-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";
