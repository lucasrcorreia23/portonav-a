import type { Perfil, RegraLiberacaoEquipamento } from "@/lib/types";

export const SEGUNDO_MS = 1000;
export const MINUTO_MS = 60 * SEGUNDO_MS;
export const HORA_MS = 60 * MINUTO_MS;
export const DIA_MS = 24 * HORA_MS;

/** Tempo mínimo (por seção) abaixo do qual um preenchimento é marcado como suspeito. */
export const TEMPO_MINIMO_SECAO_SEGUNDOS = 10;

/** Duração total mínima esperada para um checklist inteiro, independente do número de seções. */
export const TEMPO_MINIMO_TOTAL_SEGUNDOS = 25;

/**
 * Quem pode liberar um equipamento a partir de um chamado concluído. Manutenção registra
 * o reparo, mas não libera — a liberação exige aprovação de supervisor (ou admin).
 */
export const REGRA_LIBERACAO_PADRAO: RegraLiberacaoEquipamento = {
  perfisPermitidos: ["supervisor", "admin"],
};

/** Quem pode aprovar/rejeitar uma solicitação de tarefa criada pelo operador. */
export const REGRA_APROVACAO_TAREFA_PADRAO: { perfisPermitidos: Perfil[] } = {
  perfisPermitidos: ["supervisor", "admin"],
};

/** Só admin registra a análise administrativa (com apoio de IA simulada) de um chamado. */
export const REGRA_ANALISE_ADMIN_PADRAO: { perfisPermitidos: Perfil[] } = {
  perfisPermitidos: ["admin"],
};
