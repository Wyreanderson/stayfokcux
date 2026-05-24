import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/shared/Logo";
import { login } from "./actions";

type SearchParams = Promise<{ error?: string; from?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { error, from } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <Logo size={40} />
          <p className="text-sm text-[var(--color-fg-dim)] text-center">
            Acesso restrito
          </p>
        </div>

        <form action={login} className="flex flex-col gap-3">
          <input type="hidden" name="from" value={from ?? "/"} />
          <Input
            type="text"
            name="usuario"
            placeholder="Usuário (colaborador)"
            autoComplete="username"
          />
          <Input
            type="password"
            name="senha"
            placeholder="Senha ou código"
            autoComplete="current-password"
            required
          />
          {error === "1" && (
            <p className="text-sm text-red-400 text-center">
              Credenciais inválidas.
            </p>
          )}
          <Button type="submit" size="lg">
            Entrar
          </Button>
          <p className="text-xs text-[var(--color-fg-dim)] text-center">
            Gestor entra só com o código. Colaborador preenche usuário + senha.
          </p>
        </form>
      </div>
    </main>
  );
}
