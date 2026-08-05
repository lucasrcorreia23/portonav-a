"use client";

import { CloudOff, Wifi } from "lucide-react";
import { useEstadoAplicacao } from "@/lib/data/context";

/** Indicador persistente de conexão — vive no layout raiz, nunca dentro de uma rota específica. */
export function OfflineIndicator() {
  const estado = useEstadoAplicacao();
  const pendentes = estado.filaSincronizacao.filter((item) => item.status === "pendente").length;

  if (!estado.demo.offline) {
    return (
      <div className="flex items-center gap-1.5 px-4 py-1 text-xs text-foreground-subtle">
        <Wifi size={13} aria-hidden />
        <span>Conectado</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-status-apontamento-surface px-4 py-2 text-sm font-medium text-status-apontamento"
    >
      <span className="inline-flex items-center gap-1.5">
        <CloudOff size={16} aria-hidden />
        Modo offline — dados salvos localmente
      </span>
      {pendentes > 0 && (
        <span className="inline-flex items-center rounded-pill bg-surface/70 px-2.5 py-0.5 text-xs font-semibold">
          {pendentes} pendente{pendentes > 1 ? "s" : ""} de sincronização
        </span>
      )}
    </div>
  );
}
