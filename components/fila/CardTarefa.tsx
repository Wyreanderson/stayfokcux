import Link from "next/link";
import { Clock, Pause, Repeat, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { BadgePrioridade } from "./BadgePrioridade";
import { formatRelative } from "@/lib/utils";
import { PRIORIDADE_COR } from "@/lib/tarefas/grupos";
import type { Tarefa } from "@/lib/supabase/types";

export function CardTarefa({ tarefa }: { tarefa: Tarefa }) {
  const titulo = tarefa.descricao_resumida || tarefa.descricao;
  const corBarra = PRIORIDADE_COR[tarefa.prioridade];

  return (
    <Link href={`/tarefa/${tarefa.id}`} className="block">
      <Card className="relative overflow-hidden active:scale-[0.99] transition-transform">
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5"
          style={{ background: corBarra }}
        />
        <div className="pl-2 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-[15px] leading-snug flex-1">
              {titulo}
            </h3>
            <BadgePrioridade prioridade={tarefa.prioridade} />
          </div>
          {tarefa.solicitante && (
            <span className="inline-flex items-center gap-1 self-start rounded-full bg-[var(--color-primary)]/15 text-[var(--color-primary)] px-2 py-0.5 text-[11px] font-medium">
              <User size={11} />
              {tarefa.solicitante.nome}
            </span>
          )}
          <div className="flex items-center gap-3 text-xs text-[var(--color-fg-muted)]">
            {tarefa.categoria?.nome && (
              <span className="rounded-full bg-[var(--color-bg-elev)] px-2 py-0.5">
                {tarefa.categoria.nome}
              </span>
            )}
            {tarefa.prazo && (
              <span className="inline-flex items-center gap-1">
                <Clock size={12} />
                {formatRelative(tarefa.prazo)}
              </span>
            )}
            {tarefa.recorrencia > 1 && (
              <span className="inline-flex items-center gap-1">
                <Repeat size={12} />
                {tarefa.recorrencia}x
              </span>
            )}
            {!tarefa.interruptivel && (
              <span className="inline-flex items-center gap-1">
                <Pause size={12} />
                Não pode esperar
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
