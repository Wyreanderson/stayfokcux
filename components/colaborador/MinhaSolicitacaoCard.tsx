import Link from "next/link";
import { ChevronRight, Mic, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Tarefa } from "@/lib/supabase/types";

const STATUS_LABEL: Record<string, { titulo: string; cor: string }> = {
  agora: { titulo: "AGORA", cor: "var(--color-prio-critica)" },
  em_breve: { titulo: "EM BREVE", cor: "var(--color-prio-alta)" },
  pode_esperar: { titulo: "PODE ESPERAR", cor: "var(--color-prio-media)" },
  em_pausa: { titulo: "EM PAUSA", cor: "var(--color-prio-baixa)" },
  concluida: { titulo: "CONCLUÍDA", cor: "var(--color-mint)" },
  recusada: { titulo: "RECUSADA", cor: "#ef4444" },
};

export function MinhaSolicitacaoCard({ tarefa }: { tarefa: Tarefa }) {
  const label = STATUS_LABEL[tarefa.status] ?? {
    titulo: tarefa.status,
    cor: "var(--color-fg-dim)",
  };
  return (
    <Link
      href={`/colaborador/tarefa/${tarefa.id}`}
      className="block rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] p-3 hover:bg-[var(--color-bg-elev)]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex flex-col gap-1">
          <p className="text-sm font-medium truncate">
            {tarefa.descricao_resumida || tarefa.descricao}
          </p>
          <div className="flex items-center gap-2 text-xs text-[var(--color-fg-dim)]">
            {tarefa.fonte === "audio" ? (
              <Mic size={12} />
            ) : (
              <MessageSquare size={12} />
            )}
            <span>
              {formatDistanceToNow(new Date(tarefa.created_at), {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>
            {tarefa.categoria?.nome && <span>· {tarefa.categoria.nome}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span
            className="text-[10px] font-bold uppercase tracking-wide"
            style={{ color: label.cor }}
          >
            {label.titulo}
          </span>
          <ChevronRight size={14} className="text-[var(--color-fg-dim)]" />
        </div>
      </div>
      {tarefa.recusada_motivo && (
        <p className="text-xs text-red-400 mt-2 italic">
          &ldquo;{tarefa.recusada_motivo}&rdquo;
        </p>
      )}
    </Link>
  );
}
