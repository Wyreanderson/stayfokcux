import { CardTarefa } from "./CardTarefa";
import { GRUPO_META, type Grupo } from "@/lib/tarefas/grupos";
import type { Tarefa } from "@/lib/supabase/types";

export function GrupoFila({
  grupo,
  tarefas,
}: {
  grupo: Grupo;
  tarefas: Tarefa[];
}) {
  if (tarefas.length === 0) return null;
  const meta = GRUPO_META[grupo];
  return (
    <section className="flex flex-col gap-2">
      <header className="flex items-baseline justify-between px-1">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: meta.cor }}
          />
          <h2 className="text-sm font-bold tracking-wide">{meta.titulo}</h2>
          <span className="text-xs text-[var(--color-fg-dim)]">
            ({tarefas.length})
          </span>
        </div>
        <span className="text-[10px] uppercase text-[var(--color-fg-dim)]">
          {meta.descricao}
        </span>
      </header>
      <div className="flex flex-col gap-2">
        {tarefas.map((t) => (
          <CardTarefa key={t.id} tarefa={t} />
        ))}
      </div>
    </section>
  );
}
