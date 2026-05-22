import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getCategorias, getTarefa } from "@/lib/tarefas/queries";
import { DetalhesForm } from "@/components/tarefa/DetalhesForm";

export default async function TarefaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [tarefa, categorias] = await Promise.all([
    getTarefa(id),
    getCategorias(),
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
      <DetalhesForm tarefa={tarefa} categorias={categorias} />
    </div>
  );
}
