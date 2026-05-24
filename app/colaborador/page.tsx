import Link from "next/link";
import { Plus, Send } from "lucide-react";
import { requireSessionUser } from "@/lib/auth/session";
import { getMinhasSolicitacoes } from "@/lib/tarefas/queries";
import { createSupabaseService } from "@/lib/supabase/server";
import { EmptyState } from "@/components/shared/EmptyState";
import { MinhaSolicitacaoCard } from "@/components/colaborador/MinhaSolicitacaoCard";

export default async function ColaboradorPage() {
  const user = await requireSessionUser("colaborador");

  const svc = createSupabaseService();
  const { data: patrao } = await svc
    .from("usuarios")
    .select("nome")
    .eq("id", user.patrao_id ?? "")
    .maybeSingle();

  const tarefas = await getMinhasSolicitacoes();

  const aguardando = tarefas.filter(
    (t) => t.status !== "concluida" && t.status !== "recusada",
  );
  const respondidas = tarefas.filter(
    (t) => t.status === "concluida" || t.status === "recusada",
  );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-xs text-[var(--color-fg-dim)]">
          Olá, {user.nome.split(" ")[0]}
        </p>
        <h1 className="text-xl font-bold leading-tight">
          O que você precisa pedir hoje?
        </h1>
        <p className="text-xs text-[var(--color-fg-dim)] mt-1">
          Para{" "}
          <span className="text-[var(--color-primary)]">
            {patrao?.nome ?? "seu gestor"}
          </span>
        </p>
      </div>

      <Link
        href="/colaborador/nova"
        className="group rounded-2xl bg-[var(--color-primary)] text-[#0a2e28] p-5 flex items-center gap-4 active:scale-[0.98] transition-transform"
      >
        <div className="h-12 w-12 rounded-xl bg-[#0a2e28]/15 flex items-center justify-center shrink-0">
          <Send size={22} strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-base leading-tight">
            Pedir alguma coisa
          </p>
          <p className="text-sm opacity-80">
            Fale ou digite — a IA encaminha
          </p>
        </div>
        <Plus size={22} strokeWidth={2.5} className="shrink-0" />
      </Link>

      <section className="flex flex-col gap-2">
        <h2 className="text-[11px] uppercase tracking-wide text-[var(--color-fg-dim)] px-1 flex items-center gap-2">
          <span>Aguardando resposta</span>
          <span className="text-[var(--color-primary)]">·</span>
          <span className="tabular-nums">{aguardando.length}</span>
        </h2>
        {aguardando.length === 0 ? (
          <EmptyState
            title="Nada pendente"
            description="Quando você mandar um pedido, ele aparece aqui até o gestor responder."
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {aguardando.map((t) => (
              <li key={t.id}>
                <MinhaSolicitacaoCard tarefa={t} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {respondidas.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-[11px] uppercase tracking-wide text-[var(--color-fg-dim)] px-1 flex items-center gap-2">
            <span>Respondidas</span>
            <span className="text-[var(--color-primary)]">·</span>
            <span className="tabular-nums">{respondidas.length}</span>
          </h2>
          <ul className="flex flex-col gap-2">
            {respondidas.slice(0, 5).map((t) => (
              <li key={t.id}>
                <MinhaSolicitacaoCard tarefa={t} />
              </li>
            ))}
          </ul>
          {respondidas.length > 5 && (
            <Link
              href="/colaborador/historico"
              className="text-xs text-[var(--color-fg-dim)] text-center mt-1 hover:underline"
            >
              Ver todas ({respondidas.length}) →
            </Link>
          )}
        </section>
      )}
    </div>
  );
}
