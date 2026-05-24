"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { removerPatraoAction } from "@/app/(main)/admin/actions";

export function ConfirmarExcluirPatrao({
  id,
  nome,
}: {
  id: string;
  nome: string;
}) {
  const [confirmando, setConfirmando] = useState(false);

  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="text-xs text-red-400 inline-flex items-center gap-1 self-start mt-1"
      >
        <Trash2 size={12} /> Excluir gestor
      </button>
    );
  }

  return (
    <div className="mt-2 flex flex-col gap-2 rounded-lg bg-red-500/10 border border-red-500/30 p-2">
      <p className="text-xs text-red-300">
        Excluir <strong>{nome}</strong>? Isso apaga as tarefas e colaboradores
        dele. Não dá pra desfazer.
      </p>
      <div className="flex gap-2">
        <form action={removerPatraoAction} className="flex-1">
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            className="w-full text-xs text-white bg-red-500 hover:bg-red-600 rounded-lg py-2"
          >
            Confirmar exclusão
          </button>
        </form>
        <button
          type="button"
          onClick={() => setConfirmando(false)}
          className="text-xs text-[var(--color-fg-dim)] px-3"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
