"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { resetarDemo } from "@/lib/data/context";

/** Botão com confirmação em duas etapas — evita reset acidental durante a demonstração. */
export function ResetButton() {
  const [confirmando, setConfirmando] = useState(false);

  if (confirmando) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-foreground-muted">Tem certeza?</span>
        <button
          type="button"
          onClick={() => {
            resetarDemo();
            setConfirmando(false);
          }}
          className="rounded-control bg-status-avariado px-2.5 py-1.5 text-sm font-medium text-white"
        >
          Sim, resetar
        </button>
        <button
          type="button"
          onClick={() => setConfirmando(false)}
          className="rounded-control px-2.5 py-1.5 text-sm text-foreground-muted hover:bg-surface-2"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirmando(true)}
      className="inline-flex items-center gap-1.5 rounded-control px-2.5 py-1.5 text-sm font-medium text-foreground-muted hover:bg-surface-2"
    >
      <RotateCcw size={14} aria-hidden />
      Resetar dados
    </button>
  );
}
