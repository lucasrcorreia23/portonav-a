"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEstadoDemo, useRepositorio } from "@/lib/data/context";
import { TAXONOMIA_STATUS_CHAMADO } from "@/components/status/statusTaxonomy";
import type { ChamadoManutencao, Equipamento, StatusChamado } from "@/lib/types";

const PROXIMO_STATUS: Partial<Record<StatusChamado, StatusChamado>> = {
  aberto: "em_atendimento",
};

export function ChamadoCard({ chamado, equipamento }: { chamado: ChamadoManutencao; equipamento: Equipamento | undefined }) {
  const repo = useRepositorio();
  const demo = useEstadoDemo();
  const proximo = PROXIMO_STATUS[chamado.status];
  // Date.now() só no inicializador preguiçoso do useState — nunca direto no corpo do componente.
  // Somado ao deslocamento do controle "avançar o tempo" para reagir de imediato a esse controle.
  const [agoraRealMs] = useState(() => Date.now());
  const agoraSimuladoMs = agoraRealMs + demo.deslocamentoTempoMs;
  const horasAberto = Math.round((agoraSimuladoMs - new Date(chamado.abertoEm).getTime()) / 3_600_000);

  return (
    <div className="flex flex-col gap-2 rounded-card border border-border bg-white p-3">
      <Link href={`/manutencao/chamados/${chamado.id}`} className="hover:text-brand-600">
        <p className="font-medium text-foreground">{equipamento?.tag ?? "—"}</p>
        <p className="text-xs text-foreground-subtle">
          {chamado.prioridade === "alta" ? "Prioridade alta" : chamado.prioridade === "media" ? "Prioridade média" : "Prioridade baixa"}
        </p>
      </Link>
      <p className="text-xs text-foreground-subtle">aberto há {horasAberto < 24 ? `${horasAberto}h` : `${Math.round(horasAberto / 24)}d`}</p>
      {proximo && (
        <button
          type="button"
          onClick={() => repo.manutencao.moverChamado(chamado.id, proximo)}
          className="mt-1 inline-flex items-center justify-center gap-1 rounded-control bg-surface-2 px-2 py-1.5 text-xs font-medium text-foreground-muted hover:bg-surface-3"
        >
          Mover para {TAXONOMIA_STATUS_CHAMADO[proximo].label} <ArrowRight size={12} aria-hidden />
        </button>
      )}
      {chamado.status === "em_atendimento" && (
        <Link
          href={`/manutencao/chamados/${chamado.id}`}
          className="mt-1 inline-flex items-center justify-center gap-1 rounded-control bg-surface-2 px-2 py-1.5 text-xs font-medium text-foreground-muted hover:bg-surface-3"
        >
          Registrar reparo <ArrowRight size={12} aria-hidden />
        </Link>
      )}
    </div>
  );
}
