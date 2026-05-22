import * as React from "react";
import { cn } from "@/lib/utils";

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.25)]",
      className,
    )}
    {...props}
  />
));
Card.displayName = "Card";
