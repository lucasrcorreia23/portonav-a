import { EquipmentStatusHero } from "@/components/equipamento/EquipmentStatusHero";
import { EquipmentHistoryTimeline } from "@/components/equipamento/EquipmentHistoryTimeline";
import { QRDisplay } from "@/components/equipamento/QRDisplay";
import { RecurringFailureNotice } from "@/components/equipamento/RecurringFailureNotice";
import { ROTULO_TIPO_EQUIPAMENTO, ROTULO_TIPO_OPERACAO } from "@/components/equipamento/rotulos";
import { AnaliseAdminCard } from "@/components/chamados/AnaliseAdminCard";
import { Card } from "@/components/ui/Card";
import type { FalhaRecorrente } from "@/lib/data/falhas-recorrentes";
import type { Apontamento, ChamadoManutencao, Equipamento, HistoricoEvento, ModeloChecklist } from "@/lib/types";

export function FichaAdmin({
  equipamento,
  historico,
  modeloChecklist,
  previsaoAtrasada = false,
  falhasRecorrentes,
  chamadoAtivo,
  apontamentosDoChamado,
}: {
  equipamento: Equipamento;
  historico: HistoricoEvento[];
  modeloChecklist: ModeloChecklist | undefined;
  previsaoAtrasada?: boolean;
  falhasRecorrentes?: FalhaRecorrente[];
  chamadoAtivo?: ChamadoManutencao;
  apontamentosDoChamado?: Apontamento[];
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-8">
      <EquipmentStatusHero equipamento={equipamento} />

      <Card densidade="densa">
        <h2 className="mb-3 font-medium text-foreground">Dados cadastrais</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-foreground-subtle">Tipo</dt>
            <dd className="font-medium text-foreground">{ROTULO_TIPO_EQUIPAMENTO[equipamento.tipo]}</dd>
          </div>
          <div>
            <dt className="text-foreground-subtle">Tipo de operação</dt>
            <dd className="font-medium text-foreground">{ROTULO_TIPO_OPERACAO[equipamento.tipoOperacao]}</dd>
          </div>
          <div>
            <dt className="text-foreground-subtle">Modelo</dt>
            <dd className="font-medium text-foreground">{equipamento.modelo}</dd>
          </div>
          <div>
            <dt className="text-foreground-subtle">Localização</dt>
            <dd className="font-medium text-foreground">{equipamento.localizacaoAtual}</dd>
          </div>
          <div>
            <dt className="text-foreground-subtle">Checklist padrão</dt>
            <dd className="font-medium text-foreground">{modeloChecklist?.nome ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-foreground-subtle">Cadastrado em</dt>
            <dd className="font-medium text-foreground">
              {new Date(equipamento.criadoEm).toLocaleDateString("pt-BR")}
            </dd>
          </div>
        </dl>
      </Card>

      {equipamento.bloqueio && (
        <Card densidade="densa" className="border-status-avariado/30 bg-status-avariado-surface">
          <h2 className="mb-2 font-medium text-status-avariado">Bloqueio ativo</h2>
          <p className="text-sm text-foreground">{equipamento.bloqueio.motivo}</p>
          <p className="mt-1 text-xs text-foreground-muted">
            Bloqueado por {equipamento.bloqueio.bloqueadoPor.nome} em{" "}
            {new Date(equipamento.bloqueio.bloqueadoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
          </p>
        </Card>
      )}

      {chamadoAtivo && (
        <AnaliseAdminCard chamado={chamadoAtivo} apontamentos={apontamentosDoChamado ?? []} perfilAtivo="admin" />
      )}

      <RecurringFailureNotice falhasRecorrentes={falhasRecorrentes} />

      {equipamento.previsaoManutencao && (
        <Card densidade="densa" className="border-status-manutencao/30 bg-status-manutencao-surface">
          <h2 className="mb-2 font-medium text-status-manutencao">Em manutenção</h2>
          <p className="text-sm text-foreground">{equipamento.previsaoManutencao.descricao}</p>
          <p className="mt-1 text-xs text-foreground-muted">
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
        <h2 className="mb-3 font-medium text-foreground">QR da ficha</h2>
        <QRDisplay tag={equipamento.tag} tamanho={180} />
      </Card>

      <Card densidade="densa">
        <h2 className="mb-3 font-medium text-foreground">Histórico completo</h2>
        <EquipmentHistoryTimeline eventos={historico} />
      </Card>
    </div>
  );
}
