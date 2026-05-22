import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import {
  getAtualizacoes,
  getCategorias,
  getTarefa,
} from "@/lib/tarefas/queries";
import { DetalhesForm } from "@/components/tarefa/DetalhesForm";
import { ResumoCard } from "@/components/tarefa/ResumoCard";
import { AdicionarAtualizacao } from "@/components/tarefa/AdicionarAtualizacao";
import { Timeline } from "@/components/tarefa/Timeline";

export default async function TarefaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [tarefa, categorias, atualizacoes] = await Promise.all([
    getTarefa(id),
    getCategorias(),
    getAtualizacoes(id),
  ]);
  if (!tarefa) notFound();

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-fg-dim)] -ml-1"
      >
        <ChevronLeft size={18} /> Voltar à fila
      </Link>
      <div>
        <p className="text-xs text-[var(--color-fg-dim)] uppercase tracking-wide">
          Detalhes da tarefa
        </p>
        <h1 className="text-xl font-bold">
          {tarefa.descricao_resumida || tarefa.descricao}
        </h1>
      </div>

      <ResumoCard tarefa={tarefa} ultimaAtualizacao={atualizacoes[0] ?? null} />
      <AdicionarAtualizacao tarefaId={tarefa.id} />
      <Timeline items={atualizacoes} />

      <DetalhesForm tarefa={tarefa} categorias={categorias} />
    </div>
  );
}
