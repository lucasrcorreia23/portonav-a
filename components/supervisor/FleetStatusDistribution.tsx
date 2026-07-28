import { TAXONOMIA_STATUS_EQUIPAMENTO } from "@/components/status/statusTaxonomy";
import type { Equipamento, StatusOperacionalEquipamento } from "@/lib/types";

const ORDEM: StatusOperacionalEquipamento[] = ["disponivel", "em_uso", "com_apontamento", "bloqueado", "em_manutencao"];

const COR_BARRA: Record<StatusOperacionalEquipamento, string> = {
  disponivel: "bg-status-disponivel",
  em_uso: "bg-status-em-uso",
  com_apontamento: "bg-status-apontamento",
  bloqueado: "bg-status-avariado",
  em_manutencao: "bg-status-manutencao",
};

export function FleetStatusDistribution({ equipamentos }: { equipamentos: Equipamento[] }) {
  const total = equipamentos.length || 1;
  const contagens = ORDEM.map((status) => ({
    status,
    quantidade: equipamentos.filter((e) => e.status === status).length,
  }));

  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-pill">
        {contagens.map(({ status, quantidade }) =>
          quantidade > 0 ? (
            <div
              key={status}
              className={`${COR_BARRA[status]} h-full`}
              style={{ width: `${(quantidade / total) * 100}%` }}
              title={`${TAXONOMIA_STATUS_EQUIPAMENTO[status].label}: ${quantidade}`}
            />
          ) : null,
        )}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {contagens.map(({ status, quantidade }) => {
          const Icone = TAXONOMIA_STATUS_EQUIPAMENTO[status].icone;
          return (
            <li key={status} className="inline-flex items-center gap-1.5 text-sm text-neutral-700">
              <Icone size={14} className={COR_BARRA[status].replace("bg-", "text-")} aria-hidden />
              {TAXONOMIA_STATUS_EQUIPAMENTO[status].label} <span className="font-medium">{quantidade}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
