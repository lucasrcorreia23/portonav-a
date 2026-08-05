import type { Id, ISODateString, Perfil } from "./common";

export type StatusTarefa = "pendente" | "aprovada" | "rejeitada" | "concluida";

export interface DecisaoTarefa {
  decididoPor: { perfil: Perfil; nome: string };
  decisao: "aprovada" | "rejeitada";
  decididoEm: ISODateString;
  observacao?: string;
}

/** Solicitação de uso de equipamento — registra a demanda recebida pelo operador
 * antes de escanear/iniciar a verificação de pré-operação. Precisa de aprovação
 * (supervisor/admin) para liberar o gate em FluxoOperador. */
export interface Tarefa {
  id: Id;
  operadorId: Id;
  equipamentoId: Id;
  descricaoDemanda: string;
  status: StatusTarefa;
  criadaEm: ISODateString;
  decisao?: DecisaoTarefa;
  /** Preenchido só pelo fluxo de "agendar novo uso" — não é um novo status, a tarefa
   * segue "aprovada" e o gate não trava esperando esta data. */
  agendamentoPara?: ISODateString;
  concluidaEm?: ISODateString;
}
