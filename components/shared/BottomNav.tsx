"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { History, ListTodo, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Fila", icon: ListTodo, match: (p: string) => p === "/" },
  { href: "/modo-caos", label: "Modo Caos", icon: Zap, match: (p: string) => p.startsWith("/modo-caos") },
  { href: "/historico", label: "Histórico", icon: History, match: (p: string) => p.startsWith("/historico") },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 border-t border-[var(--color-border)] bg-[var(--color-bg-elev)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-bg-elev)]/80 pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-3 max-w-md mx-auto">
        {items.map((it) => {
          const active = it.match(pathname);
          const Icon = it.icon;
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium",
                  active
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-fg-dim)]",
                )}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
