import { createSupabaseServer } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { GRUPOS, type Grupo } from "@/lib/tarefas/grupos";
import type { Tarefa } from "@/lib/supabase/types";
import { GrupoFila } from "@/components/fila/GrupoFila";
import { EmptyState } from "@/components/shared/EmptyState";
import { Filtros } from "@/components/fila/Filtros";
import { FilaRealtime } from "@/components/fila/FilaRealtime";
import { Overview } from "@/components/dashboard/Overview";

type SearchParams = Promise<{
  q?: string;
  categoria?: string;
  prioridade?: string;
}>;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const sb = await createSupabaseServer();
  const userId = env.defaultUserId();

  let query = sb
    .from("tarefas")
    .select("*, categoria:categorias(id, nome, icone, cor)")
    .eq("usuario_id", userId)
    .neq("status", "concluida")
    .order("created_at", { ascending: false });

  if (sp.prioridade) query = query.eq("prioridade", sp.prioridade);
  if (sp.q) {
    const term = `%${sp.q}%`;
    query = query.or(
      `descricao.ilike.${term},descricao_resumida.ilike.${term}`,
    );
  }

  const { data } = await query;
  let tarefas = (data ?? []) as Tarefa[];

  if (sp.categoria) {
    tarefas = tarefas.filter((t) => t.categoria?.nome === sp.categoria);
  }

  const agrupadas: Record<Grupo, Tarefa[]> = {
    agora: [],
    em_breve: [],
    pode_esperar: [],
    em_pausa: [],
  };
  for (const t of tarefas) {
    if (GRUPOS.includes(t.status as Grupo)) {
      agrupadas[t.status as Grupo].push(t);
    }
  }

  const total = tarefas.length;
  const filtroAtivo = Boolean(sp.q || sp.categoria || sp.prioridade);

  const porCategoriaMap = new Map<
    string,
    { nome: string; count: number; cor: string | null; icone: string | null }
  >();
  for (const t of tarefas) {
    const nome = t.categoria?.nome ?? "Outros";
    const atual = porCategoriaMap.get(nome);
    if (atual) {
      atual.count += 1;
    } else {
      porCategoriaMap.set(nome, {
        nome,
        count: 1,
        cor: t.categoria?.cor ?? null,
        icone: t.categoria?.icone ?? null,
      });
    }
  }
  const porCategoria = Array.from(porCategoriaMap.values());

  return (
    <div className="flex flex-col gap-4">
      <FilaRealtime />
      <div>
        <p className="text-xs text-[var(--color-fg-dim)]">Olá, Wyre</p>
        <h1 className="text-xl font-bold">Aqui está o seu fluxo de hoje.</h1>
      </div>
      <Overview
        porStatus={{
          hoje: agrupadas.agora.length,
          emBreve: agrupadas.em_breve.length,
          pausadas: agrupadas.em_pausa.length,
          total,
        }}
        porCategoria={porCategoria}
      />
      <Filtros />
      {total === 0 ? (
        <EmptyState
          title={filtroAtivo ? "Nada encontrado" : "Sem tarefas pendentes"}
          description={
            filtroAtivo
              ? "Ajuste os filtros ou limpe a busca para ver tudo."
              : "Toque no botão verde para registrar sua primeira tarefa por texto ou áudio."
          }
        />
      ) : (
        <div className="flex flex-col gap-5">
          {GRUPOS.map((g) => (
            <GrupoFila key={g} grupo={g} tarefas={agrupadas[g]} />
          ))}
        </div>
      )}
    </div>
  );
}
