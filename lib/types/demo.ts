import type { Id, Perfil } from "./common";

export interface EstadoDemo {
  perfilAtivo: Perfil;
  operadorAtivoId: Id | null;
  offline: boolean;
  /** Somado a Date.now() em agora() — só avança via o controle "avançar o tempo" */
  deslocamentoTempoMs: number;
}

export interface RegraLiberacaoEquipamento {
  perfisPermitidos: Perfil[];
}
