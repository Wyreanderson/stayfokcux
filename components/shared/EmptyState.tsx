import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export function EmptyState({
  title = "Tudo limpo!",
  description = "Nenhuma tarefa pendente. Toque no botão verde para adicionar uma.",
  cta,
}: {
  title?: string;
  description?: string;
  cta?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-20 w-20 rounded-full bg-[var(--color-bg-elev)] flex items-center justify-center mb-4">
        <CheckCircle2 size={40} className="text-[var(--color-primary)]" />
      </div>
      <h2 className="text-lg font-semibold mb-1">{title}</h2>
      <p className="text-sm text-[var(--color-fg-muted)] max-w-xs">
        {description}
      </p>
      {cta && (
        <Link
          href={cta.href}
          className="mt-6 rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-[#0a2e28]"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}
