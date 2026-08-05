"use client";

import { useEffect, useState } from "react";
import { avancarTempo, useEstadoDemo } from "@/lib/data/context";
import { DIA_MS, HORA_MS } from "@/lib/data/regras";

const OPCOES = [
  { label: "+1 turno", incrementoMs: 8 * HORA_MS },
  { label: "+1 dia", incrementoMs: DIA_MS },
  { label: "+7 dias", incrementoMs: 7 * DIA_MS },
];

export function TimeAdvanceControl() {
  const demo = useEstadoDemo();
  // Date.now() é impuro — só entra via inicializador preguiçoso do useState (roda uma vez, no
  // mount) ou no callback assíncrono do setInterval, nunca direto no corpo do componente.
  const [agoraRealMs, setAgoraRealMs] = useState<number>(() => Date.now());

  useEffect(() => {
    const intervalo = setInterval(() => setAgoraRealMs(Date.now()), 60_000);
    return () => clearInterval(intervalo);
  }, []);

  const agoraSimulado = new Date(agoraRealMs + demo.deslocamentoTempoMs);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-foreground-subtle">Avançar o tempo</span>
      <p className="text-sm text-foreground-muted">
        Data simulada:{" "}
        <span className="font-medium">
          {agoraSimulado.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
        </span>
      </p>
      <div className="flex flex-wrap gap-1.5">
        {OPCOES.map((opcao) => (
          <button
            key={opcao.label}
            type="button"
            onClick={() => avancarTempo(opcao.incrementoMs)}
            className="rounded-control bg-surface-3 px-2.5 py-1.5 text-sm font-medium text-foreground-muted hover:bg-surface-3"
          >
            {opcao.label}
          </button>
        ))}
      </div>
    </div>
  );
}
