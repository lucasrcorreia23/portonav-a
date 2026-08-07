import type { Id, Perfil } from "./common";

export interface EstadoDemo {
  perfilAtivo: Perfil;
  operadorAtivoId: Id | null;
  offline: boolean;
  /** Somado a Date.now() em agora() — só avança via o controle "avançar o tempo" */
  deslocamentoTempoMs: number;
  /**
   * A solicitação do operador nasce já aprovada, sem passar pelo supervisor — é o que
   * deixa o caminho feliz correr de ponta a ponta num perfil só. Desligue para demonstrar
   * a fila de aprovação em /supervisor/tarefas.
   */
  aprovacaoAutomatica: boolean;
}

export interface RegraLiberacaoEquipamento {
  perfisPermitidos: Perfil[];
}
