"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseService } from "@/lib/supabase/server";
import type { Prioridade, Status, Tarefa } from "@/lib/supabase/types";

function svc() {
  return createSupabaseService();
}

async function registrarHistorico(tarefaId: string, acao: string) {
  await svc().from("historico").insert({ tarefa_id: tarefaId, acao });
}

export async function atualizarTarefa(formData: FormData) {
  const id = String(formData.get("id"));
  const patch = {
    descricao: String(formData.get("descricao") ?? "").trim(),
    descricao_resumida:
      String(formData.get("descricao_resumida") ?? "").trim() || null,
    categoria_id: (formData.get("categoria_id") as string) || null,
    prioridade: formData.get("prioridade") as Prioridade,
    prazo: (formData.get("prazo") as string) || null,
    interruptivel: formData.get("interruptivel") === "on",
    status: formData.get("status") as Status,
    notas: (formData.get("notas") as string) || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await svc().from("tarefas").update(patch).eq("id", id);
  if (error) throw error;
  await registrarHistorico(id, "editada");

  revalidatePath("/");
  revalidatePath(`/tarefa/${id}`);
  redirect("/");
}

export async function concluirTarefa(id: string) {
  await svc()
    .from("tarefas")
    .update({ status: "concluida", updated_at: new Date().toISOString() })
    .eq("id", id);
  await registrarHistorico(id, "concluida");
  revalidatePath("/");
  revalidatePath("/historico");
}

export async function recusarTarefa(formData: FormData) {
  const id = String(formData.get("id"));
  const motivo = String(formData.get("motivo") ?? "").trim() || null;
  await svc()
    .from("tarefas")
    .update({
      status: "recusada",
      recusada_motivo: motivo,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  await registrarHistorico(id, motivo ? `recusada: ${motivo}` : "recusada");
  revalidatePath("/");
  revalidatePath(`/tarefa/${id}`);
  revalidatePath("/historico");
  redirect("/");
}

export async function reabrirTarefa(id: string) {
  await svc()
    .from("tarefas")
    .update({ status: "em_breve", updated_at: new Date().toISOString() })
    .eq("id", id);
  await registrarHistorico(id, "reaberta");
  revalidatePath("/");
  revalidatePath("/historico");
}

export async function excluirTarefa(id: string) {
  await svc().from("tarefas").delete().eq("id", id);
  revalidatePath("/");
  revalidatePath("/historico");
  redirect("/");
}

export async function pausarOuRetomar(id: string, paraPausa: boolean) {
  await svc()
    .from("tarefas")
    .update({
      status: paraPausa ? "em_pausa" : "em_breve",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  await registrarHistorico(id, paraPausa ? "pausada" : "retomada");
  revalidatePath("/");
}

export async function inserirTarefaClassificada(payload: {
  descricaoOriginal: string;
  classificacao: {
    descricao_resumida: string;
    categoria: string;
    prioridade: Prioridade;
    prazo_sugerido: string | null;
    interruptivel: boolean;
    recorrencia_detectada: boolean;
    motivacao: string;
    sugestao_horario: string | null;
    palavras_chave: string[];
  };
  status: Status;
  fonte: "texto" | "audio";
  audioUrl?: string | null;
  usuarioId: string;
  solicitanteId?: string | null;
}): Promise<Tarefa> {
  const s = svc();
  const userId = payload.usuarioId;
  const { data: cat } = await s
    .from("categorias")
    .select("id")
    .eq("nome", payload.classificacao.categoria)
    .maybeSingle();

  const { data: existentes } = await s
    .from("tarefas")
    .select("id,recorrencia,palavras_chave")
    .eq("usuario_id", userId)
    .overlaps("palavras_chave", payload.classificacao.palavras_chave);

  const recorrencia = (existentes?.length ?? 0) + 1;

  const { data: nova, error } = await s
    .from("tarefas")
    .insert({
      usuario_id: userId,
      solicitante_id: payload.solicitanteId ?? null,
      descricao: payload.descricaoOriginal,
      descricao_resumida: payload.classificacao.descricao_resumida,
      categoria_id: cat?.id ?? null,
      prioridade: payload.classificacao.prioridade,
      prazo: payload.classificacao.prazo_sugerido,
      interruptivel: payload.classificacao.interruptivel,
      status: payload.status,
      recorrencia,
      motivacao: payload.classificacao.motivacao,
      sugestao_horario: payload.classificacao.sugestao_horario,
      palavras_chave: payload.classificacao.palavras_chave,
      fonte: payload.fonte,
      audio_url: payload.audioUrl ?? null,
    })
    .select("*, categoria:categorias(id, nome, icone, cor)")
    .single();

  if (error || !nova) throw error ?? new Error("Falha ao inserir tarefa");

  await s.from("historico").insert({ tarefa_id: nova.id, acao: "criada" });

  for (const palavra of payload.classificacao.palavras_chave) {
    const { data: existe } = await s
      .from("padroes_usuario")
      .select("id,frequencia")
      .eq("usuario_id", userId)
      .eq("padrao", palavra)
      .maybeSingle();
    if (existe) {
      await s
        .from("padroes_usuario")
        .update({
          frequencia: existe.frequencia + 1,
          ultima_ocorrencia: new Date().toISOString(),
        })
        .eq("id", existe.id);
    } else {
      await s
        .from("padroes_usuario")
        .insert({ usuario_id: userId, padrao: palavra, frequencia: 1 });
    }
  }

  return nova as Tarefa;
}
