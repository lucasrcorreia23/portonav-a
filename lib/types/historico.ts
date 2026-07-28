import type { Id, ISODateString } from "./common";

export type TipoEventoHistorico =
  | "checklist_preenchido"
  | "equipamento_liberado_uso"
  | "equipamento_bloqueado"
  | "apontamento_criado"
  | "chamado_aberto"
  | "chamado_status_alterado"
  | "chamado_concluido_liberacao"
  | "sessao_operacao_encerrada"
  | "sincronizacao_offline";

export interface HistoricoEvento {
  id: Id;
  tipo: TipoEventoHistorico;
  em: ISODateString;
  equipamentoId?: Id;
  operadorId?: Id;
  refs: {
    checklistPreenchidoId?: Id;
    apontamentoId?: Id;
    chamadoId?: Id;
    sessaoOperacaoId?: Id;
  };
  resumo: string;
  detalhe?: Record<string, unknown>;
}
