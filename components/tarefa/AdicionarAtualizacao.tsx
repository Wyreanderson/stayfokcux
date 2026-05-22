"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Mic, MessageSquare, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { BotaoGravar } from "@/components/captura/BotaoGravar";
import { cn } from "@/lib/utils";

type Modo = "audio" | "texto";

export function AdicionarAtualizacao({ tarefaId }: { tarefaId: string }) {
  const router = useRouter();
  const [modo, setModo] = useState<Modo>("audio");
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const endpoint = `/api/tarefa/${tarefaId}/atualizar`;

  function aoReceberResposta() {
    setTexto("");
    setErro(null);
    router.refresh();
  }

  async function enviarTexto() {
    if (texto.trim().length < 2) {
      setErro("Escreva pelo menos 2 caracteres.");
      return;
    }
    setErro(null);
    startTransition(async () => {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texto: texto.trim() }),
        });
        if (!res.ok) throw new Error(`Falha ${res.status}`);
        aoReceberResposta();
      } catch (e) {
        console.error(e);
        setErro("Não foi possível enviar. Tente novamente.");
      }
    });
  }

  return (
    <div className="rounded-xl bg-[var(--color-bg-elev)] border border-[var(--color-border)] p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase tracking-wide text-[var(--color-fg-dim)]">
          Adicionar atualização
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1 rounded-xl bg-[var(--color-bg)] p-1">
        <button
          type="button"
          onClick={() => setModo("audio")}
          className={cn(
            "flex items-center justify-center gap-2 h-10 rounded-lg text-sm transition-colors",
            modo === "audio"
              ? "bg-[var(--color-bg-card)] text-[var(--color-fg)]"
              : "text-[var(--color-fg-dim)]",
          )}
        >
          <Mic size={16} /> Áudio
        </button>
        <button
          type="button"
          onClick={() => setModo("texto")}
          className={cn(
            "flex items-center justify-center gap-2 h-10 rounded-lg text-sm transition-colors",
            modo === "texto"
              ? "bg-[var(--color-bg-card)] text-[var(--color-fg)]"
              : "text-[var(--color-fg-dim)]",
          )}
        >
          <MessageSquare size={16} /> Texto
        </button>
      </div>

      {modo === "audio" ? (
        <BotaoGravar
          endpoint={endpoint}
          onResultado={() => aoReceberResposta()}
        />
      ) : (
        <div className="flex flex-col gap-2">
          <Textarea
            placeholder="O que aconteceu? Ex.: 'falei com o fornecedor, peça chega quinta'"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            disabled={isPending}
          />
          <Button
            type="button"
            onClick={enviarTexto}
            disabled={isPending || texto.trim().length < 2}
          >
            {isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            Enviar
          </Button>
        </div>
      )}

      {erro && <p className="text-xs text-red-400">{erro}</p>}
    </div>
  );
}
