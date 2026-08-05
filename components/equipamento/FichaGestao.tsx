import Link from "next/link";
import { EquipmentStatusHero } from "@/components/equipamento/EquipmentStatusHero";
import { EquipmentHistoryTimeline } from "@/components/equipamento/EquipmentHistoryTimeline";
import { RecurringFailureNotice } from "@/components/equipamento/RecurringFailureNotice";
import { Card } from "@/components/ui/Card";
import type { FalhaRecorrente } from "@/lib/data/falhas-recorrentes";
import type { ChamadoManutencao, Equipamento, HistoricoEvento } from "@/lib/types";

export function FichaGestao({
  equipamento,
  historico,
  chamadoAtivo,
  falhasRecorrentes,
}: {
  equipamento: Equipamento;
  historico: HistoricoEvento[];
  chamadoAtivo: ChamadoManutencao | undefined;
  falhasRecorrentes?: FalhaRecorrente[];
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-8">
      <EquipmentStatusHero
        equipamento={equipamento}
        acoes={
          chamadoAtivo ? (
            <Link
              href={`/manutencao/chamados/${chamadoAtivo.id}`}
              className="inline-flex h-11 items-center justify-center rounded-control border border-border-strong bg-surface px-4 text-sm font-medium text-foreground hover:bg-surface-2"
            >
              Ver chamado de manutenção
            </Link>
          ) : undefined
        }
      />

      <RecurringFailureNotice falhasRecorrentes={falhasRecorrentes} />

      <Card densidade="densa">
        <h2 className="mb-3 font-medium text-foreground">Histórico</h2>
        <EquipmentHistoryTimeline eventos={historico} />
      </Card>
    </div>
  );
}
