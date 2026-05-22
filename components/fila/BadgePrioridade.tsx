import { Badge } from "@/components/ui/badge";
import { PRIORIDADE_COR, PRIORIDADE_LABEL } from "@/lib/tarefas/grupos";
import type { Prioridade } from "@/lib/supabase/types";

export function BadgePrioridade({ prioridade }: { prioridade: Prioridade }) {
  return (
    <Badge
      className="text-[10px] uppercase"
      style={{
        background: PRIORIDADE_COR[prioridade],
        color: prioridade === "media" ? "#0a2e28" : "#0a2e28",
      }}
    >
      {PRIORIDADE_LABEL[prioridade]}
    </Badge>
  );
}
