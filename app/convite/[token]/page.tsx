import { buscarConvite } from "@/lib/auth/usuarios";
import { createSupabaseService } from "@/lib/supabase/server";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { aceitarConviteAction } from "./actions";

type SearchParams = Promise<{ error?: string }>;

export default async function ConvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: SearchParams;
}) {
  const { token } = await params;
  const { error } = await searchParams;
  const convite = await buscarConvite(token);

  if (!convite || convite.usado_em || (convite.expira_em && new Date(convite.expira_em) < new Date())) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm flex flex-col gap-4 text-center">
          <Logo size={40} />
          <h1 className="text-lg font-bold">Convite inválido</h1>
          <p className="text-sm text-[var(--color-fg-dim)]">
            Esse link expirou ou já foi usado. Peça um novo convite ao seu gestor.
          </p>
        </div>
      </main>
    );
  }

  const svc = createSupabaseService();
  const { data: patrao } = await svc
    .from("usuarios")
    .select("nome")
    .eq("id", convite.patrao_id)
    .maybeSingle();

  const erros: Record<string, string> = {
    username: "Usuário precisa ter 3+ caracteres.",
    username_espaco: "Usuário não pode ter espaços.",
    senha: "Senha precisa ter 6+ caracteres.",
    nome: "Preencha seu nome.",
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-8">
      <div className="w-full max-w-sm flex flex-col gap-5">
        <div className="flex flex-col items-center gap-2">
          <Logo size={40} />
          <p className="text-sm text-[var(--color-fg-dim)] text-center">
            Você foi convidado a enviar pedidos para{" "}
            <strong className="text-[var(--color-fg)]">
              {patrao?.nome ?? "seu gestor"}
            </strong>
          </p>
        </div>

        <form action={aceitarConviteAction} className="flex flex-col gap-3">
          <input type="hidden" name="token" value={token} />
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--color-fg-dim)]">Seu nome</span>
            <Input
              name="nome"
              defaultValue={convite.nome_sugerido ?? ""}
              required
              minLength={2}
              placeholder="João Silva"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--color-fg-dim)]">Usuário</span>
            <Input
              name="username"
              required
              minLength={3}
              placeholder="joao.silva"
              autoComplete="username"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--color-fg-dim)]">Senha</span>
            <Input
              type="password"
              name="senha"
              required
              minLength={6}
              placeholder="mínimo 6 caracteres"
              autoComplete="new-password"
            />
          </label>
          {error && (
            <p className="text-sm text-red-400">
              {erros[error] ?? decodeURIComponent(error)}
            </p>
          )}
          <Button type="submit" size="lg">
            Aceitar convite
          </Button>
        </form>
      </div>
    </main>
  );
}
