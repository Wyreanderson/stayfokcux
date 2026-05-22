import { CheckSquare } from "lucide-react";

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <CheckSquare
        size={size}
        className="text-[var(--color-primary)]"
        strokeWidth={2.5}
      />
      <span className="font-bold tracking-tight">
        <span className="text-[var(--color-fg)]">stay</span>
        <span className="text-[var(--color-primary)]">fokcux</span>
      </span>
    </div>
  );
}
