import type { Id, ISODateString } from "./common";
import type { StatusChecklistPreenchido } from "./checklist";

export type StatusSessaoOperacao = "em_andamento" | "encerrada";

export interface SessaoOperacao {
  id: Id;
  equipamentoId: Id;
  operadorId: Id;
  checklistPreenchidoId: Id;
  resultadoChecklist: StatusChecklistPreenchido;
  iniciadoEm: ISODateString;
  encerradoEm?: ISODateString;
  status: StatusSessaoOperacao;
}
