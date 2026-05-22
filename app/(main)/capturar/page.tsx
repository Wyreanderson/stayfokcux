import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { FormCaptura } from "@/components/captura/FormCaptura";

export default function CapturarPage() {
  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-fg-dim)] -ml-1"
      >
        <ChevronLeft size={18} /> Voltar
      </Link>
      <div>
        <h1 className="text-2xl font-bold">Nova tarefa</h1>
        <p className="text-sm text-[var(--color-fg-dim)]">
          Fale ou digite — a IA cuida do resto.
        </p>
      </div>
      <FormCaptura />
    </div>
  );
}
