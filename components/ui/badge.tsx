import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  style,
  children,
}: React.PropsWithChildren<{ className?: string; style?: React.CSSProperties }>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        className,
      )}
      style={style}
    >
      {children}
    </span>
  );
}
