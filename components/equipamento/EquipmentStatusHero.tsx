import type { ReactNode } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TAXONOMIA_STATUS_EQUIPAMENTO } from "@/components/status/statusTaxonomy";
import type { Equipamento } from "@/lib/types";

const ROTULO_TIPO: Record<Equipamento["tipo"], string> = {
  empilhadeira: "Empilhadeira",
  reach_stacker: "Reach stacker",
  transpaleteira: "Transpaleteira",
};

export function EquipmentStatusHero({ equipamento, acoes }: { equipamento: Equipamento; acoes?: ReactNode }) {
  return (
    <div className="rounded-card-hero border border-neutral-100 bg-white p-6 shadow-elevated">
      <p className="text-sm text-neutral-500">{ROTULO_TIPO[equipamento.tipo]}</p>
      <h1 className="mb-3 text-display-md text-neutral-900">{equipamento.tag}</h1>
      <p className="mb-4 text-sm text-neutral-600">{equipamento.localizacaoAtual}</p>
      <StatusBadge entrada={TAXONOMIA_STATUS_EQUIPAMENTO[equipamento.status]} tamanho="lg" comDescricao />
      {acoes && <div className="mt-5 flex flex-col gap-2">{acoes}</div>}
    </div>
  );
}
