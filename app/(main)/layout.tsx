import Link from "next/link";
import { LogOut } from "lucide-react";
import { BottomNav } from "@/components/shared/BottomNav";
import { FabCaptura } from "@/components/shared/FabCaptura";
import { Logo } from "@/components/shared/Logo";
import { requireSessionUser } from "@/lib/auth/session";
import { logout } from "@/app/login/actions";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireSessionUser(["patrao", "super_admin"]);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <header className="sticky top-0 z-20 bg-[var(--color-bg)]/95 backdrop-blur border-b border-[var(--color-border)]/40 pt-[env(safe-area-inset-top)]">
        <div className="mx-auto max-w-md px-4 py-3 flex items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--color-fg-dim)] uppercase tracking-wide">
              {user.nome}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="text-xs text-[var(--color-fg-dim)] inline-flex items-center gap-1"
                aria-label="Sair"
              >
                <LogOut size={14} />
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-[calc(env(safe-area-inset-bottom)+120px)] pt-3">
        {children}
      </main>
      <FabCaptura />
      <BottomNav role={user.role} />
    </div>
  );
}
