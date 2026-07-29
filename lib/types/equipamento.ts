import type { Id, ISODateString, Perfil } from "./common";

export type TipoEquipamento = "empilhadeira" | "reach_stacker" | "transpaleteira";

/** Classificação operacional do equipamento — distinta de `tipo` (classe física da máquina). */
export type TipoOperacao = "carga_geral" | "conteineres" | "graneis" | "armazem";

export type StatusOperacionalEquipamento =
  | "disponivel"
  | "em_uso"
  | "com_apontamento"
  | "bloqueado"
  | "em_manutencao";

export interface BloqueioAtivo {
  motivo: string;
  origemItemChecklistId?: Id;
  bloqueadoPor: { perfil: Perfil | "sistema"; nome: string };
  bloqueadoEm: ISODateString;
  apontamentoId: Id;
}

export interface PrevisaoManutencao {
  descricao: string;
  previsaoConclusaoEm: ISODateString;
}

export interface Equipamento {
  id: Id;
  tag: string;
  tipo: TipoEquipamento;
  tipoOperacao: TipoOperacao;
  modelo: string;
  localizacaoAtual: string;
  status: StatusOperacionalEquipamento;
  bloqueio: BloqueioAtivo | null;
  chamadoAtivoId: Id | null;
  modeloChecklistIdPadrao: Id;
  previsaoManutencao?: PrevisaoManutencao;
  criadoEm: ISODateString;
}
