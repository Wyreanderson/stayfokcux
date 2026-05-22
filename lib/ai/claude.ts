import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/lib/env";
import {
  CATEGORIAS,
  STATUS_VALUES,
  type Classificacao,
  classificacaoSchema,
  loteSchema,
  type Lote,
  atualizacaoSchema,
  type AtualizacaoIA,
} from "./schemas";

const MODEL = "claude-sonnet-4-5";

function getClient() {
  return new Anthropic({ apiKey: env.anthropicKey() });
}

const SYSTEM_PROMPT = `Você é um assistente especializado em organização de tarefas de almoxarifado e oficina mecânica. Receba uma tarefa em linguagem natural (português brasileiro) e retorne JSON estruturado.

Regras:
- descricao_resumida: até 80 caracteres, claro e objetivo, sem perder informação essencial.
- categoria: escolha exatamente uma de [${CATEGORIAS.join(", ")}].
- prioridade: critica (cliente parado/produção bloqueada), alta (impacta hoje), media (até essa semana), baixa (quando puder).
- prazo_sugerido: data/hora ISO8601 quando houver pista temporal ("amanhã", "até 14h", "essa semana"); senão null.
- interruptivel: false se exige foco contínuo ou cliente esperando; true se pode ser pausada.
- recorrencia_detectada: true se a tarefa parece recorrente ou já apareceu no histórico do usuário.
- motivacao: 1-2 frases explicando a classificação.
- sugestao_horario: período ideal ("manhã", "fim do expediente") ou null.
- palavras_chave: 3 a 6 termos curtos para busca.

Sempre retorne JSON válido conforme a tool. Use o fuso de São Paulo (UTC-3) como referência para "hoje", "amanhã" etc.`;

const TOOL_CLASSIFICAR = {
  name: "registrar_tarefa",
  description: "Registra uma tarefa classificada no sistema",
  input_schema: {
    type: "object" as const,
    properties: {
      descricao_resumida: { type: "string" },
      categoria: { type: "string", enum: [...CATEGORIAS] },
      prioridade: {
        type: "string",
        enum: ["critica", "alta", "media", "baixa"],
      },
      prazo_sugerido: { type: ["string", "null"] },
      interruptivel: { type: "boolean" },
      recorrencia_detectada: { type: "boolean" },
      motivacao: { type: "string" },
      sugestao_horario: { type: ["string", "null"] },
      palavras_chave: { type: "array", items: { type: "string" } },
    },
    required: [
      "descricao_resumida",
      "categoria",
      "prioridade",
      "prazo_sugerido",
      "interruptivel",
      "recorrencia_detectada",
      "motivacao",
      "sugestao_horario",
      "palavras_chave",
    ],
  },
};

export async function classificarTarefa(
  descricao: string,
  contextoUsuario: { padroes: string[]; agora: string },
): Promise<Classificacao> {
  const client = getClient();
  const userPrompt = `Tarefa do usuário: """${descricao}"""

Padrões frequentes do usuário (use para detectar recorrência): ${
    contextoUsuario.padroes.length ? contextoUsuario.padroes.join(" | ") : "(nenhum ainda)"
  }
Data/hora atual: ${contextoUsuario.agora}

Classifique e chame a tool registrar_tarefa.`;

  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools: [TOOL_CLASSIFICAR],
    tool_choice: { type: "tool", name: "registrar_tarefa" },
    messages: [{ role: "user", content: userPrompt }],
  });

  const toolUse = res.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude não retornou tool_use");
  }
  return classificacaoSchema.parse(toolUse.input);
}

const TOOL_LOTE = {
  name: "registrar_lote",
  description: "Divide um despejo de voz em múltiplas tarefas classificadas",
  input_schema: {
    type: "object" as const,
    properties: {
      tarefas: {
        type: "array",
        items: {
          type: "object",
          properties: {
            descricao_original: { type: "string" },
            classificacao: TOOL_CLASSIFICAR.input_schema,
          },
          required: ["descricao_original", "classificacao"],
        },
      },
    },
    required: ["tarefas"],
  },
};

