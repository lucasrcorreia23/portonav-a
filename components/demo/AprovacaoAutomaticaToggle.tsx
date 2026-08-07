"use client";

import { alternarAprovacaoAutomatica, useEstadoDemo } from "@/lib/data/context";

/**
 * Liga/desliga a aprovação automática da solicitação do operador. Ligada (padrão), a demo
 * corre o caminho feliz inteiro num perfil só; desligada, a solicitação volta a nascer
 * pendente e a aprovação acontece em /supervisor/tarefas.
 */
export function AprovacaoAutomaticaToggle() {
  const demo = useEstadoDemo();

  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-sm font-medium text-foreground">Aprovação automática</span>
      <button
        type="button"
        role="switch"
        aria-checked={demo.aprovacaoAutomatica}
        onClick={() => alternarAprovacaoAutomatica()}
        className={`relative h-6 w-11 shrink-0 rounded-pill transition-colors ${
          demo.aprovacaoAutomatica ? "bg-status-disponivel" : "bg-neutral-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface transition-transform ${
            demo.aprovacaoAutomatica ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}
