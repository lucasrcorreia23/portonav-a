import Link from "next/link";
import { EquipmentStatusHero } from "@/components/equipamento/EquipmentStatusHero";
import { EquipmentHistoryTimeline } from "@/components/equipamento/EquipmentHistoryTimeline";
import { Card } from "@/components/ui/Card";
import type { ChamadoManutencao, Equipamento, HistoricoEvento } from "@/lib/types";

export function FichaGestao({
  equipamento,
  historico,
  chamadoAtivo,
}: {
  equipamento: Equipamento;
  historico: HistoricoEvento[];
  chamadoAtivo: ChamadoManutencao | undefined;
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-8">
      <EquipmentStatusHero
        equipamento={equipamento}
        acoes={
          chamadoAtivo ? (
            <Link
              href={`/manutencao/chamados/${chamadoAtivo.id}`}
              className="inline-flex h-11 items-center justify-center rounded-control border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
            >
              Ver chamado de manutenção
            </Link>
          ) : undefined
        }
      />

      <Card densidade="densa">
        <h2 className="mb-3 font-medium text-neutral-900">Histórico</h2>
        <EquipmentHistoryTimeline eventos={historico} />
      </Card>
    </div>
  );
}
