import { requireSessionUser } from "@/lib/auth/session";
import { getMinhasSolicitacoes } from "@/lib/tarefas/queries";
import { EmptyState } from "@/components/shared/EmptyState";
import { MinhaSolicitacaoCard } from "@/components/colaborador/MinhaSolicitacaoCard";

export default async function ColaboradorHistoricoPage() {
  await requireSessionUser("colaborador");
  const tarefas = await getMinhasSolicitacoes();
  const fechadas = tarefas.filter(
    (t) => t.status === "concluida" || t.status === "recusada",
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold">Histórico</h1>
        <p className="text-sm text-[var(--color-fg-dim)]">
          Solicitações concluídas e recusadas.
        </p>
      </div>

      {fechadas.length === 0 ? (
        <EmptyState
          title="Sem histórico ainda"
          description="Suas solicitações concluídas/recusadas aparecerão aqui."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {fechadas.map((t) => (
            <li key={t.id}>
              <MinhaSolicitacaoCard tarefa={t} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
