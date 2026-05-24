import Link from "next/link";
import { Clock, Pause, Check, X, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Tarefa } from "@/lib/supabase/types";

type StatusVisual = {
  icon: typeof Clock;
  iconColor: string;
  bg: string;
  label: string;
};

const STATUS_VISUAL: Record<string, StatusVisual> = {
  agora: {
    icon: Clock,
    iconColor: "var(--color-prio-critica)",
    bg: "rgba(239, 68, 68, 0.15)",
    label: "em andamento",
  },
  em_breve: {
    icon: Clock,
    iconColor: "var(--color-prio-alta)",
    bg: "rgba(245, 158, 11, 0.15)",
    label: "em andamento",
  },
  pode_esperar: {
    icon: Clock,
    iconColor: "var(--color-prio-media)",
    bg: "rgba(250, 204, 21, 0.15)",
    label: "na fila",
  },
  em_pausa: {
    icon: Pause,
    iconColor: "var(--color-prio-baixa)",
    bg: "rgba(56, 189, 248, 0.15)",
    label: "em pausa",
  },
  concluida: {
    icon: Check,
    iconColor: "var(--color-mint)",
    bg: "rgba(126, 226, 187, 0.15)",
    label: "concluída",
  },
  recusada: {
    icon: X,
    iconColor: "#ef4444",
    bg: "rgba(239, 68, 68, 0.15)",
    label: "recusada",
  },
};

export function MinhaSolicitacaoCard({ tarefa }: { tarefa: Tarefa }) {
  const visual = STATUS_VISUAL[tarefa.status] ?? STATUS_VISUAL.em_breve;
  const Icon = visual.icon;

  return (
    <Link
      href={`/colaborador/tarefa/${tarefa.id}`}
      className="block rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] p-3 hover:bg-[var(--color-bg-elev)] active:scale-[0.99] transition-transform"
    >
      <div className="flex items-start gap-3">
        <div
          className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: visual.bg }}
        >
          <Icon
            size={18}
            style={{ color: visual.iconColor }}
            strokeWidth={2.5}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-snug">
            {tarefa.descricao_resumida || tarefa.descricao}
          </p>
          <p className="text-xs text-[var(--color-fg-dim)] mt-1">
            {formatDistanceToNow(new Date(tarefa.created_at), {
              addSuffix: true,
              locale: ptBR,
            })}
            {" · "}
            <span style={{ color: visual.iconColor }}>{visual.label}</span>
          </p>
          {tarefa.status === "recusada" && tarefa.recusada_motivo && (
            <p className="text-xs text-red-400 italic mt-1.5">
              &ldquo;{tarefa.recusada_motivo}&rdquo;
            </p>
          )}
        </div>
        <ChevronRight
          size={16}
          className="text-[var(--color-fg-dim)] shrink-0 mt-1"
        />
      </div>
    </Link>
  );
}
