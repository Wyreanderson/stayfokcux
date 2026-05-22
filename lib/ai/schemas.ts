import { z } from "zod";

export const CATEGORIAS = [
  "Peças",
  "Ferramentas",
  "Compras",
  "Administrativo",
  "Estoque",
  "Orçamento",
  "Notas Fiscais",
  "Outros",
] as const;

export const classificacaoSchema = z.object({
  descricao_resumida: z.string().min(1).max(120),
  categoria: z.enum(CATEGORIAS),
  prioridade: z.enum(["critica", "alta", "media", "baixa"]),
  prazo_sugerido: z.string().nullable().describe("ISO8601 ou null"),
  interruptivel: z.boolean(),
  recorrencia_detectada: z.boolean(),
  motivacao: z.string().min(1).max(280),
  sugestao_horario: z.string().nullable(),
  palavras_chave: z.array(z.string()).max(8),
});

export type Classificacao = z.infer<typeof classificacaoSchema>;

export const loteSchema = z.object({
  tarefas: z.array(
    z.object({
      descricao_original: z.string().min(1),
      classificacao: classificacaoSchema,
    }),
  ),
});

export type Lote = z.infer<typeof loteSchema>;

export const STATUS_VALUES = [
  "agora",
  "em_breve",
  "pode_esperar",
  "em_pausa",
  "concluida",
] as const;

export const atualizacaoSchema = z.object({
  resumo_acao: z.string().min(1).max(280),
  resumo_atual_novo: z.string().min(1).max(1500),
  novo_status: z.enum(STATUS_VALUES).nullable(),
  razao_mudanca: z.string().nullable(),
});

export type AtualizacaoIA = z.infer<typeof atualizacaoSchema>;
