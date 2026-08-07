"use client";

import { useEffect, useState } from "react";
import { Settings2, X } from "lucide-react";
import { ProfileSwitcher } from "./ProfileSwitcher";
import { AprovacaoAutomaticaToggle } from "./AprovacaoAutomaticaToggle";
import { OfflineToggle } from "./OfflineToggle";
import { ResetButton } from "./ResetButton";
import { TimeAdvanceControl } from "./TimeAdvanceControl";

/** Zona sensível no canto inferior direito (px) que revela a pílula no hover. */
const ZONA_LARGURA = 260;
const ZONA_ALTURA = 160;

/**
 * Controles de demo — visualmente distintos do produto (borda tracejada, rótulo
 * explícito) para nunca serem confundidos com UI real pelo cliente. Ficam fora do
 * caminho durante a demonstração: a pílula só aparece quando o mouse chega no canto
 * inferior direito (ou pelo teclado, via foco). Em dispositivo sem mouse, onde não
 * existe hover, ela fica sempre visível — senão não haveria como abrir os controles.
 */
export function DemoControlBar() {
  const [aberto, setAberto] = useState(false);
  const [noCanto, setNoCanto] = useState(false);
  const [semHover, setSemHover] = useState(false);

  useEffect(() => {
    const consulta = window.matchMedia("(hover: none)");
    const aplicar = () => setSemHover(consulta.matches);
    aplicar();
    consulta.addEventListener("change", aplicar);
    return () => consulta.removeEventListener("change", aplicar);
  }, []);

  useEffect(() => {
    if (semHover) return;
    function aoMover(evento: MouseEvent) {
      setNoCanto(
        evento.clientX >= window.innerWidth - ZONA_LARGURA && evento.clientY >= window.innerHeight - ZONA_ALTURA,
      );
    }
    window.addEventListener("mousemove", aoMover);
    return () => window.removeEventListener("mousemove", aoMover);
  }, [semHover]);

  if (!aberto) {
    const visivel = noCanto || semHover;
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        // Teclado não dispara mousemove: o foco também revela a pílula.
        onFocus={() => setNoCanto(true)}
        onBlur={() => setNoCanto(false)}
        className={`no-print fixed bottom-4 right-4 z-40 inline-flex items-center gap-1.5 rounded-pill border border-dashed border-neutral-400 bg-surface px-3 py-2 text-xs font-medium text-foreground-muted transition-opacity duration-200 hover:bg-surface-2 ${
          visivel ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <Settings2 size={14} aria-hidden />
        Modo demonstração
      </button>
    );
  }

  return (
    <div className="no-print fixed bottom-4 right-4 z-40 w-80 max-w-[calc(100vw-2rem)] rounded-card border border-dashed border-neutral-400 bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-foreground-subtle">
          <Settings2 size={14} aria-hidden />
          Modo demonstração
        </span>
        <button
          type="button"
          onClick={() => setAberto(false)}
          aria-label="Recolher controles de demonstração"
          className="rounded-control p-1 text-foreground-subtle hover:bg-surface-2"
        >
          <X size={16} aria-hidden />
        </button>
      </div>
      <div className="flex flex-col gap-4">
        <ProfileSwitcher />
        <hr className="border-border" />
        <AprovacaoAutomaticaToggle />
        <hr className="border-border" />
        <OfflineToggle />
        <hr className="border-border" />
        <TimeAdvanceControl />
        <hr className="border-border" />
        <ResetButton />
      </div>
    </div>
  );
}
