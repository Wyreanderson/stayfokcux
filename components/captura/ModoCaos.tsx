"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { BotaoGravar } from "./BotaoGravar";
import { Card } from "@/components/ui/card";

export function ModoCaos() {
  const router = useRouter();
  const [resultado, setResultado] = useState<{
    transcricao: string;
    total: number;
  } | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex items-start gap-2">
          <Sparkles size={20} className="text-[var(--color-primary)] mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Despeje tudo de uma vez.</p>
            <p className="text-xs text-[var(--color-fg-dim)] mt-1">
              Grave todas as tarefas que estão na sua cabeça. A IA separa,
              classifica e organiza no fluxo.
            </p>
          </div>
        </div>
      </Card>

      <BotaoGravar
        endpoint="/api/modo-caos"
        onResultado={(json) => {
          const transcricao =
            typeof json.transcricao === "string" ? json.transcricao : "";
          const total = typeof json.total === "number" ? json.total : 0;
          setResultado({ transcricao, total });
          setTimeout(() => {
            router.push("/");
            router.refresh();
          }, 1800);
        }}
      />

      {resultado && (
        <Card>
          <p className="text-sm font-semibold text-[var(--color-primary)]">
            {resultado.total} tarefa(s) criada(s).
          </p>
          <p className="text-xs text-[var(--color-fg-dim)] mt-1 italic">
            “{resultado.transcricao}”
          </p>
        </Card>
      )}
    </div>
  );
}
