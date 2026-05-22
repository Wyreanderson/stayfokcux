import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ModoCaos } from "@/components/captura/ModoCaos";

export default function ModoCaosPage() {
  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-fg-dim)] -ml-1"
      >
        <ChevronLeft size={18} /> Voltar
      </Link>
      <div>
        <h1 className="text-2xl font-bold">Modo Caos</h1>
        <p className="text-sm text-[var(--color-fg-dim)]">
          Várias tarefas, uma gravação só.
        </p>
      </div>
      <ModoCaos />
    </div>
  );
}
