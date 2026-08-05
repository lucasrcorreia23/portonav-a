import { History } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { FalhaRecorrente } from "@/lib/data/falhas-recorrentes";

/** Indicador de falha recorrente na ficha do equipamento — item A3 "histórico e indicadores de falha recorrente". */
export function RecurringFailureNotice({ falhasRecorrentes }: { falhasRecorrentes?: FalhaRecorrente[] }) {
  if (!falhasRecorrentes || falhasRecorrentes.length === 0) return null;

  return (
    <Card densidade="densa" className="border-status-apontamento/30 bg-status-apontamento-surface">
      <h2 className="mb-2 inline-flex items-center gap-1.5 font-medium text-status-apontamento">
        <History size={16} aria-hidden /> Falha recorrente
      </h2>
      <ul className="flex flex-col gap-1 text-sm text-foreground">
        {falhasRecorrentes.map((f) => (
          <li key={f.itemId}>
            {f.itemTitulo} — reprovado {f.ocorrencias}x (última em {new Date(f.ultimaOcorrenciaEm).toLocaleDateString("pt-BR")})
          </li>
        ))}
      </ul>
    </Card>
  );
}
