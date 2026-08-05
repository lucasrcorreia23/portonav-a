import type { Id, ISODateString } from "./common";
import type { FotoEvidencia, ModoTratamentoItem } from "./checklist";

export type StatusApontamento = "aberto" | "em_atendimento" | "resolvido";

export type CriticidadeApontamento = "critica" | "nao_critica";

export interface Apontamento {
  id: Id;
  equipamentoId: Id;
  origem: { checklistPreenchidoId: Id; itemId: Id; itemTitulo: string };
  modoTratamento: ModoTratamentoItem;
  criticidade: CriticidadeApontamento;
  descricao: string;
  /** Copiado de RespostaItemChecklist.descricaoGeradaPorIA no momento da criação. */
  descricaoOrigemIA?: boolean;
  fotoEvidencia?: FotoEvidencia;
  status: StatusApontamento;
  chamadoId: Id | null;
  criadoEm: ISODateString;
  criadoPorOperadorId: Id;
  resolvidoEm?: ISODateString;
}
