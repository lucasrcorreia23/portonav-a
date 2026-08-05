import type {
  Apontamento,
  ChamadoManutencao,
  ChecklistPreenchido,
  Equipamento,
  EstadoDemo,
  HistoricoEvento,
  ModeloChecklist,
  Operador,
  SessaoOperacao,
  SincronizacaoPortal,
  SyncQueueItem,
  Tarefa,
} from "@/lib/types";
import { gerarSeed, SEED_VERSION } from "./seed/seed";

export interface EstadoAplicacao {
  versaoSeed: number;
  equipamentos: Equipamento[];
  modelosChecklist: ModeloChecklist[];
  operadores: Operador[];
  checklistsPreenchidos: ChecklistPreenchido[];
  apontamentos: Apontamento[];
  chamados: ChamadoManutencao[];
  tarefas: Tarefa[];
  sessoes: SessaoOperacao[];
  historico: HistoricoEvento[];
  filaSincronizacao: SyncQueueItem[];
  sincronizacaoPortal: SincronizacaoPortal;
  demo: EstadoDemo;
}

const STORAGE_KEY = "portonave-demo:v1";

/** Âncora fixa (não usa Date.now()) para SSR/snapshot do servidor — precisa ser pura e estável. */
const EPOCA_SERVIDOR_MS = Date.UTC(2026, 0, 1);

let estado: EstadoAplicacao | null = null;
let snapshotServidor: EstadoAplicacao | null = null;
const listeners = new Set<() => void>();

function carregarOuSemear(): EstadoAplicacao {
  try {
    const bruto = window.localStorage.getItem(STORAGE_KEY);
    if (!bruto) return gerarSeed(Date.now());
    const carregado = JSON.parse(bruto) as EstadoAplicacao;
    if (carregado.versaoSeed !== SEED_VERSION) return gerarSeed(Date.now());
    return carregado;
  } catch {
    return gerarSeed(Date.now());
  }
}

function persistir(proximoEstado: EstadoAplicacao) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(proximoEstado));
  } catch {
    // localStorage indisponível (modo privado, quota excedida) — segue só em memória nesta sessão
  }
}

export function getStore(): EstadoAplicacao {
  if (estado) return estado;
  estado = typeof window === "undefined" ? gerarSeed(EPOCA_SERVIDOR_MS) : carregarOuSemear();
  return estado;
}

/** Usado como getServerSnapshot do useSyncExternalStore — precisa devolver sempre a mesma referência. */
export function getServerSnapshot(): EstadoAplicacao {
  return (snapshotServidor ??= gerarSeed(EPOCA_SERVIDOR_MS));
}

/**
 * Aplica uma mutação clonando o estado atual (nunca mutando a referência em cache) —
 * é o que garante que useSyncExternalStore detecte a mudança via Object.is e re-renderize.
 */
export function mutar(receita: (rascunho: EstadoAplicacao) => void): void {
  const rascunho = structuredClone(getStore());
  receita(rascunho);
  estado = rascunho;
  persistir(rascunho);
  listeners.forEach((listener) => listener());
}

export function inscrever(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resetar(): void {
  const novoEstado = gerarSeed(Date.now());
  estado = novoEstado;
  persistir(novoEstado);
  listeners.forEach((listener) => listener());
}

/** "Agora" do ponto de vista do app: tempo real + deslocamento do controle "avançar o tempo". */
export function agora(): Date {
  return new Date(Date.now() + getStore().demo.deslocamentoTempoMs);
}
