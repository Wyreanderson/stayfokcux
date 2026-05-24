import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { processarAtualizacao } from "@/lib/ai/claude";
import { transcreverAudio } from "@/lib/ai/whisper";
import { createSupabaseService } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { requireSessionUser } from "@/lib/auth/session";
import type { Status, Tarefa } from "@/lib/supabase/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const textoBody = z.object({ texto: z.string().min(2).max(2000) });

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await requireSessionUser();
  const svc = createSupabaseService();

  let conteudo = "";
  let fonte: "texto" | "audio" = "texto";
  let audioUrl: string | null = null;

  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("audio");
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "Áudio ausente" }, { status: 400 });
    }
    conteudo = await transcreverAudio(file, "atualizacao.webm");
    fonte = "audio";

    try {
      const ownerId = user.role === "colaborador" ? user.patrao_id : user.id;
      const path = `${ownerId}/atualizacoes/${id}/${Date.now()}.webm`;
      const { error: upErr } = await svc.storage
        .from(env.storageBucket())
        .upload(path, file, {
          contentType: file.type || "audio/webm",
          upsert: false,
        });
      if (!upErr) audioUrl = path;
    } catch {
      audioUrl = null;
    }
  } else {
    const json = await req.json().catch(() => ({}));
    const parse = textoBody.safeParse(json);
    if (!parse.success) {
      return NextResponse.json(
        { error: "Texto inválido (mínimo 2 caracteres)" },
        { status: 400 },
      );
    }
    conteudo = parse.data.texto;
    fonte = "texto";
  }

  const { data: tarefa } = await svc
    .from("tarefas")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!tarefa) {
    return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 });
  }

  const t = tarefa as Tarefa;

  const { data: anteriores } = await svc
    .from("atualizacoes_tarefa")
    .select("resumo_acao,status_novo")
    .eq("tarefa_id", id)
    .order("created_at", { ascending: true })
    .limit(10);

  const resultado = await processarAtualizacao({
    tarefa: {
      descricao: t.descricao,
      descricao_resumida: t.descricao_resumida,
      status: t.status,
      prioridade: t.prioridade,
      motivacao: t.motivacao,
      resumo_atual: t.resumo_atual,
    },
    atualizacoesAnteriores: (anteriores ?? []) as {
      resumo_acao: string;
      status_novo: string | null;
    }[],
    novoRelato: conteudo,
    agora: new Date().toISOString(),
  });

  const statusMudou =
    resultado.novo_status && resultado.novo_status !== t.status;
  const statusNovo: Status | null = statusMudou
    ? (resultado.novo_status as Status)
    : null;

  const { error: insErr } = await svc.from("atualizacoes_tarefa").insert({
    tarefa_id: id,
    fonte,
    conteudo_original: conteudo,
    resumo_acao: resultado.resumo_acao,
    audio_url: audioUrl,
    status_anterior: t.status,
    status_novo: statusNovo,
    razao_mudanca: resultado.razao_mudanca,
  });
  if (insErr) {
    return NextResponse.json(
      { error: "Falha ao registrar atualização", detail: insErr.message },
      { status: 500 },
    );
  }

  const patch: Record<string, unknown> = {
    resumo_atual: resultado.resumo_atual_novo,
    updated_at: new Date().toISOString(),
  };
  if (statusNovo) patch.status = statusNovo;

  await svc.from("tarefas").update(patch).eq("id", id);

  if (statusMudou) {
    await svc
      .from("historico")
      .insert({ tarefa_id: id, acao: `status: ${t.status} → ${statusNovo}` });
  }

  revalidatePath(`/tarefa/${id}`);
  revalidatePath("/");
  revalidatePath("/historico");

  return NextResponse.json({
    ok: true,
    resumo_acao: resultado.resumo_acao,
    resumo_atual: resultado.resumo_atual_novo,
    status_anterior: t.status,
    status_novo: statusNovo,
    razao_mudanca: resultado.razao_mudanca,
  });
}
