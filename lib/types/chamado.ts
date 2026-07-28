import type { Id, ISODateString, Perfil } from "./common";

export type StatusChamado =
  | "aberto"
  | "em_atendimento"
  | "aguardando_liberacao"
  | "concluido";

export type PrioridadeChamado = "alta" | "media" | "baixa";

export interface RegistroReparo {
  descricao: string;
  pecasTrocadas: string[];
  registradoPor: { perfil: Perfil; nome: string };
  registradoEm: ISODateString;
}

export interface LiberacaoEquipamento {
  liberadoPor: { perfil: Perfil; nome: string };
  liberadoEm: ISODateString;
  observacao?: string;
}

export interface EventoStatusChamado {
  status: StatusChamado;
  em: ISODateString;
  porId?: Id;
}

export interface ChamadoManutencao {
  id: Id;
  equipamentoId: Id;
  apontamentoIds: Id[];
  origemAutomatica: boolean;
  status: StatusChamado;
  prioridade: PrioridadeChamado;
  abertoEm: ISODateString;
  atribuidoA?: { perfil: Perfil; nome: string };
  registroReparo?: RegistroReparo;
  liberacao?: LiberacaoEquipamento;
  historicoStatus: EventoStatusChamado[];
}
