import type { Id, ISODateString } from "./common";
import type { ChecklistPreenchido } from "./checklist";
import type { Apontamento } from "./apontamento";

export type OperacaoFila =
  | { tipo: "checklist_preenchido"; payload: ChecklistPreenchido }
  | {
      tipo: "sessao_encerrada";
      payload: { sessaoOperacaoId: Id; encerradoEm: ISODateString };
    }
  | { tipo: "apontamento_criado"; payload: Apontamento };

export interface SyncQueueItem {
  id: Id;
  criadoEm: ISODateString;
  status: "pendente" | "sincronizado";
  sincronizadoEm?: ISODateString;
  operacao: OperacaoFila;
}
