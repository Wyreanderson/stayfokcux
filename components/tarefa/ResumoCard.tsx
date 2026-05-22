import { Pin } from "lucide-react";
import type { AtualizacaoTarefa, Tarefa } from "@/lib/supabase/types";
import { GRUPO_META } from "@/lib/tarefas/grupos";

export function ResumoCard({
  tarefa,
  ultimaAtualizacao,
}: {
  tarefa: Tarefa;
  ultimaAtualizacao?: AtualizacaoTarefa | null;
}) {
  const texto =
    tarefa.resumo_atual ||
    tarefa.descricao_resumida ||
    tarefa.descricao;

  const mudouStatus =
    ultimaAtualizacao &&
    ultimaAtualizacao.status_novo &&
    ultimaAtualizacao.status_anterior &&
    ultimaAtualizacao.status_novo !== ultimaAtualizacao.status_anterior;

  return (
    <div className="rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Pin size={16} className="text-[var(--color-primary)]" />
        <span className="text-xs uppercase tracking-wide text-[var(--color-fg-dim)]">
          Onde parei
        </span>
      </div>
      <p className="text-sm leading-relaxed whitespace-pre-line">{texto}</p>
      {mudouStatus && (
        <p className="text-xs text-[var(--color-mint)] bg-[var(--color-bg-elev)] rounded-lg px-3 py-2 mt-1">
          última atualização moveu para{" "}
          <strong>
            {
              GRUPO_META[
                ultimaAtualizacao!.status_novo as keyof typeof GRUPO_META
              ]?.titulo ?? ultimaAtualizacao!.status_novo
            }
          </strong>
          {ultimaAtualizacao!.razao_mudanca
            ? ` — ${ultimaAtualizacao!.razao_mudanca}`
            : ""}
        </p>
      )}
    </div>
  );
}
