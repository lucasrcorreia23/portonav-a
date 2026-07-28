import { EquipmentStatusHero } from "@/components/equipamento/EquipmentStatusHero";
import { EquipmentHistoryTimeline } from "@/components/equipamento/EquipmentHistoryTimeline";
import { QRDisplay } from "@/components/equipamento/QRDisplay";
import { Card } from "@/components/ui/Card";
import type { Equipamento, HistoricoEvento, ModeloChecklist } from "@/lib/types";

const ROTULO_TIPO: Record<string, string> = {
  empilhadeira: "Empilhadeira",
  reach_stacker: "Reach stacker",
  transpaleteira: "Transpaleteira",
};

export function FichaAdmin({
  equipamento,
  historico,
  modeloChecklist,
  previsaoAtrasada = false,
}: {
  equipamento: Equipamento;
  historico: HistoricoEvento[];
  modeloChecklist: ModeloChecklist | undefined;
  previsaoAtrasada?: boolean;
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-8">
      <EquipmentStatusHero equipamento={equipamento} />

      <Card densidade="densa">
        <h2 className="mb-3 font-medium text-neutral-900">Dados cadastrais</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-neutral-500">Tipo</dt>
            <dd className="font-medium text-neutral-800">{ROTULO_TIPO[equipamento.tipo]}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Categoria</dt>
            <dd className="font-medium text-neutral-800">{equipamento.categoria}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Modelo</dt>
            <dd className="font-medium text-neutral-800">{equipamento.modelo}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Localização</dt>
            <dd className="font-medium text-neutral-800">{equipamento.localizacaoAtual}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Checklist padrão</dt>
            <dd className="font-medium text-neutral-800">{modeloChecklist?.nome ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Cadastrado em</dt>
            <dd className="font-medium text-neutral-800">
              {new Date(equipamento.criadoEm).toLocaleDateString("pt-BR")}
            </dd>
          </div>
        </dl>
      </Card>

      {equipamento.bloqueio && (
        <Card densidade="densa" className="border-status-avariado/30 bg-status-avariado-surface">
          <h2 className="mb-2 font-medium text-status-avariado">Bloqueio ativo</h2>
          <p className="text-sm text-neutral-800">{equipamento.bloqueio.motivo}</p>
          <p className="mt-1 text-xs text-neutral-600">
            Bloqueado por {equipamento.bloqueio.bloqueadoPor.nome} em{" "}
            {new Date(equipamento.bloqueio.bloqueadoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
          </p>
        </Card>
      )}

      {equipamento.previsaoManutencao && (
        <Card densidade="densa" className="border-status-manutencao/30 bg-status-manutencao-surface">
          <h2 className="mb-2 font-medium text-status-manutencao">Em manutenção</h2>
          <p className="text-sm text-neutral-800">{equipamento.previsaoManutencao.descricao}</p>
          <p className="mt-1 text-xs text-neutral-600">
            Previsão: {new Date(equipamento.previsaoManutencao.previsaoConclusaoEm).toLocaleDateString("pt-BR")}
          </p>
          {previsaoAtrasada && (
            <p className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-status-avariado">
              Peça atrasada — previsão já vencida
            </p>
          )}
        </Card>
      )}

      <Card densidade="densa">
        <h2 className="mb-3 font-medium text-neutral-900">QR da ficha</h2>
        <QRDisplay tag={equipamento.tag} tamanho={180} />
      </Card>

      <Card densidade="densa">
        <h2 className="mb-3 font-medium text-neutral-900">Histórico completo</h2>
        <EquipmentHistoryTimeline eventos={historico} />
      </Card>
    </div>
  );
}
