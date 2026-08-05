import { ChamadoCard } from "@/components/chamados/ChamadoCard";
import { TAXONOMIA_STATUS_CHAMADO } from "@/components/status/statusTaxonomy";
import type { ChamadoManutencao, Equipamento, StatusChamado } from "@/lib/types";

const COLUNAS: StatusChamado[] = ["aberto", "em_atendimento", "aguardando_liberacao", "concluido"];

export function ChamadoBoard({ chamados, equipamentos }: { chamados: ChamadoManutencao[]; equipamentos: Equipamento[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {COLUNAS.map((status) => {
        const doColuna = chamados.filter((c) => c.status === status).sort((a, b) => a.abertoEm.localeCompare(b.abertoEm));
        return (
          <div key={status} className="flex flex-col gap-3 rounded-card bg-surface-2 p-3">
            <h2 className="flex items-center justify-between text-sm font-medium text-foreground-muted">
              {TAXONOMIA_STATUS_CHAMADO[status].label}
              <span className="rounded-pill bg-surface px-2 py-0.5 text-xs text-foreground-subtle">{doColuna.length}</span>
            </h2>
            <div className="flex flex-col gap-2">
              {doColuna.length === 0 ? (
                <p className="text-xs text-foreground-subtle">Nenhum chamado.</p>
              ) : (
                doColuna.map((chamado) => (
                  <ChamadoCard
                    key={chamado.id}
                    chamado={chamado}
                    equipamento={equipamentos.find((e) => e.id === chamado.equipamentoId)}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
