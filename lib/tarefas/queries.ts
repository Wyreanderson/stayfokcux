import { createSupabaseServer, createSupabaseService } from "@/lib/supabase/server";
import type {
  AtualizacaoTarefa,
  Categoria,
  Tarefa,
} from "@/lib/supabase/types";
import { GRUPOS, type Grupo } from "./grupos";
import { requireSessionUser } from "@/lib/auth/session";

const TAREFA_SELECT =
  "*, categoria:categorias(id, nome, icone, cor), solicitante:usuarios!tarefas_solicitante_id_fkey(id, nome, username)";

export async function getCategorias(): Promise<Categoria[]> {
  const sb = await createSupabaseServer();
  const { data } = await sb.from("categorias").select("*").order("nome");
  return data ?? [];
}

export async function getTarefasAgrupadas(): Promise<
  Record<Grupo, Tarefa[]>
> {
  const user = await requireSessionUser(["patrao", "super_admin"]);
  const sb = await createSupabaseServer();
  const { data } = await sb
    .from("tarefas")
    .select(TAREFA_SELECT)
    .eq("usuario_id", user.id)
    .not("status", "in", "(concluida,recusada)")
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
  const user = await requireSessionUser(["patrao", "super_admin"]);
  const sb = await createSupabaseServer();
  let query = sb
    .from("tarefas")
    .select(TAREFA_SELECT)
    .eq("usuario_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(200);

  if (!opts?.incluirAbertas) {
    query = query.in("status", ["concluida", "recusada"]);
  }
  const { data } = await query;
  return (data ?? []) as Tarefa[];
}

export async function getMinhasSolicitacoes(): Promise<Tarefa[]> {
  const user = await requireSessionUser("colaborador");
  const sb = await createSupabaseServer();
  const { data } = await sb
    .from("tarefas")
    .select(TAREFA_SELECT)
    .eq("solicitante_id", user.id)
    .order("created_at", { ascending: false });
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

export async function getPadroesDoUsuario(
  userId: string,
  limit = 12,
): Promise<string[]> {
  const svc = createSupabaseService();
  const { data } = await svc
    .from("padroes_usuario")
    .select("padrao,frequencia")
    .eq("usuario_id", userId)
    .order("frequencia", { ascending: false })
    .limit(limit);
  return (data ?? []).map((r) => r.padrao);
}
