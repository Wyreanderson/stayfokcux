import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requireSessionUser } from "@/lib/auth/session";
import { getAtualizacoes, getTarefa } from "@/lib/tarefas/queries";
import { ResumoCard } from "@/components/tarefa/ResumoCard";
import { Timeline } from "@/components/tarefa/Timeline";
import { AdicionarAtualizacao } from "@/components/tarefa/AdicionarAtualizacao";

const STATUS_LABEL: Record<string, string> = {
  agora: "AGORA",
  em_breve: "EM BREVE",
  pode_esperar: "PODE ESPERAR",
  em_pausa: "EM PAUSA",
  concluida: "CONCLUÍDA",
  recusada: "RECUSADA",
};

export default async function ColaboradorTarefaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireSessionUser("colaborador");
  const { id } = await params;

  const [tarefa, atualizacoes] = await Promise.all([
    getTarefa(id),
    getAtualizacoes(id),
  ]);

  if (!tarefa) notFound();
  if (tarefa.solicitante_id !== user.id) notFound();

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/colaborador"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-fg-dim)] -ml-1"
      >
        <ChevronLeft size={18} /> Voltar
      </Link>
      <div>
        <p className="text-xs text-[var(--color-fg-dim)] uppercase tracking-wide">
          Sua solicitação
        </p>
        <h1 className="text-xl font-bold">
          {tarefa.descricao_resumida || tarefa.descricao}
        </h1>
        <p className="text-xs mt-1">
          Status:{" "}
          <span className="font-bold">
            {STATUS_LABEL[tarefa.status] ?? tarefa.status}
          </span>
        </p>
      </div>

      {tarefa.status === "recusada" && tarefa.recusada_motivo && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3">
          <p className="text-xs uppercase tracking-wide text-red-400">
            Motivo da recusa
          </p>
          <p className="text-sm mt-1">{tarefa.recusada_motivo}</p>
        </div>
      )}

      <ResumoCard tarefa={tarefa} ultimaAtualizacao={atualizacoes[0] ?? null} />

      {tarefa.status !== "concluida" && tarefa.status !== "recusada" && (
        <AdicionarAtualizacao tarefaId={tarefa.id} />
      )}

      <Timeline items={atualizacoes} />
    </div>
  );
}
