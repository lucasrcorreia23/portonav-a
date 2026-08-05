import type { Id, ISODateString } from "./common";

export type TipoEventoHistorico =
  | "equipamento_cadastrado"
  | "checklist_preenchido"
  | "equipamento_liberado_uso"
  | "equipamento_bloqueado"
  | "apontamento_criado"
  | "chamado_aberto"
  | "chamado_status_alterado"
  | "chamado_concluido_liberacao"
  | "chamado_analise_admin_registrada"
  | "sessao_operacao_encerrada"
  | "sincronizacao_offline"
  | "tarefa_criada"
  | "tarefa_aprovada"
  | "tarefa_rejeitada"
  | "tarefa_concluida"
  | "tarefa_reagendada";

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
    tarefaId?: Id;
  };
  resumo: string;
  detalhe?: Record<string, unknown>;
}
