import { StatusBadge } from "@/components/ui/StatusBadge";
import { TAXONOMIA_STATUS_EQUIPAMENTO } from "@/components/status/statusTaxonomy";
import { ROTULO_TIPO_EQUIPAMENTO } from "@/components/equipamento/rotulos";
import type { Equipamento } from "@/lib/types";

export function NearbyEquipmentList({
  equipamentos,
  onEscolher,
}: {
  equipamentos: Equipamento[];
  onEscolher: (equipamento: Equipamento) => void;
}) {
  return (
    <ul className="flex flex-col gap-2">
      {equipamentos.map((eq) => (
        <li key={eq.id}>
          <button
            type="button"
            onClick={() => onEscolher(eq)}
            className="flex w-full items-center justify-between gap-3 rounded-card border border-border bg-surface p-4 text-left hover:bg-surface-2"
          >
            <div>
              <p className="font-medium text-foreground">{eq.tag}</p>
              <p className="text-sm text-foreground-muted">
                {ROTULO_TIPO_EQUIPAMENTO[eq.tipo]} · {eq.localizacaoAtual}
              </p>
            </div>
            <StatusBadge entrada={TAXONOMIA_STATUS_EQUIPAMENTO[eq.status]} tamanho="sm" />
          </button>
        </li>
      ))}
    </ul>
  );
}
