"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus, History } from "lucide-react";
import { cn } from "@/lib/utils";

const ITENS = [
  { href: "/colaborador", icon: Home, label: "Início" },
  { href: "/colaborador/nova", icon: Plus, label: "Nova" },
  { href: "/colaborador/historico", icon: History, label: "Histórico" },
];

export function ColaboradorNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--color-border)]/60 bg-[var(--color-bg)]/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-md grid grid-cols-3">
        {ITENS.map((item) => {
          const Icon = item.icon;
          const ativo =
            pathname === item.href ||
            (item.href !== "/colaborador" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2.5 text-xs",
                ativo
                  ? "text-[var(--color-primary)]"
                  : "text-[var(--color-fg-dim)]",
              )}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
