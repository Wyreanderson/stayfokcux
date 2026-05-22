import Link from "next/link";
import { BottomNav } from "@/components/shared/BottomNav";
import { FabCaptura } from "@/components/shared/FabCaptura";
import { Logo } from "@/components/shared/Logo";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <header className="sticky top-0 z-20 bg-[var(--color-bg)]/95 backdrop-blur border-b border-[var(--color-border)]/40">
        <div className="mx-auto max-w-md px-4 py-3 flex items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>
          <span className="text-xs text-[var(--color-fg-dim)] uppercase tracking-wide">
            Almoxarife
          </span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-[calc(env(safe-area-inset-bottom)+120px)] pt-3">
        {children}
      </main>
      <FabCaptura />
      <BottomNav />
    </div>
  );
}
