import { NextResponse } from "next/server";
import { transcreverAudio } from "@/lib/ai/whisper";
import { createSupabaseService } from "@/lib/supabase/server";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("audio");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "Áudio ausente" }, { status: 400 });
  }

  const texto = await transcreverAudio(file, "tarefa.webm");

  // Upload do blob original para Storage (opcional, mas útil para auditoria/reuso).
  let audioUrl: string | null = null;
  try {
    const svc = createSupabaseService();
    const path = `${env.defaultUserId()}/${Date.now()}.webm`;
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

  return NextResponse.json({ texto, audioUrl });
}
