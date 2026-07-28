import type { Id, ISODateString } from "./common";
import type { TipoEquipamento } from "./equipamento";

export type TipoRespostaItem = "ok_nao_ok" | "numerico" | "texto";

export type ModoTratamentoItem = "bloqueia" | "alerta";

export interface ItemChecklistDefinicao {
  id: Id;
  ordemPadrao: number;
  titulo: string;
  descricaoAjuda?: string;
  tipoResposta: TipoRespostaItem;
  modoTratamento: ModoTratamentoItem;
  exigeFotoAoReprovar: boolean;
  exigeObservacaoAoReprovar: boolean;
  unidade?: string;
  faixaEsperada?: { min: number; max: number };
}

export interface SecaoChecklist {
  id: Id;
  titulo: string;
  itens: ItemChecklistDefinicao[];
}

export interface ModeloChecklist {
  id: Id;
  nome: string;
  tipoEquipamentoAlvo: TipoEquipamento | "todos";
  versao: number;
  secoes: SecaoChecklist[];
  ativo: boolean;
  criadoEm: ISODateString;
  atualizadoEm: ISODateString;
}

export type StatusChecklistPreenchido =
  | "liberado"
  | "liberado_com_apontamento"
  | "bloqueado";

export interface FotoEvidencia {
  dataUrl: string;
  timestamp: ISODateString;
  origemSimulada: boolean;
}

export interface RespostaItemChecklist {
  itemId: Id;
  valor: "ok" | "nao_ok" | number | string;
  reprovado: boolean;
  observacao?: string;
  fotoEvidencia?: FotoEvidencia;
  respondidoEm: ISODateString;
}

export type MotivoSuspeita =
  | {
      tipo: "tempo_minimo_nao_atingido";
      secaoId: Id;
      duracaoSegundos: number;
      minimoEsperadoSegundos: number;
    }
  | {
      tipo: "preenchimento_recorde";
      duracaoTotalSegundos: number;
      minimoEsperadoSegundos: number;
    }
  | { tipo: "padrao_identico_historico_recente"; checklistAnteriorId: Id };

export interface ChecklistPreenchido {
  id: Id;
  modeloChecklistId: Id;
  modeloVersao: number;
  equipamentoId: Id;
  operadorId: Id;
  /** Ausente quando o resultado é 'bloqueado' (a operação nunca chega a começar) */
  sessaoOperacaoId?: Id;
  ordemItensEmbaralhada: Id[];
  seedEmbaralhamento: number;
  respostas: RespostaItemChecklist[];
  iniciadoEm: ISODateString;
  concluidoEm: ISODateString;
  duracaoTotalSegundos: number;
  duracaoPorSecaoSegundos: Record<Id, number>;
  resultado: StatusChecklistPreenchido;
  suspeito: boolean;
  motivosSuspeita: MotivoSuspeita[];
  scoreConfiabilidadeNoMomento: number;
  preenchidoOffline: boolean;
}
