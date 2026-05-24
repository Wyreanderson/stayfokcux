import Link from "next/link";
import { Plus, Shield } from "lucide-react";
import { requireSessionUser } from "@/lib/auth/session";
import { createSupabaseService } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ConfirmarExcluirPatrao } from "@/components/admin/ConfirmarExcluirPatrao";
import type { Usuario } from "@/lib/supabase/types";

type PatraoComContagens = Usuario & {
  qtd_colaboradores: number;
  qtd_tarefas: number;
};

async function getPatroes(): Promise<PatraoComContagens[]> {
  const svc = createSupabaseService();
  const { data: patroes } = await svc
    .from("usuarios")
    .select("*")
    .in("role", ["super_admin", "patrao"])
    .order("created_at", { ascending: true });

  const lista = (patroes ?? []) as Usuario[];

  const enriquecidos: PatraoComContagens[] = await Promise.all(
    lista.map(async (p) => {
      const [{ count: colabs }, { count: tarefas }] = await Promise.all([
        svc
          .from("usuarios")
          .select("id", { count: "exact", head: true })
          .eq("patrao_id", p.id),
        svc
          .from("tarefas")
          .select("id", { count: "exact", head: true })
          .eq("usuario_id", p.id),
      ]);
      return {
        ...p,
        qtd_colaboradores: colabs ?? 0,
        qtd_tarefas: tarefas ?? 0,
      };
    }),
  );

  return enriquecidos;
}

type SearchParams = Promise<{ error?: string }>;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const me = await requireSessionUser("super_admin");
  const { error } = await searchParams;
  const patroes = await getPatroes();

  const mensagensErro: Record<string, string> = {
    auto: "Você não pode excluir a si mesmo.",
    super_admin: "Não é possível excluir o super_admin.",
    nao_existe: "Gestor não encontrado.",
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Shield size={20} className="text-[var(--color-primary)]" />
        <h1 className="text-xl font-bold">Painel admin</h1>
      </div>
      <p className="text-sm text-[var(--color-fg-dim)]">
        Crie contas de gestor (patrão). Cada gestor pode convidar colaboradores.
      </p>

      {error && mensagensErro[error] && (
        <p className="text-sm text-red-400 rounded-lg bg-red-500/10 border border-red-500/30 p-2">
          {mensagensErro[error]}
        </p>
      )}

      <Link href="/admin/patroes/novo">
        <Button size="lg" className="w-full">
          <Plus size={18} /> Criar gestor
        </Button>
      </Link>

      <h2 className="text-sm uppercase tracking-wide text-[var(--color-fg-dim)] mt-4">
        Gestores ({patroes.length})
      </h2>

      <ul className="flex flex-col gap-2">
        {patroes.map((p) => {
          const podeExcluir = p.role === "patrao" && p.id !== me.id;
          return (
            <li
              key={p.id}
              className="rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] p-3 flex flex-col gap-1"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium truncate">{p.nome}</span>
                  {p.role === "super_admin" && (
                    <span className="text-[10px] uppercase tracking-wide bg-[var(--color-primary)] text-[#0a2e28] rounded px-1.5 py-0.5">
                      Admin
                    </span>
                  )}
                </div>
                <span className="text-xs text-[var(--color-fg-dim)] tabular-nums shrink-0">
                  {p.qtd_colaboradores} colab · {p.qtd_tarefas} tarefas
                </span>
              </div>
              {p.codigo_acesso && (
                <p className="text-xs text-[var(--color-fg-dim)]">
                  Código definido ({p.codigo_acesso.length} caracteres)
                </p>
              )}
              {p.email && (
                <p className="text-xs text-[var(--color-fg-dim)] truncate">
                  {p.email}
                </p>
              )}
              {podeExcluir && (
                <ConfirmarExcluirPatrao id={p.id} nome={p.nome} />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
