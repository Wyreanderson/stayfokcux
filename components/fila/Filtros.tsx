"use client";

import { Search } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CATEGORIAS } from "@/lib/ai/schemas";
import { PRIORIDADE_LABEL } from "@/lib/tarefas/grupos";

const PRIORIDADES = ["critica", "alta", "media", "baixa"] as const;

export function Filtros() {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(sp.toString());
    if (value && value.length > 0) next.set(key, value);
    else next.delete(key);
    startTransition(() => router.replace(`/?${next.toString()}`));
  };

  const categoriaAtual = sp.get("categoria") ?? "";
  const prioridadeAtual = sp.get("prioridade") ?? "";

  return (
    <div className="flex flex-col gap-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setParam("q", q);
        }}
        className="relative"
      >
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-fg-dim)]"
        />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onBlur={() => setParam("q", q)}
          placeholder="Buscar tarefas, peças, palavras-chave..."
          className="pl-10"
        />
      </form>
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-[var(--color-fg-dim)] underline self-start"
      >
        {open ? "Ocultar filtros" : "Filtros"}
      </button>
      {open && (
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-[var(--color-bg-card)] p-3 border border-[var(--color-border)]">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--color-fg-dim)]">Categoria</label>
            <select
              value={categoriaAtual}
              onChange={(e) => setParam("categoria", e.target.value || null)}
              className="h-10 rounded-lg bg-[var(--color-bg-elev)] border border-[var(--color-border)] px-2 text-sm"
            >
              <option value="">Todas</option>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--color-fg-dim)]">Prioridade</label>
            <select
              value={prioridadeAtual}
              onChange={(e) => setParam("prioridade", e.target.value || null)}
              className="h-10 rounded-lg bg-[var(--color-bg-elev)] border border-[var(--color-border)] px-2 text-sm"
            >
              <option value="">Todas</option>
              {PRIORIDADES.map((p) => (
                <option key={p} value={p}>{PRIORIDADE_LABEL[p]}</option>
              ))}
            </select>
          </div>
          {(sp.get("q") || categoriaAtual || prioridadeAtual) && (
            <Button
              variant="ghost"
              size="sm"
              className="col-span-2"
              onClick={() => router.replace("/")}
            >
              Limpar filtros
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
