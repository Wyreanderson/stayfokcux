"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopiarLink({ path }: { path: string }) {
  const [copiado, setCopiado] = useState(false);

  function copiar() {
    const url =
      typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
    navigator.clipboard?.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copiar}
      className="flex items-center gap-2 rounded-lg bg-[var(--color-bg-elev)] border border-[var(--color-border)] px-3 py-2 text-xs text-left hover:bg-[var(--color-bg)]"
    >
      <span className="font-mono truncate flex-1">{path}</span>
      {copiado ? (
        <Check size={14} className="text-[var(--color-primary)] shrink-0" />
      ) : (
        <Copy size={14} className="text-[var(--color-fg-dim)] shrink-0" />
      )}
    </button>
  );
}
