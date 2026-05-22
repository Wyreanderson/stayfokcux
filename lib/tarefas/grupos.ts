import type { Prioridade, Status } from "@/lib/supabase/types";

export const GRUPOS = ["agora", "em_breve", "pode_esperar", "em_pausa"] as const;
export type Grupo = (typeof GRUPOS)[number];

export const GRUPO_META: Record<
  Grupo,
  { titulo: string; descricao: string; cor: string }
> = {
  agora: {
    titulo: "AGORA",
    descricao: "Crítico — Não pode esperar",
    cor: "var(--color-prio-critica)",
  },
  em_breve: {
    titulo: "EM BREVE",
    descricao: "Importante",
    cor: "var(--color-prio-alta)",
  },
  pode_esperar: {
    titulo: "PODE ESPERAR",
    descricao: "Secundário",
    cor: "var(--color-prio-media)",
  },
  em_pausa: {
    titulo: "EM PAUSA",
    descricao: "Aguardando algo",
    cor: "var(--color-prio-baixa)",
  },
};

export const PRIORIDADE_LABEL: Record<Prioridade, string> = {
  critica: "Crítica",
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

export const PRIORIDADE_COR: Record<Prioridade, string> = {
  critica: "var(--color-prio-critica)",
  alta: "var(--color-prio-alta)",
  media: "var(--color-prio-media)",
  baixa: "var(--color-prio-baixa)",
};

// Decide grupo (status) a partir da prioridade + prazo retornados pela IA.
export function statusInicial(
  prioridade: Prioridade,
  prazoIso: string | null,
): Status {
  if (prioridade === "critica") return "agora";
  if (prioridade === "alta") return "em_breve";

  if (prazoIso) {
    const prazo = new Date(prazoIso).getTime();
    const horas = (prazo - Date.now()) / 3_600_000;
    if (horas <= 4) return "agora";
    if (horas <= 48) return "em_breve";
  }

  if (prioridade === "media") return "pode_esperar";
  return "pode_esperar";
}
