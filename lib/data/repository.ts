import type {
  Apontamento,
  BloqueioAtivo,
  ChamadoManutencao,
  ChecklistPreenchido,
  Equipamento,
  HistoricoEvento,
  Id,
  LiberacaoEquipamento,
  ModeloChecklist,
  Operador,
  RegistroReparo,
  RespostaItemChecklist,
  SessaoOperacao,
  SincronizacaoPortal,
  StatusChamado,
  SyncQueueItem,
  TipoEquipamento,
  TipoOperacao,
} from "@/lib/types";

/** Entrada crua vinda da UI — id, status inicial e checklist padrão são resolvidos pelo repositório. */
export interface NovoEquipamento {
  tag: string;
  tipo: TipoEquipamento;
  tipoOperacao: TipoOperacao;
  modelo: string;
  localizacaoAtual: string;
}

export interface EquipamentosRepositorio {
  listar(): Equipamento[];
  buscarPorId(id: Id): Equipamento | undefined;
  buscarPorTag(tag: string): Equipamento | undefined;
  criar(entrada: NovoEquipamento): Equipamento;
  bloquear(id: Id, bloqueio: BloqueioAtivo): void;
  liberarParaUso(id: Id): void;
  marcarEmManutencao(id: Id, chamadoId: Id): void;
}

/** Entrada crua vinda da UI — resultado/suspeita/apontamentos são calculados pelo repositório. */
export interface NovoPreenchimentoChecklist {
  modeloChecklistId: Id;
  equipamentoId: Id;
  operadorId: Id;
  ordemItensEmbaralhada: Id[];
  seedEmbaralhamento: number;
  respostas: RespostaItemChecklist[];
  iniciadoEm: string;
  concluidoEm: string;
  duracaoTotalSegundos: number;
  duracaoPorSecaoSegundos: Record<Id, number>;
  preenchidoOffline: boolean;
}

export interface ResultadoRegistroChecklist {
  checklist: ChecklistPreenchido;
  apontamentosGerados: Apontamento[];
  chamadoGerado: ChamadoManutencao | null;
  sessao: SessaoOperacao | null;
  novoStatusEquipamento: Equipamento["status"];
}

export interface ChecklistsRepositorio {
  listarModelos(): ModeloChecklist[];
  buscarModeloPorId(id: Id): ModeloChecklist | undefined;
  buscarModeloPorTipo(tipo: TipoEquipamento, tipoOperacao: TipoOperacao): ModeloChecklist;
  salvarModelo(modelo: ModeloChecklist): void;
  listarPreenchimentosPorEquipamento(equipamentoId: Id): ChecklistPreenchido[];
  listarPreenchimentosPorOperador(operadorId: Id): ChecklistPreenchido[];
  listarSuspeitos(): ChecklistPreenchido[];
  registrarPreenchimento(entrada: NovoPreenchimentoChecklist): ResultadoRegistroChecklist;
}

export interface OperadoresRepositorio {
  listar(): Operador[];
  buscarPorId(id: Id): Operador | undefined;
  possuiHabilitacaoValida(operadorId: Id, tipo: TipoEquipamento): boolean;
  obterSincronizacaoPortal(): SincronizacaoPortal;
  sincronizarComPortal(): void;
}

export interface ManutencaoRepositorio {
  listarApontamentos(): Apontamento[];
  listarChamados(): ChamadoManutencao[];
  buscarChamadoPorId(id: Id): ChamadoManutencao | undefined;
  moverChamado(id: Id, status: StatusChamado): void;
  registrarReparo(id: Id, reparo: RegistroReparo): void;
  liberarChamado(id: Id, liberacao: LiberacaoEquipamento): void;
}

export interface SessoesRepositorio {
  listarAbertas(): SessaoOperacao[];
  buscarPorId(id: Id): SessaoOperacao | undefined;
  buscarAbertaPorEquipamento(equipamentoId: Id): SessaoOperacao | undefined;
  encerrar(id: Id): void;
}

export interface HistoricoRepositorio {
  listarPorEquipamento(equipamentoId: Id): HistoricoEvento[];
  listarRecente(limite: number): HistoricoEvento[];
}

export interface SyncRepositorio {
  listarFila(): SyncQueueItem[];
  contarPendentes(): number;
  sincronizar(): void;
}

export interface Repositorio {
  equipamentos: EquipamentosRepositorio;
  checklists: ChecklistsRepositorio;
  operadores: OperadoresRepositorio;
  manutencao: ManutencaoRepositorio;
  sessoes: SessoesRepositorio;
  historico: HistoricoRepositorio;
  sync: SyncRepositorio;
}
