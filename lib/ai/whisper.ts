import OpenAI from "openai";
import { env } from "@/lib/env";

let _client: OpenAI | null = null;
function getClient() {
  if (!_client) _client = new OpenAI({ apiKey: env.openaiKey() });
  return _client;
}

export async function transcreverAudio(blob: Blob, filename = "audio.webm") {
  const file = new File([blob], filename, { type: blob.type || "audio/webm" });
  const res = await getClient().audio.transcriptions.create({
    file,
    model: "whisper-1",
    language: "pt",
    response_format: "text",
  });
  // SDK retorna string quando response_format = text
  return typeof res === "string" ? res : (res as { text: string }).text;
}
