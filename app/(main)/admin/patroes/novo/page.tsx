import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireSessionUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { criarPatraoAction } from "../../actions";

type SearchParams = Promise<{ error?: string }>;

export default async function NovoPatraoPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireSessionUser("super_admin");
  const { error } = await searchParams;

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-6 flex flex-col gap-4">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-fg-dim)] -ml-1"
      >
        <ChevronLeft size={18} /> Voltar
      </Link>
      <h1 className="text-xl font-bold">Novo gestor</h1>

      <form action={criarPatraoAction} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-[var(--color-fg-dim)]">Nome</span>
          <Input name="nome" required minLength={2} placeholder="João da Silva" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-[var(--color-fg-dim)]">Email (opcional)</span>
          <Input type="email" name="email" placeholder="joao@empresa.com" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-[var(--color-fg-dim)]">
            Código de acesso (mínimo 6 caracteres — use letras + números)
          </span>
          <Input
            name="codigo_acesso"
            required
            minLength={6}
            placeholder="ex: oficina2024"
            autoComplete="off"
          />
          <span className="text-[10px] text-[var(--color-fg-dim)]">
            Quanto maior e mais aleatório, mais difícil de adivinhar. Anote num lugar seguro — não tem como recuperar.
          </span>
        </label>
        {error && (
          <p className="text-sm text-red-400">
            {error === "campos"
              ? "Preencha nome e código de acesso."
              : error === "codigo_curto"
                ? "Código precisa de pelo menos 6 caracteres."
                : error === "codigo_recusado"
                  ? "Não foi possível criar com esse código. Tente outro."
                  : decodeURIComponent(error)}
          </p>
        )}
        <Button type="submit" size="lg">
          Criar gestor
        </Button>
      </form>
    </main>
  );
}
