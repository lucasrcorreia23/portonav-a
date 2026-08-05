import type { EstadoAplicacao } from "../store";
import { mulberry32 } from "./rng";
import { gerarModelosChecklist } from "./seed-checklists";
import { gerarEquipamentos } from "./seed-equipamentos";
import { gerarOperadores } from "./seed-operadores";
import { gerarHistorico } from "./seed-historico";
import { gerarTarefas } from "./seed-tarefas";

export const SEED_VERSION = 4;

/** Seed mestre fixa — a mesma sequência de "aleatoriedade" sempre, nunca Math.random(). */
const SEED_MESTRE = 20260101;

/**
 * Gera o estado inicial completo da aplicação de forma determinística.
 * `agoraBaseMs` é a única entrada de "tempo real": ancora a janela de 45 dias de
 * histórico sintético para que sempre pareça recente, sem que a própria geração
 * dependa de Date.now() internamente (todas as datas derivam deste parâmetro).
 */
export function gerarSeed(agoraBaseMs: number): EstadoAplicacao {
  const rng = mulberry32(SEED_MESTRE);

  const modelosChecklist = gerarModelosChecklist(agoraBaseMs, rng);
  const equipamentos = gerarEquipamentos(agoraBaseMs, modelosChecklist, rng);
  const operadores = gerarOperadores(agoraBaseMs, rng);

  const { checklistsPreenchidos, apontamentos, chamados, historico } = gerarHistorico(
    agoraBaseMs,
    rng,
    equipamentos,
    operadores,
    modelosChecklist,
  );
  const tarefas = gerarTarefas(agoraBaseMs, rng, equipamentos, operadores);

  return {
    versaoSeed: SEED_VERSION,
    equipamentos,
    modelosChecklist,
    operadores,
    checklistsPreenchidos,
    apontamentos,
    chamados,
    tarefas,
    sessoes: [],
    historico,
    filaSincronizacao: [],
    sincronizacaoPortal: {
      ultimaSincronizacaoEm: new Date(agoraBaseMs - 2 * 60 * 60 * 1000).toISOString(),
      status: "sincronizado",
      ultimoResumo: `${operadores.length} operadores sincronizados do portal corporativo.`,
    },
    demo: {
      perfilAtivo: "operador",
      operadorAtivoId: operadores[0]?.id ?? null,
      offline: false,
      deslocamentoTempoMs: 0,
    },
  };
}
