import { NextResponse } from "next/server";
import { transcreverAudio } from "@/lib/ai/whisper";
import { classificarLote } from "@/lib/ai/claude";
import { inserirTarefaClassificada } from "@/lib/tarefas/mutations";
import { statusInicial } from "@/lib/tarefas/grupos";
import { getPadroesDoUsuario } from "@/lib/tarefas/queries";
import { requireSessionUser } from "@/lib/auth/session";

export const runtime = "nodejs";
export const maxDuration = 90;

export async function POST(req: Request) {
  const user = await requireSessionUser();

  const form = await req.formData();
  const file = form.get("audio");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "Áudio ausente" }, { status: 400 });
  }

  let usuarioId: string;
  let solicitanteId: string | null = null;
  if (user.role === "colaborador") {
    if (!user.patrao_id) {
      return NextResponse.json(
        { error: "Colaborador sem patrão vinculado" },
        { status: 400 },
      );
    }
    usuarioId = user.patrao_id;
    solicitanteId = user.id;
  } else {
    usuarioId = user.id;
  }

  const transcricao = await transcreverAudio(file, "modo-caos.webm");
  const padroes = await getPadroesDoUsuario(usuarioId);
  const lote = await classificarLote(transcricao, {
    padroes,
    agora: new Date().toISOString(),
  });

  const inseridas = [];
  for (const item of lote.tarefas) {
    const t = await inserirTarefaClassificada({
      descricaoOriginal: item.descricao_original,
      classificacao: item.classificacao,
      status: statusInicial(
        item.classificacao.prioridade,
        item.classificacao.prazo_sugerido,
      ),
      fonte: "audio",
      usuarioId,
      solicitanteId,
    });
    inseridas.push(t);
  }

  return NextResponse.json({
    transcricao,
    total: inseridas.length,
    tarefas: inseridas,
  });
}
