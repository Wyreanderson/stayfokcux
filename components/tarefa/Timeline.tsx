"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Mic, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { AtualizacaoTarefa } from "@/lib/supabase/types";
import { GRUPO_META } from "@/lib/tarefas/grupos";

export function Timeline({ items }: { items: AtualizacaoTarefa[] }) {
  const [aberto, setAberto] = useState(false);

  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex items-center justify-between rounded-xl bg-[var(--color-bg-elev)] border border-[var(--color-border)] px-4 py-3 text-sm"
      >
        <span>
          Histórico de atualizações{" "}
          <span className="text-[var(--color-fg-dim)]">({items.length})</span>
        </span>
        {aberto ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {aberto && (
        <ol className="flex flex-col gap-2">
          {items.map((a) => {
            const mudou =
              a.status_novo &&
              a.status_anterior &&
              a.status_novo !== a.status_anterior;
            return (
              <li
                key={a.id}
                className="rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] p-3 flex flex-col gap-1.5"
              >
                <div className="flex items-center gap-2 text-xs text-[var(--color-fg-dim)]">
                  {a.fonte === "audio" ? (
                    <Mic size={12} />
                  ) : (
                    <MessageSquare size={12} />
                  )}
                  <span>
                    {formatDistanceToNow(new Date(a.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>
                <p className="text-sm font-medium">{a.resumo_acao}</p>
                {mudou && (
                  <p className="text-xs text-[var(--color-mint)]">
                    {GRUPO_META[
                      a.status_anterior as keyof typeof GRUPO_META
                    ]?.titulo ?? a.status_anterior}
                    {" → "}
                    {GRUPO_META[
                      a.status_novo as keyof typeof GRUPO_META
                    ]?.titulo ?? a.status_novo}
                    {a.razao_mudanca ? ` · ${a.razao_mudanca}` : ""}
                  </p>
                )}
                <p className="text-xs text-[var(--color-fg-dim)] italic">
                  &ldquo;{a.conteudo_original}&rdquo;
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
