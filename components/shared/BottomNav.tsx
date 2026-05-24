"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { History, ListTodo, Zap, Users, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/supabase/types";

type Item = {
  href: string;
  label: string;
  icon: typeof ListTodo;
  match: (p: string) => boolean;
};

const BASE_ITEMS: Item[] = [
  { href: "/", label: "Fila", icon: ListTodo, match: (p) => p === "/" },
  {
    href: "/modo-caos",
    label: "Caos",
    icon: Zap,
    match: (p) => p.startsWith("/modo-caos"),
  },
  {
    href: "/colaboradores",
    label: "Equipe",
    icon: Users,
    match: (p) => p.startsWith("/colaboradores"),
  },
  {
    href: "/historico",
    label: "Histórico",
    icon: History,
    match: (p) => p.startsWith("/historico"),
  },
];

const ADMIN_ITEM: Item = {
  href: "/admin",
  label: "Admin",
  icon: Shield,
  match: (p) => p.startsWith("/admin"),
};

export function BottomNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const items =
    role === "super_admin"
      ? [...BASE_ITEMS.slice(0, 3), ADMIN_ITEM, BASE_ITEMS[3]]
      : BASE_ITEMS;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 border-t border-[var(--color-border)] bg-[var(--color-bg-elev)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-bg-elev)]/80 pb-[env(safe-area-inset-bottom)]">
      <ul
        className="grid max-w-md mx-auto"
        style={{
          gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
        }}
      >
        {items.map((it) => {
          const active = it.match(pathname);
          const Icon = it.icon;
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-3 text-[11px] font-medium",
                  active
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-fg-dim)]",
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
