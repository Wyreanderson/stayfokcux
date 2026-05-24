"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { BotaoGravar } from "./BotaoGravar";

type Aba = "texto" | "audio";

export function FormCaptura({ redirectTo = "/" }: { redirectTo?: string }) {
  const router = useRouter();
  const [aba, setAba] = useState<Aba>("texto");
  const [texto, setTexto] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar() {
    if (!texto.trim()) return;
    setEnviando(true);
    setErro(null);
    console.log("[FormCaptura] enviando:", {
      tamanho: texto.trim().length,
      fonte: audioUrl ? "audio" : "texto",
    });
    try {
      const res = await fetch("/api/classificar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          descricao: texto.trim(),
          fonte: audioUrl ? "audio" : "texto",
          audioUrl,
        }),
      });
      console.log(
        "[FormCaptura] resposta:",
        res.status,
        res.statusText,
        "url:",
        res.url,
      );
      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        const corpo = await res.text();
        const ehLogin = res.url.includes("/login");
        throw new Error(
          ehLogin
            ? "Sessão expirou. Faça logout e login de novo (você foi redirecionado para /login)."
            : `Resposta não-JSON (${res.status}): ${corpo.slice(0, 120)}`,
        );
      }
      if (!res.ok) {
        const corpo = await res.text();
        throw new Error(`HTTP ${res.status}: ${corpo.slice(0, 200)}`);
      }
      const json = await res.json();
      console.log("[FormCaptura] tarefa criada:", json?.tarefa?.id);
      router.push(redirectTo);
      router.refresh();
    } catch (e) {
      console.error("[FormCaptura] erro:", e);
      const msg = e instanceof Error ? e.message : "Erro desconhecido";
      setErro(`Falha ao enviar: ${msg}`);
      setEnviando(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 rounded-full bg-[var(--color-bg-elev)] p-1 self-center">
        {(["texto", "audio"] as const).map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAba(a)}
            className={
              "px-5 py-2 rounded-full text-sm font-medium transition " +
              (aba === a
                ? "bg-[var(--color-primary)] text-[#0a2e28]"
                : "text-[var(--color-fg-dim)]")
            }
          >
            {a === "texto" ? "Texto" : "Áudio"}
          </button>
        ))}
      </div>

      {aba === "audio" && (
        <BotaoGravar
          onResultado={(json) => {
            const t = typeof json.texto === "string" ? json.texto : "";
            const url = typeof json.audioUrl === "string" ? json.audioUrl : null;
            setTexto(t);
            setAudioUrl(url);
            setAba("texto");
          }}
        />
      )}

      <Textarea
        autoFocus
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder='Ex: "comprar óleo hidráulico até amanhã" ou "lançar nota fiscal, cliente está esperando"'
        className="min-h-[180px]"
      />

      {erro && <p className="text-sm text-red-400">{erro}</p>}

      <Button
        type="button"
        onClick={enviar}
        disabled={!texto.trim() || enviando}
        size="lg"
      >
        {enviando ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Classificando com IA...
          </>
        ) : (
          <>
            <Send size={18} /> Adicionar tarefa
          </>
        )}
      </Button>
    </div>
  );
}
