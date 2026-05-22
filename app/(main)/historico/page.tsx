import Link from "next/link";
import { formatRelative } from "@/lib/utils";
import { getHistorico } from "@/lib/tarefas/queries";
import { Card } from "@/components/ui/card";
import { BadgePrioridade } from "@/components/fila/BadgePrioridade";
import { EmptyState } from "@/components/shared/EmptyState";
import { Repeat } from "lucide-react";

type SearchParams = Promise<{ tab?: "concluidas" | "todas" }>;

export default async function HistoricoPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const tab = sp.tab ?? "concluidas";
  const tarefas = await getHistorico({ incluirAbertas: tab === "todas" });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold">Histórico</h1>
        <p className="text-sm text-[var(--color-fg-dim)]">
          Tarefas anteriores e padrões aprendidos.
        </p>
      </div>

      <div className="flex gap-2 rounded-full bg-[var(--color-bg-elev)] p-1 self-start">
        {(
          [
            { key: "concluidas", label: "Concluídas" },
            { key: "todas", label: "Todas" },
          ] as const
        ).map((t) => (
          <Link
            key={t.key}
            href={`/historico?tab=${t.key}`}
            className={
              "px-4 py-1.5 rounded-full text-sm font-medium " +
              (tab === t.key
                ? "bg-[var(--color-primary)] text-[#0a2e28]"
                : "text-[var(--color-fg-dim)]")
            }
          >
            {t.label}
          </Link>
        ))}
      </div>

      {tarefas.length === 0 ? (
        <EmptyState
          title="Sem histórico ainda"
          description="Conclua tarefas para vê-las aqui com a frequência de recorrência."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {tarefas.map((t) => (
            <li key={t.id}>
              <Link href={`/tarefa/${t.id}`}>
                <Card className="flex items-center justify-between gap-3">
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="font-medium text-sm truncate">
                      {t.descricao_resumida || t.descricao}
                    </span>
                    <span className="text-xs text-[var(--color-fg-dim)]">
                      {t.status === "concluida"
                        ? "Concluída "
                        : "Atualizada "}
                      {formatRelative(t.updated_at)}
                      {t.categoria?.nome ? ` · ${t.categoria.nome}` : ""}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <BadgePrioridade prioridade={t.prioridade} />
                    {t.recorrencia > 1 && (
                      <span className="text-[10px] inline-flex items-center gap-1 text-[var(--color-mint)]">
                        <Repeat size={10} /> {t.recorrencia}x
                      </span>
                    )}
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
