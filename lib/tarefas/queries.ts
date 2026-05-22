import { createSupabaseServer, createSupabaseService } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import type {
  AtualizacaoTarefa,
  Categoria,
  Tarefa,
} from "@/lib/supabase/types";
import { GRUPOS, type Grupo } from "./grupos";

const TAREFA_SELECT =
  "*, categoria:categorias(id, nome, icone, cor)";

export async function getCategorias(): Promise<Categoria[]> {
  const sb = await createSupabaseServer();
  const { data } = await sb.from("categorias").select("*").order("nome");
  return data ?? [];
}

export async function getTarefasAgrupadas(): Promise<
  Record<Grupo, Tarefa[]>
> {
  const sb = await createSupabaseServer();
  const userId = env.defaultUserId();
  const { data } = await sb
    .from("tarefas")
    .select(TAREFA_SELECT)
    .eq("usuario_id", userId)
    .neq("status", "concluida")
    .order("created_at", { ascending: false });

  const out: Record<Grupo, Tarefa[]> = {
    agora: [],
    em_breve: [],
    pode_esperar: [],
    em_pausa: [],
  };
  for (const t of (data ?? []) as Tarefa[]) {
    if (GRUPOS.includes(t.status as Grupo)) {
      out[t.status as Grupo].push(t);
    }
  }
  return out;
}

export async function getTarefa(id: string): Promise<Tarefa | null> {
  const sb = await createSupabaseServer();
  const { data } = await sb
    .from("tarefas")
    .select(TAREFA_SELECT)
    .eq("id", id)
    .maybeSingle();
  return (data as Tarefa) ?? null;
}

export async function getHistorico(opts?: { incluirAbertas?: boolean }) {
  const sb = await createSupabaseServer();
  const userId = env.defaultUserId();
  let query = sb
    .from("tarefas")
    .select(TAREFA_SELECT)
    .eq("usuario_id", userId)
    .order("updated_at", { ascending: false })
    .limit(200);

  if (!opts?.incluirAbertas) query = query.eq("status", "concluida");
  const { data } = await query;
  return (data ?? []) as Tarefa[];
}

export async function getAtualizacoes(
  tarefaId: string,
  limit = 50,
): Promise<AtualizacaoTarefa[]> {
  const sb = await createSupabaseServer();
  const { data } = await sb
    .from("atualizacoes_tarefa")
    .select("*")
    .eq("tarefa_id", tarefaId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as AtualizacaoTarefa[];
}

export async function getPadroesDoUsuario(limit = 12): Promise<string[]> {
  const svc = createSupabaseService();
  const userId = env.defaultUserId();
  const { data } = await svc
    .from("padroes_usuario")
    .select("padrao,frequencia")
    .eq("usuario_id", userId)
    .order("frequencia", { ascending: false })
    .limit(limit);
  return (data ?? []).map((r) => r.padrao);
}