export async function classificarLote(
  transcricao: string,
  contextoUsuario: { padroes: string[]; agora: string },
): Promise<Lote> {
  const client = getClient();
  const userPrompt = `O usuário gravou um áudio descrevendo várias coisas. Separe em tarefas distintas (ignore conectivos/repetições) e classifique cada uma.

Transcrição: """${transcricao}"""

Padrões do usuário: ${contextoUsuario.padroes.join(" | ") || "(nenhum)"}
Data/hora atual: ${contextoUsuario.agora}

Retorne todas as tarefas via tool registrar_lote.`;

  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    tools: [TOOL_LOTE],
    tool_choice: { type: "tool", name: "registrar_lote" },
    messages: [{ role: "user", content: userPrompt }],
  });

  const toolUse = res.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude não retornou tool_use no Modo Caos");
  }
  return loteSchema.parse(toolUse.input);
}

const SYSTEM_PROMPT_ATUALIZACAO = `Você ajuda um almoxarife/mecânico a manter o estado de uma tarefa em andamento. A cada relato dele (áudio transcrito ou texto), você:
1. Resume em UMA frase o que aconteceu nessa atualização (resumo_acao).
2. Atualiza um resumo cumulativo curto do "onde parei" combinando o estado anterior + esse relato (resumo_atual_novo, 2 a 4 frases).
3. Decide se o status da tarefa precisa mudar:
   - agora: precisa ser feita já
   - em_breve: importante, próximas horas
   - pode_esperar: pode esperar dias
   - em_pausa: aguardando algo externo (cliente, fornecedor, peça)
   - concluida: terminada
   Se o status não precisa mudar, retorne novo_status = null.
4. Se mudou status, explique em razao_mudanca (1 frase). Senão, razao_mudanca = null.

Seja conciso, direto, em português brasileiro. Não invente fatos. Use o fuso de São Paulo.`;

const TOOL_ATUALIZACAO = {
  name: "registrar_atualizacao",
  description: "Registra uma atualização de progresso em uma tarefa existente",
  input_schema: {
    type: "object" as const,
    properties: {
      resumo_acao: { type: "string" },
      resumo_atual_novo: { type: "string" },
      novo_status: {
        type: ["string", "null"],
        enum: [...STATUS_VALUES, null],
      },
      razao_mudanca: { type: ["string", "null"] },
    },
    required: [
      "resumo_acao",
      "resumo_atual_novo",
      "novo_status",
      "razao_mudanca",
    ],
  },
};

export async function processarAtualizacao(input: {
  tarefa: {
    descricao: string;
    descricao_resumida: string | null;
    status: string;
    prioridade: string;
    motivacao: string | null;
    resumo_atual: string | null;
  };
  atualizacoesAnteriores: { resumo_acao: string; status_novo: string | null }[];
  novoRelato: string;
  agora: string;
}): Promise<AtualizacaoIA> {
  const client = getClient();

  const historicoTxt = input.atualizacoesAnteriores.length
    ? input.atualizacoesAnteriores
        .map(
          (a, i) =>
            `${i + 1}. ${a.resumo_acao}${
              a.status_novo ? ` (→ ${a.status_novo})` : ""
            }`,
        )
        .join("\n")
    : "(nenhuma)";

  const userPrompt = `Tarefa atual:
- Descrição: """${input.tarefa.descricao}"""
- Resumida: ${input.tarefa.descricao_resumida ?? "—"}
- Status atual: ${input.tarefa.status}
- Prioridade: ${input.tarefa.prioridade}
- Motivação inicial da IA: ${input.tarefa.motivacao ?? "—"}
- Resumo "onde parei" atual: ${input.tarefa.resumo_atual ?? "(ainda não há)"}

Atualizações anteriores (mais antigas → mais recentes):
${historicoTxt}

Novo relato do usuário: """${input.novoRelato}"""

Data/hora atual: ${input.agora}

Processe a atualização chamando a tool registrar_atualizacao.`;

  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT_ATUALIZACAO,
    tools: [TOOL_ATUALIZACAO],
    tool_choice: { type: "tool", name: "registrar_atualizacao" },
    messages: [{ role: "user", content: userPrompt }],
  });

  const toolUse = res.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude não retornou tool_use na atualização");
  }
  return atualizacaoSchema.parse(toolUse.input);
}
