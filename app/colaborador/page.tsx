import Link from "next/link";
import { Plus } from "lucide-react";
import { requireSessionUser } from "@/lib/auth/session";
import { getMinhasSolicitacoes } from "@/lib/tarefas/queries";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { MinhaSolicitacaoCard } from "@/components/colaborador/MinhaSolicitacaoCard";

export default async function ColaboradorPage() {
  const user = await requireSessionUser("colaborador");
  const tarefas = await getMinhasSolicitacoes();

  const abertas = tarefas.filter(
    (t) => t.status !== "concluida" && t.status !== "recusada",
  );
  const emPausa = tarefas.filter((t) => t.status === "em_pausa").length;
  const concluidas = tarefas.filter((t) => t.status === "concluida").length;
  const recusadas = tarefas.filter((t) => t.status === "recusada").length;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs text-[var(--color-fg-dim)]">Olá, {user.nome}</p>
        <h1 className="text-xl font-bold">Seus pedidos</h1>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] p-3">
          <p className="text-2xl font-bold text-[var(--color-primary)] leading-none">
            {abertas.length}
          </p>
          <p className="text-xs text-[var(--color-fg-dim)] mt-1">Em andamento</p>
        </div>
        <div className="rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] p-3">
          <p className="text-2xl font-bold text-[var(--color-prio-baixa)] leading-none">
            {emPausa}
          </p>
          <p className="text-xs text-[var(--color-fg-dim)] mt-1">Em pausa</p>
        </div>
        <div className="rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] p-3">
          <p className="text-2xl font-bold text-[var(--color-mint)] leading-none">
            {concluidas}
          </p>
          <p className="text-xs text-[var(--color-fg-dim)] mt-1">Concluídas</p>
        </div>
      </div>

      <Link href="/colaborador/nova">
        <Button size="lg" className="w-full">
          <Plus size={18} /> Nova solicitação
        </Button>
      </Link>

      {abertas.length === 0 ? (
        <EmptyState
          title="Sem pedidos em andamento"
          description="Toque acima pra enviar um pedido por texto ou áudio."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {abertas.map((t) => (
            <li key={t.id}>
              <MinhaSolicitacaoCard tarefa={t} />
            </li>
          ))}
        </ul>
      )}

      {recusadas > 0 && (
        <p className="text-xs text-[var(--color-fg-dim)] text-center">
          {recusadas} pedido(s) recusado(s) — veja no histórico
        </p>
      )}
    </div>
  );
}
