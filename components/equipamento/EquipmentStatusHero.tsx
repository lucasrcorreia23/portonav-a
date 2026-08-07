import type { ReactNode } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TAXONOMIA_STATUS_EQUIPAMENTO } from "@/components/status/statusTaxonomy";
import { ROTULO_TIPO_EQUIPAMENTO } from "@/components/equipamento/rotulos";
import type { Equipamento } from "@/lib/types";

export function EquipmentStatusHero({ equipamento, acoes }: { equipamento: Equipamento; acoes?: ReactNode }) {
  return (
    <div className="rounded-card-hero border border-border bg-surface p-6">
      <p className="text-sm text-foreground-subtle">{ROTULO_TIPO_EQUIPAMENTO[equipamento.tipo]}</p>
      <h1 className="mb-3 text-display-md text-foreground">{equipamento.tag}</h1>
      <p className="mb-4 text-sm text-foreground-muted">{equipamento.localizacaoAtual}</p>
      <StatusBadge entrada={TAXONOMIA_STATUS_EQUIPAMENTO[equipamento.status]} tamanho="lg" comDescricao />
      {acoes && <div className="mt-5 flex flex-col gap-2">{acoes}</div>}
    </div>
  );
}
