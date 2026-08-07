import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

export interface MetricaModulo {
  rotulo: string;
  valor: string | number;
}

interface ModuleStatusCardProps {
  href: string;
  titulo: string;
  icone: LucideIcon;
  /** Uma linha resumindo o estado atual do módulo — lida antes das métricas. */
  destaque: string;
  metricas: MetricaModulo[];
  /** Estado que não é um número (sincronização, alerta de cadastro), abaixo das métricas. */
  nota?: ReactNode;
}

/**
 * Card de entrada de módulo do portal admin. Diferente do StatCard (um número por card),
 * carrega o estado vivo do módulo — o admin lê o que está acontecendo sem entrar em cada seção.
 */
export function ModuleStatusCard({ href, titulo, icone: Icone, destaque, metricas, nota }: ModuleStatusCardProps) {
  return (
    <Link href={href} className="group block h-full">
      <Card densidade="densa" className="flex h-full flex-col gap-3 transition-colors group-hover:bg-surface-2">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-card bg-surface-3 text-foreground-muted">
            <Icone size={20} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground">{titulo}</h3>
            <p className="text-sm text-foreground-muted">{destaque}</p>
          </div>
          <ChevronRight size={16} className="mt-1 shrink-0 text-foreground-subtle" aria-hidden />
        </div>

        <dl className="mt-auto flex flex-col gap-1.5 border-t border-border pt-3">
          {metricas.map((metrica) => (
            <div key={metrica.rotulo} className="flex items-baseline justify-between gap-3 text-sm">
              <dt className="text-foreground-subtle">{metrica.rotulo}</dt>
              <dd className="text-right font-medium text-foreground">{metrica.valor}</dd>
            </div>
          ))}
        </dl>

        {nota && <div className="text-xs text-foreground-subtle">{nota}</div>}
      </Card>
    </Link>
  );
}
