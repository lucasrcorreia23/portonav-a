import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  CircleDot,
  Clock,
  Hourglass,
  PlayCircle,
  ShieldCheck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type {
  StatusApontamento,
  StatusChamado,
  StatusChecklistPreenchido,
  StatusOperacionalEquipamento,
} from "@/lib/types";

export interface EntradaTaxonomia {
  label: string;
  descricao: string;
  icone: LucideIcon;
  /** Classes Tailwind — sempre "text-status-X bg-status-X-surface", nunca hex direto no componente. */
  classeCor: string;
}

/**
 * Fonte única da semântica de status de equipamento. Toda tela renderiza status
 * através de <StatusBadge>, que lê exclusivamente daqui — nunca uma cor sozinha,
 * sempre ícone + texto + cor juntos (há daltônicos no pátio).
 */
export const TAXONOMIA_STATUS_EQUIPAMENTO: Record<StatusOperacionalEquipamento, EntradaTaxonomia> = {
  disponivel: {
    label: "Disponível",
    descricao: "Equipamento liberado e pronto para uso.",
    icone: CheckCircle2,
    classeCor: "text-status-disponivel bg-status-disponivel-surface",
  },
  em_uso: {
    label: "Em uso",
    descricao: "Equipamento em operação neste momento.",
    icone: PlayCircle,
    classeCor: "text-status-em-uso bg-status-em-uso-surface",
  },
  com_apontamento: {
    label: "Com apontamento",
    descricao: "Uso liberado, mas há um apontamento não crítico em aberto.",
    icone: AlertTriangle,
    classeCor: "text-status-apontamento bg-status-apontamento-surface",
  },
  bloqueado: {
    label: "Avariado",
    descricao: "Bloqueado para uso por falha crítica de segurança.",
    icone: Ban,
    classeCor: "text-status-avariado bg-status-avariado-surface",
  },
  em_manutencao: {
    label: "Em manutenção",
    descricao: "Em manutenção — uso temporariamente indisponível.",
    icone: Wrench,
    classeCor: "text-status-manutencao bg-status-manutencao-surface",
  },
};

export const TAXONOMIA_STATUS_APONTAMENTO: Record<StatusApontamento, EntradaTaxonomia> = {
  aberto: {
    label: "Aberto",
    descricao: "Apontamento registrado, ainda não atendido.",
    icone: AlertTriangle,
    classeCor: "text-status-apontamento bg-status-apontamento-surface",
  },
  em_atendimento: {
    label: "Em atendimento",
    descricao: "Manutenção já está tratando este apontamento.",
    icone: Wrench,
    classeCor: "text-status-manutencao bg-status-manutencao-surface",
  },
  resolvido: {
    label: "Resolvido",
    descricao: "Apontamento tratado e encerrado.",
    icone: ShieldCheck,
    classeCor: "text-status-disponivel bg-status-disponivel-surface",
  },
};

export const TAXONOMIA_STATUS_CHAMADO: Record<StatusChamado, EntradaTaxonomia> = {
  aberto: {
    label: "Aberto",
    descricao: "Chamado registrado, aguardando início do atendimento.",
    icone: Clock,
    classeCor: "text-status-apontamento bg-status-apontamento-surface",
  },
  em_atendimento: {
    label: "Em atendimento",
    descricao: "Equipe de manutenção está atendendo este chamado.",
    icone: Wrench,
    classeCor: "text-status-manutencao bg-status-manutencao-surface",
  },
  aguardando_liberacao: {
    label: "Aguardando liberação",
    descricao: "Reparo registrado — aguardando liberação do equipamento.",
    icone: Hourglass,
    classeCor: "text-status-em-uso bg-status-em-uso-surface",
  },
  concluido: {
    label: "Concluído",
    descricao: "Chamado concluído e equipamento liberado.",
    icone: ShieldCheck,
    classeCor: "text-status-disponivel bg-status-disponivel-surface",
  },
};

export const TAXONOMIA_RESULTADO_CHECKLIST: Record<StatusChecklistPreenchido, EntradaTaxonomia> = {
  liberado: {
    label: "Liberado",
    descricao: "Todos os itens verificados, sem reprovações.",
    icone: CheckCircle2,
    classeCor: "text-status-disponivel bg-status-disponivel-surface",
  },
  liberado_com_apontamento: {
    label: "Liberado com apontamento",
    descricao: "Uso liberado, com item não crítico reprovado.",
    icone: AlertTriangle,
    classeCor: "text-status-apontamento bg-status-apontamento-surface",
  },
  bloqueado: {
    label: "Bloqueado",
    descricao: "Item crítico reprovado — uso bloqueado.",
    icone: Ban,
    classeCor: "text-status-avariado bg-status-avariado-surface",
  },
};

/** Usado quando nenhuma sessão está ativa, mas é preciso indicar "sem sessão"/estado neutro. */
export const ENTRADA_NEUTRA: EntradaTaxonomia = {
  label: "—",
  descricao: "Sem informação.",
  icone: CircleDot,
  classeCor: "text-neutral-500 bg-neutral-100",
};
