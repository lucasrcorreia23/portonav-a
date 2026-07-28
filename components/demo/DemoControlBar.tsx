"use client";

import { useState } from "react";
import { Settings2, X } from "lucide-react";
import { ProfileSwitcher } from "./ProfileSwitcher";
import { OfflineToggle } from "./OfflineToggle";
import { ResetButton } from "./ResetButton";
import { TimeAdvanceControl } from "./TimeAdvanceControl";

/**
 * Controles de demo — visualmente distintos do produto (borda tracejada, rótulo
 * explícito) para nunca serem confundidos com UI real pelo cliente. Sempre
 * acessíveis: no mínimo uma pílula recolhida no canto, nunca somem de vez.
 */
export function DemoControlBar() {
  const [aberto, setAberto] = useState(false);

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="no-print fixed bottom-4 right-4 z-40 inline-flex items-center gap-1.5 rounded-pill border border-dashed border-neutral-400 bg-white px-3 py-2 text-xs font-medium text-neutral-600 shadow-card hover:bg-neutral-50"
      >
        <Settings2 size={14} aria-hidden />
        Modo demonstração
      </button>
    );
  }

  return (
    <div className="no-print fixed bottom-4 right-4 z-40 w-80 max-w-[calc(100vw-2rem)] rounded-card border border-dashed border-neutral-400 bg-white p-4 shadow-elevated">
      <div className="mb-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          <Settings2 size={14} aria-hidden />
          Modo demonstração
        </span>
        <button
          type="button"
          onClick={() => setAberto(false)}
          aria-label="Recolher controles de demonstração"
          className="rounded-control p-1 text-neutral-500 hover:bg-neutral-100"
        >
          <X size={16} aria-hidden />
        </button>
      </div>
      <div className="flex flex-col gap-4">
        <ProfileSwitcher />
        <hr className="border-neutral-100" />
        <OfflineToggle />
        <hr className="border-neutral-100" />
        <TimeAdvanceControl />
        <hr className="border-neutral-100" />
        <ResetButton />
      </div>
    </div>
  );
}
