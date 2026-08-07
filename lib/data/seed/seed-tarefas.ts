import type { Equipamento, Operador, Tarefa } from "@/lib/types";
import { criarIdSeed, type RNG } from "./rng";
import { HORA_MS, SUPERVISOR_PADRAO } from "../regras";

interface TarefaSeedInput {
  matriculaOperador: string;
  tagEquipamento: string;
  descricaoDemanda: string;
  status: "pendente" | "aprovada" | "rejeitada";
  /** horas atrás (relativas a agoraBaseMs) em que a tarefa foi criada */
  criadaHorasAtras: number;
  /** só p/ aprovada/rejeitada — horas atrás em que a decisão foi tomada */
  decididaHorasAtras?: number;
  observacaoDecisao?: string;
}

const ROSTER: TarefaSeedInput[] = [
  {
    matriculaOperador: "PN-4521",
    tagEquipamento: "EMP-01",
    descricaoDemanda: "Chefe pediu para mover carga geral do Pátio A até o fim do turno.",
    status: "aprovada",
    criadaHorasAtras: 30,
    decididaHorasAtras: 29,
  },
  {
    matriculaOperador: "PN-4521",
    tagEquipamento: "EMP-02",
    descricaoDemanda: "Movimentação de contêineres solicitada pelo chefe de turno.",
    status: "aprovada",
    criadaHorasAtras: 28,
    decididaHorasAtras: 27,
  },
  {
    matriculaOperador: "PN-4521",
    tagEquipamento: "EMP-03",
    descricaoDemanda: "Chefe solicitou apoio na Fileira 1 do Pátio B.",
    status: "aprovada",
    criadaHorasAtras: 26,
    decididaHorasAtras: 25,
  },
  {
    matriculaOperador: "PN-4521",
    tagEquipamento: "EMP-04",
    descricaoDemanda: "Descarregar granéis conforme escala do chefe de pátio.",
    status: "aprovada",
    criadaHorasAtras: 24,
    decididaHorasAtras: 23,
  },
  {
    matriculaOperador: "PN-4521",
    tagEquipamento: "TP-01",
    descricaoDemanda: "Apoio solicitado pelo chefe no Galpão 1.",
    status: "aprovada",
    criadaHorasAtras: 22,
    decididaHorasAtras: 21,
  },
  {
    matriculaOperador: "PN-4523",
    tagEquipamento: "RS-01",
    descricaoDemanda: "Chefe pediu para mover contêineres no Pátio C — cobertura de turno.",
    status: "aprovada",
    criadaHorasAtras: 20,
    decididaHorasAtras: 19,
  },
  {
    matriculaOperador: "PN-4525",
    tagEquipamento: "EMP-01",
    descricaoDemanda: "Pedido para adiantar carregamento antes do intervalo.",
    status: "rejeitada",
    criadaHorasAtras: 18,
    decididaHorasAtras: 17,
    observacaoDecisao: "Chefe cancelou a demanda — carga já foi remanejada para outro turno.",
  },
  {
    matriculaOperador: "PN-4522",
    tagEquipamento: "TP-02",
    descricaoDemanda: "Chefe pediu para descarregar o caminhão do Galpão 2 ainda hoje.",
    status: "pendente",
    criadaHorasAtras: 2,
  },
  {
    matriculaOperador: "PN-4524",
    tagEquipamento: "RS-02",
    descricaoDemanda: "Movimentação de contêineres na Fileira 2 do Pátio C, a pedido do chefe.",
    status: "aprovada",
    criadaHorasAtras: 1,
    decididaHorasAtras: 0.5,
  },
];

export function gerarTarefas(agoraBaseMs: number, rng: RNG, equipamentos: Equipamento[], operadores: Operador[]): Tarefa[] {
  const buscarEquip = (tag: string) => {
    const eq = equipamentos.find((e) => e.tag === tag);
    if (!eq) throw new Error(`Equipamento ${tag} não encontrado no seed de tarefas`);
    return eq;
  };
  const buscarOperador = (matricula: string) => {
    const op = operadores.find((o) => o.matricula === matricula);
    if (!op) throw new Error(`Operador ${matricula} não encontrado no seed de tarefas`);
    return op;
  };

  return ROSTER.map((entrada) => {
    const equipamento = buscarEquip(entrada.tagEquipamento);
    const operador = buscarOperador(entrada.matriculaOperador);
    const criadaEm = new Date(agoraBaseMs - entrada.criadaHorasAtras * HORA_MS).toISOString();

    const tarefa: Tarefa = {
      id: criarIdSeed(rng, "tarefa"),
      operadorId: operador.id,
      equipamentoId: equipamento.id,
      descricaoDemanda: entrada.descricaoDemanda,
      status: entrada.status,
      criadaEm,
    };

    if (entrada.status !== "pendente" && entrada.decididaHorasAtras !== undefined) {
      tarefa.decisao = {
        decididoPor: SUPERVISOR_PADRAO,
        decisao: entrada.status,
        decididoEm: new Date(agoraBaseMs - entrada.decididaHorasAtras * HORA_MS).toISOString(),
        observacao: entrada.observacaoDecisao,
      };
    }

    return tarefa;
  });
}
