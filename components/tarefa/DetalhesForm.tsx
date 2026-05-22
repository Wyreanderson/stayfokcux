"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Pause, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import {
  atualizarTarefa,
  concluirTarefa,
  excluirTarefa,
  pausarOuRetomar,
} from "@/lib/tarefas/mutations";
import { GRUPOS, GRUPO_META, PRIORIDADE_LABEL } from "@/lib/tarefas/grupos";
import type { Categoria, Tarefa } from "@/lib/supabase/types";

const PRIORIDADES = ["critica", "alta", "media", "baixa"] as const;

export function DetalhesForm({
  tarefa,
  categorias,
}: {
  tarefa: Tarefa;
  categorias: Categoria[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  const prazoLocal = tarefa.prazo
    ? new Date(tarefa.prazo).toISOString().slice(0, 16)
    : "";

  const emPausa = tarefa.status === "em_pausa";

  return (
    <form action={atualizarTarefa} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={tarefa.id} />

      <div className="rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] p-3">
        <p className="text-xs text-[var(--color-fg-dim)] uppercase">
          Por que a IA classificou assim
        </p>
        <p className="text-sm mt-1">{tarefa.motivacao || "—"}</p>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-[var(--color-fg-dim)]">Resumo</span>
        <Input
          name="descricao_resumida"
          defaultValue={tarefa.descricao_resumida ?? ""}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-[var(--color-fg-dim)]">
          Descrição completa
        </span>
        <Textarea
          name="descricao"
          defaultValue={tarefa.descricao}
          required
          minLength={2}
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-[var(--color-fg-dim)]">Categoria</span>
          <Select name="categoria_id" defaultValue={tarefa.categoria_id ?? ""}>
            <option value="">—</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </Select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-[var(--color-fg-dim)]">Prioridade</span>
          <Select name="prioridade" defaultValue={tarefa.prioridade}>
            {PRIORIDADES.map((p) => (
              <option key={p} value={p}>
                {PRIORIDADE_LABEL[p]}
              </option>
            ))}
          </Select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-[var(--color-fg-dim)]">Prazo</span>
          <Input
            type="datetime-local"
            name="prazo"
            defaultValue={prazoLocal}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-[var(--color-fg-dim)]">Status</span>
          <Select name="status" defaultValue={tarefa.status}>
            {GRUPOS.map((g) => (
              <option key={g} value={g}>
                {GRUPO_META[g].titulo}
              </option>
            ))}
            <option value="concluida">CONCLUÍDA</option>
          </Select>
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="interruptivel"
          defaultChecked={tarefa.interruptivel}
          className="h-4 w-4"
        />
        Pode ser interrompida
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-[var(--color-fg-dim)]">Notas</span>
        <Textarea name="notas" defaultValue={tarefa.notas ?? ""} />
      </label>

      {tarefa.recorrencia > 1 && (
        <p className="text-xs text-[var(--color-mint)] bg-[var(--color-bg-elev)] rounded-lg px-3 py-2">
          Essa tarefa já foi solicitada {tarefa.recorrencia} vezes.
        </p>
      )}

      <div className="flex flex-col gap-2 pt-2">
        <Button type="submit" disabled={isPending} size="lg">
          <Check size={18} /> Salvar
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              startTransition(async () => {
                await concluirTarefa(tarefa.id);
                router.push("/");
              })
            }
          >
            <Check size={18} /> Concluir
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              startTransition(async () => {
                await pausarOuRetomar(tarefa.id, !emPausa);
                router.refresh();
              })
            }
          >
            {emPausa ? <Play size={18} /> : <Pause size={18} />}
            {emPausa ? "Retomar" : "Pausar"}
          </Button>
        </div>
        {confirmandoExclusao ? (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="danger"
              className="flex-1"
              onClick={() => startTransition(() => excluirTarefa(tarefa.id))}
            >
              Confirmar exclusão
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmandoExclusao(false)}
            >
              Cancelar
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setConfirmandoExclusao(true)}
            className="text-red-400"
          >
            <Trash2 size={18} /> Excluir
          </Button>
        )}
      </div>
    </form>
  );
}
