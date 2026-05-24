import Link from "next/link";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { ColaboradorNav } from "@/components/colaborador/ColaboradorNav";
import { requireSessionUser } from "@/lib/auth/session";
import { createSupabaseService } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";

export default async function ColaboradorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireSessionUser("colaborador");
  const svc = createSupabaseService();
  const { data: patrao } = await svc
    .from("usuarios")
    .select("nome")
    .eq("id", user.patrao_id ?? "")
    .maybeSingle();

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <header className="sticky top-0 z-20 bg-[var(--color-bg)]/95 backdrop-blur border-b border-[var(--color-border)]/40 pt-[env(safe-area-inset-top)]">
        <div className="mx-auto max-w-md px-4 py-3 flex items-center justify-between">
          <Link href="/colaborador">
            <Logo />
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="text-xs text-[var(--color-fg-dim)] inline-flex items-center gap-1"
              aria-label="Sair"
            >
              <LogOut size={14} /> Sair
            </button>
          </form>
        </div>
        <div className="mx-auto max-w-md px-4 pb-2 text-xs text-[var(--color-fg-dim)]">
          Enviando para{" "}
          <span className="text-[var(--color-fg)] font-medium">
            {patrao?.nome ?? "—"}
          </span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-[calc(env(safe-area-inset-bottom)+90px)] pt-3">
        {children}
      </main>
      <ColaboradorNav />
    </div>
  );
}
