"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

export function FabCaptura() {
  return (
    <Link
      href="/capturar"
      aria-label="Adicionar nova tarefa"
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+72px)] right-5 z-40 h-16 w-16 rounded-full bg-[var(--color-primary)] text-[#0a2e28] flex items-center justify-center shadow-[0_8px_24px_rgba(16,185,129,0.35)] pulse-ring active:scale-95 transition-transform"
    >
      <Plus size={32} strokeWidth={3} />
    </Link>
  );
}
