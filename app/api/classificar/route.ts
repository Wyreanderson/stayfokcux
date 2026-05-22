import { NextResponse } from "next/server";
import { z } from "zod";
import { classificarTarefa } from "@/lib/ai/claude";
import { statusInicial } from "@/lib/tarefas/grupos";
import { inserirTarefaClassificada } from "@/lib/tarefas/mutations";
import { getPadroesDoUsuario } from "@/lib/tarefas/queries";

const body = z.object({
  descricao: z.string().min(2).max(2000),
  fonte: z.enum(["texto", "audio"]).default("texto"),
  audioUrl: z.string().nullable().optional(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}));
  const parse = body.safeParse(json);
  if (!parse.success) {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const padroes = await getPadroesDoUsuario();
  const classificacao = await classificarTarefa(parse.data.descricao, {
    padroes,
    agora: new Date().toISOString(),
  });

  const tarefa = await inserirTarefaClassificada({
    descricaoOriginal: parse.data.descricao,
    classificacao,
    status: statusInicial(classificacao.prioridade, classificacao.prazo_sugerido),
    fonte: parse.data.fonte,
    audioUrl: parse.data.audioUrl ?? null,
  });

  return NextResponse.json({ tarefa, classificacao });
}
