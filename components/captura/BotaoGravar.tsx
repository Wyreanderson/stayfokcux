"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Estado = "idle" | "gravando" | "processando" | "erro";

export function BotaoGravar({
  onResultado,
  endpoint = "/api/transcrever",
}: {
  onResultado: (json: Record<string, unknown>) => void;
  endpoint?: string;
}) {
  const [estado, setEstado] = useState<Estado>("idle");
  const [tempo, setTempo] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const tempoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      pararStream();
      if (tempoRef.current) clearInterval(tempoRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  function pararStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function desenharWaveform() {
    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    if (!analyser || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const buf = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteTimeDomainData(buf);
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = "#34d399";
      ctx.lineWidth = 2;
      ctx.beginPath();
      const slice = width / buf.length;
      let x = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = buf[i] / 128.0;
        const y = (v * height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += slice;
      }
      ctx.stroke();
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
  }

  async function iniciar() {
    setErro(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;
      desenharWaveform();

      const rec = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = enviar;
      rec.start();
      recorderRef.current = rec;

      setEstado("gravando");
      setTempo(0);
      tempoRef.current = setInterval(() => setTempo((s) => s + 1), 1000);
    } catch (e) {
      console.error(e);
      setErro("Permita o acesso ao microfone para gravar.");
      setEstado("erro");
    }
  }

  function parar() {
    if (tempoRef.current) clearInterval(tempoRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    recorderRef.current?.stop();
    setEstado("processando");
  }

  async function enviar() {
    try {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      pararStream();
      const form = new FormData();
      form.append("audio", blob, "tarefa.webm");
      const res = await fetch(endpoint, { method: "POST", body: form });
      if (!res.ok) throw new Error(`Falha ${res.status}`);
      const json = (await res.json()) as Record<string, unknown>;
      onResultado(json);
      setEstado("idle");
      setTempo(0);
    } catch (e) {
      console.error(e);
      setErro("Não foi possível processar o áudio. Tente novamente.");
      setEstado("erro");
    }
  }

  const ativo = estado === "gravando";
  const processando = estado === "processando";

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        width={320}
        height={80}
        className={cn(
          "rounded-lg bg-[var(--color-bg-elev)] w-full max-w-[320px]",
          !ativo && "opacity-30",
        )}
      />
      <div className="text-2xl font-mono tabular-nums">
        {String(Math.floor(tempo / 60)).padStart(2, "0")}:
        {String(tempo % 60).padStart(2, "0")}
      </div>
      <button
        type="button"
        onClick={ativo ? parar : iniciar}
        disabled={processando}
        className={cn(
          "h-20 w-20 rounded-full flex items-center justify-center transition-all active:scale-95",
          ativo
            ? "bg-red-500 text-white pulse-ring"
            : "bg-[var(--color-primary)] text-[#0a2e28]",
          processando && "opacity-70",
        )}
        aria-label={ativo ? "Parar gravação" : "Iniciar gravação"}
      >
        {processando ? (
          <Loader2 size={32} className="animate-spin" />
        ) : ativo ? (
          <Square size={28} fill="currentColor" />
        ) : (
          <Mic size={32} strokeWidth={2.5} />
        )}
      </button>
      <p className="text-xs text-[var(--color-fg-dim)] text-center max-w-xs">
        {ativo
          ? "Fale a tarefa e toque para parar."
          : processando
            ? "Transcrevendo..."
            : "Toque no microfone para gravar a tarefa."}
      </p>
      {erro && <p className="text-xs text-red-400">{erro}</p>}
    </div>
  );
}
