import type { ReactNode } from "react";

interface KpiCardProps {
  rotulo: string;
  valor: number | string;
  icone?: ReactNode;
  /** Valor do período atual, para cálculo do delta. */
  atual?: number;
  /** Valor do período anterior, para cálculo do delta. */
  anterior?: number;
}

function BadgeDelta({ atual, anterior }: { atual: number; anterior: number }) {
  if (anterior === 0 && atual === 0) return null;

  const percentual = anterior === 0 ? (atual > 0 ? 100 : 0) : ((atual - anterior) / anterior) * 100;
  const arredondado = Math.abs(Math.round(percentual));
  const subiu = percentual > 0;
  const desceu = percentual < 0;

  const cor = subiu ? "text-success" : desceu ? "text-error" : "text-foreground-subtle";
  const seta = subiu ? "▲" : desceu ? "▼" : "";

  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${cor}`}>
      {seta} {arredondado}%
    </span>
  );
}

/** Ícone no topo, rótulo abaixo do número, compacto (ver docs/design-system). */
export function KpiCard({ rotulo, valor, icone, atual, anterior }: KpiCardProps) {
  const mostrarDelta = atual !== undefined && anterior !== undefined;

  return (
    <div className="flex min-h-[120px] flex-col justify-between gap-5 rounded-card border border-border bg-surface p-4">
      {icone && <span className="text-foreground-muted">{icone}</span>}
      <div>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl leading-none font-bold text-foreground">{valor}</p>
          {mostrarDelta && <BadgeDelta atual={atual} anterior={anterior} />}
        </div>
        <p className="mt-1.5 text-xs font-medium text-foreground-subtle">{rotulo}</p>
      </div>
    </div>
  );
}
