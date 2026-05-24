import { Plus, UserMinus, X } from "lucide-react";
import { requireSessionUser } from "@/lib/auth/session";
import { createSupabaseService } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopiarLink } from "@/components/colaboradores/CopiarLink";
import {
  novoConviteAction,
  removerColaboradorAction,
  revogarConviteAction,
} from "./actions";
import type { Convite, Usuario } from "@/lib/supabase/types";

export default async function ColaboradoresPage() {
  const user = await requireSessionUser(["patrao", "super_admin"]);
  const svc = createSupabaseService();

  const [{ data: colaboradores }, { data: convites }] = await Promise.all([
    svc
      .from("usuarios")
      .select("*")
      .eq("patrao_id", user.id)
      .eq("role", "colaborador")
      .order("created_at", { ascending: true }),
    svc
      .from("convites")
      .select("*")
      .eq("patrao_id", user.id)
      .is("usado_em", null)
      .order("criado_em", { ascending: false }),
  ]);

  const lista = (colaboradores ?? []) as Usuario[];
  const pendentes = (convites ?? []) as Convite[];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold">Colaboradores</h1>
        <p className="text-sm text-[var(--color-fg-dim)]">
          Convide pessoas pra te mandar pedidos. Eles entram com usuário + senha.
        </p>
      </div>

      <form action={novoConviteAction} className="flex flex-col gap-2 rounded-xl bg-[var(--color-bg-elev)] border border-[var(--color-border)] p-3">
        <span className="text-xs uppercase tracking-wide text-[var(--color-fg-dim)]">
          Novo convite
        </span>
        <Input
          name="nome_sugerido"
          placeholder="Nome sugerido (opcional)"
        />
        <Button type="submit">
          <Plus size={16} /> Gerar link de convite
        </Button>
      </form>

      {pendentes.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm uppercase tracking-wide text-[var(--color-fg-dim)]">
            Convites pendentes ({pendentes.length})
          </h2>
          <ul className="flex flex-col gap-2">
            {pendentes.map((c) => (
              <li
                key={c.id}
                className="rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] p-3 flex flex-col gap-2"
              >
                {c.nome_sugerido && (
                  <p className="text-sm font-medium">{c.nome_sugerido}</p>
                )}
                <CopiarLink path={`/convite/${c.token}`} />
                <div className="flex items-center justify-between text-xs text-[var(--color-fg-dim)]">
                  <span>
                    Expira em{" "}
                    {c.expira_em
                      ? new Date(c.expira_em).toLocaleDateString("pt-BR")
                      : "—"}
                  </span>
                  <form action={revogarConviteAction}>
                    <input type="hidden" name="id" value={c.id} />
                    <button
                      type="submit"
                      className="text-red-400 hover:underline inline-flex items-center gap-1"
                    >
                      <X size={12} /> Revogar
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-sm uppercase tracking-wide text-[var(--color-fg-dim)]">
          Ativos ({lista.length})
        </h2>
        {lista.length === 0 ? (
          <p className="text-sm text-[var(--color-fg-dim)] rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] p-4 text-center">
            Ninguém ainda. Gere um convite acima e compartilhe.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {lista.map((c) => (
              <li
                key={c.id}
                className="rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] p-3 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{c.nome}</p>
                  <p className="text-xs text-[var(--color-fg-dim)] truncate">
                    @{c.username}
                  </p>
                </div>
                <form action={removerColaboradorAction}>
                  <input type="hidden" name="id" value={c.id} />
                  <button
                    type="submit"
                    className="text-red-400 text-xs inline-flex items-center gap-1 shrink-0"
                    aria-label="Remover"
                  >
                    <UserMinus size={14} />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
