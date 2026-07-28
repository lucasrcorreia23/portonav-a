import { StatusBadge } from "@/components/ui/StatusBadge";
import { TAXONOMIA_STATUS_EQUIPAMENTO } from "@/components/status/statusTaxonomy";
import type { Equipamento } from "@/lib/types";

const ROTULO_TIPO: Record<Equipamento["tipo"], string> = {
  empilhadeira: "Empilhadeira",
  reach_stacker: "Reach stacker",
  transpaleteira: "Transpaleteira",
};

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
            className="flex w-full items-center justify-between gap-3 rounded-card border border-neutral-100 bg-white p-4 text-left shadow-card hover:bg-neutral-50"
          >
            <div>
              <p className="font-medium text-neutral-900">{eq.tag}</p>
              <p className="text-sm text-neutral-600">
                {ROTULO_TIPO[eq.tipo]} · {eq.localizacaoAtual}
              </p>
            </div>
            <StatusBadge entrada={TAXONOMIA_STATUS_EQUIPAMENTO[eq.status]} tamanho="sm" />
          </button>
        </li>
      ))}
    </ul>
  );
}
