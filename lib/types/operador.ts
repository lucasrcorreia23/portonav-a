import type { Id, ISODateString, Turno } from "./common";
import type { TipoEquipamento } from "./equipamento";

export interface Habilitacao {
  tipoEquipamento: TipoEquipamento;
  numeroCertificado: string;
  validoAte?: ISODateString;
}

export interface Operador {
  id: Id;
  matricula: string;
  nome: string;
  turnoPadrao: Turno;
  habilitacoes: Habilitacao[];
  scoreConfiabilidade: number;
  ativo: boolean;
  admissaoEm: ISODateString;
  /** Retrato do operador. Ausente → o Avatar cai nas iniciais. */
  fotoUrl?: string;
}

export interface SincronizacaoPortal {
  ultimaSincronizacaoEm: ISODateString | null;
  status: "nunca_sincronizado" | "sincronizado" | "sincronizando" | "falha";
  ultimoResumo?: string;
}
