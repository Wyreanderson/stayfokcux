import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { FormCaptura } from "@/components/captura/FormCaptura";
import { requireSessionUser } from "@/lib/auth/session";

export default async function NovaSolicitacaoPage() {
  await requireSessionUser("colaborador");
  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/colaborador"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-fg-dim)] -ml-1"
      >
        <ChevronLeft size={18} /> Voltar
      </Link>
      <div>
        <h1 className="text-2xl font-bold">Nova solicitação</h1>
        <p className="text-sm text-[var(--color-fg-dim)]">
          Fale ou digite — a IA classifica e envia ao seu gestor.
        </p>
      </div>
      <FormCaptura redirectTo="/colaborador" />
    </div>
  );
}
