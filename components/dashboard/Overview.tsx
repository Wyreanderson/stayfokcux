"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Zap,
  Clock,
  Pause,
  LayoutGrid,
  Wrench,
  Hammer,
  ShoppingCart,
  ClipboardList,
  Package,
  Calculator,
  FileText,
  CircleDot,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusCardData = {
  href: string;
  icon: LucideIcon;
  label: string;
  count: number;
  color: string;
  bg: string;
};

type CategoriaItem = {
  nome: string;
  count: number;
  cor: string | null;
  icone: string | null;
};

const ICON_MAP: Record<string, LucideIcon> = {
  wrench: Wrench,
  hammer: Hammer,
  "shopping-cart": ShoppingCart,
  "clipboard-list": ClipboardList,
  package: Package,
  calculator: Calculator,
  "file-text": FileText,
  "circle-dot": CircleDot,
};

// Paleta legível no tema escuro — sobrescreve cores do seed (que são todas tons de verde escuro).
const CATEGORIA_COR: Record<string, string> = {
  Peças: "#34d399",
  Ferramentas: "#fbbf24",
  Compras: "#f472b6",
  Administrativo: "#60a5fa",
  Estoque: "#fb923c",
  Orçamento: "#a78bfa",
  "Notas Fiscais": "#22d3ee",
  Outros: "#cbd5e1",
};

function corDaCategoria(nome: string, fallback: string | null) {
  return CATEGORIA_COR[nome] || fallback || "#10b981";
}

function Sparkline({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 60 20"
      width="56"
      height="18"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M 2 14 Q 8 2 16 12 T 30 10 T 44 8 T 58 4" />
    </svg>
  );
}

function StatusCard({ data }: { data: StatusCardData }) {
  const Icon = data.icon;
  return (
    <Link
      href={data.href}
      className="group rounded-2xl bg-[var(--color-bg-card)] border p-3 flex flex-col gap-2 transition-colors hover:bg-[var(--color-bg-elev)] active:scale-[0.98]"
      style={{ borderColor: data.bg }}
    >
      <div className="flex items-start justify-between">
        <div
          className="h-7 w-7 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: data.bg }}
        >
          <Icon size={16} style={{ color: data.color }} strokeWidth={2.5} />
        </div>
        <Sparkline color={data.color} />
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div
            className="text-3xl font-bold leading-none"
            style={{ color: data.color }}
          >
            {data.count}
          </div>
          <div className="text-xs text-[var(--color-fg-dim)] mt-1">
            {data.label}
          </div>
        </div>
        <ChevronRight
          size={16}
          className="text-[var(--color-fg-dim)] group-hover:translate-x-0.5 transition-transform"
        />
      </div>
    </Link>
  );
}

function CategoriaRow({ item }: { item: CategoriaItem }) {
  const Icon = (item.icone && ICON_MAP[item.icone]) || CircleDot;
  const cor = corDaCategoria(item.nome, item.cor);
  return (
    <Link
      href={`/?categoria=${encodeURIComponent(item.nome)}`}
      className="group rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] p-3 flex items-center gap-3 transition-colors hover:bg-[var(--color-bg-elev)] active:scale-[0.99]"
    >
      <div
        className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${cor}33` }}
      >
        <Icon size={18} style={{ color: cor }} strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.nome}</p>
      </div>
      <div
        className="text-2xl font-bold leading-none tabular-nums"
        style={{ color: cor }}
      >
        {item.count}
      </div>
      <ChevronRight
        size={16}
        className="text-[var(--color-fg-dim)] group-hover:translate-x-0.5 transition-transform shrink-0"
      />
    </Link>
  );
}

export function Overview({
  porStatus,
  porCategoria,
}: {
  porStatus: { hoje: number; emBreve: number; pausadas: number; total: number };
  porCategoria: CategoriaItem[];
}) {
  const [slide, setSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = () => {
      const idx = Math.round(el.scrollLeft / el.clientWidth);
      setSlide(idx);
    };
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, []);

  function irParaSlide(idx: number) {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
  }

  const statusCards: StatusCardData[] = [
    {
      href: "/#grupo-agora",
      icon: Zap,
      label: "Hoje",
      count: porStatus.hoje,
      color: "var(--color-prio-critica)",
      bg: "rgba(239, 68, 68, 0.15)",
    },
    {
      href: "/#grupo-em_breve",
      icon: Clock,
      label: "Em breve",
      count: porStatus.emBreve,
      color: "var(--color-prio-alta)",
      bg: "rgba(245, 158, 11, 0.15)",
    },
    {
      href: "/#grupo-em_pausa",
      icon: Pause,
      label: "Pausadas",
      count: porStatus.pausadas,
      color: "var(--color-prio-baixa)",
      bg: "rgba(56, 189, 248, 0.15)",
    },
    {
      href: "/#grupo-pode_esperar",
      icon: LayoutGrid,
      label: "Todas abertas",
      count: porStatus.total,
      color: "var(--color-primary)",
      bg: "rgba(16, 185, 129, 0.15)",
    },
  ];

  const categoriasOrdenadas = porCategoria
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold tracking-wide uppercase">
          {slide === 0 ? "Visão geral" : "Pendências por categoria"}
        </h2>
        <div className="flex gap-1.5">
          {[0, 1].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => irParaSlide(i)}
              aria-label={`Slide ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all",
                slide === i
                  ? "w-5 bg-[var(--color-primary)]"
                  : "w-1.5 bg-[var(--color-border)]",
              )}
            />
          ))}
        </div>
      </div>
      <div
        ref={containerRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-3 -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="snap-start shrink-0 w-full grid grid-cols-2 gap-2">
          {statusCards.map((c) => (
            <StatusCard key={c.href} data={c} />
          ))}
        </div>
        <div className="snap-start shrink-0 w-full flex flex-col gap-2">
          {categoriasOrdenadas.length === 0 ? (
            <div className="rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] p-6 text-center text-sm text-[var(--color-fg-dim)]">
              Sem pendências em nenhuma categoria.
            </div>
          ) : (
            categoriasOrdenadas.map((c) => (
              <CategoriaRow key={c.nome} item={c} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
