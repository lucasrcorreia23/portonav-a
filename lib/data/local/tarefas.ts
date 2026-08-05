import type { DecisaoTarefa, Id, ISODateString, Tarefa } from "@/lib/types";
import type { NovaTarefa, TarefasRepositorio } from "../repository";
import { REGRA_APROVACAO_TAREFA_PADRAO } from "../regras";
import { agora, getStore, mutar } from "../store";
import { criarId } from "../id";
import { adicionarEventoHistorico } from "./historico";

export function criarTarefasRepositorio(): TarefasRepositorio {
  return {
    listar() {
      return getStore().tarefas;
    },
    listarPorOperador(operadorId: Id) {
      return getStore().tarefas.filter((t) => t.operadorId === operadorId);
    },
    listarPendentes() {
      return getStore().tarefas.filter((t) => t.status === "pendente");
    },
    buscarPorId(id: Id) {
      return getStore().tarefas.find((t) => t.id === id);
    },
    buscarAprovadaAtiva(operadorId: Id, equipamentoId: Id) {
      return getStore().tarefas.find(
        (t) => t.operadorId === operadorId && t.equipamentoId === equipamentoId && t.status === "aprovada",
      );
    },
    criar(entrada: NovaTarefa) {
      const store = getStore();
      if (!store.operadores.some((o) => o.id === entrada.operadorId)) {
        throw new Error("Operador não encontrado.");
      }
      if (!store.equipamentos.some((e) => e.id === entrada.equipamentoId)) {
        throw new Error("Equipamento não encontrado.");
      }
      const jaAtiva = store.tarefas.some(
        (t) =>
          t.operadorId === entrada.operadorId &&
          t.equipamentoId === entrada.equipamentoId &&
          (t.status === "pendente" || t.status === "aprovada"),
      );
      if (jaAtiva) {
        throw new Error("Já existe uma solicitação pendente ou aprovada para este equipamento.");
      }

      const tarefa: Tarefa = {
        id: criarId("tarefa"),
        operadorId: entrada.operadorId,
        equipamentoId: entrada.equipamentoId,
        descricaoDemanda: entrada.descricaoDemanda,
        status: "pendente",
        criadaEm: agora().toISOString(),
      };

      mutar((rascunho) => {
        rascunho.tarefas.push(tarefa);
        adicionarEventoHistorico(rascunho, {
          tipo: "tarefa_criada",
          em: tarefa.criadaEm,
          equipamentoId: tarefa.equipamentoId,
          operadorId: tarefa.operadorId,
          refs: { tarefaId: tarefa.id },
          resumo: `Solicitação criada: "${tarefa.descricaoDemanda}"`,
        });
      });

      return tarefa;
    },
    aprovar(id: Id, decisao: DecisaoTarefa) {
      if (!REGRA_APROVACAO_TAREFA_PADRAO.perfisPermitidos.includes(decisao.decididoPor.perfil)) {
        throw new Error(`Perfil "${decisao.decididoPor.perfil}" não tem permissão para aprovar esta solicitação.`);
      }
      mutar((rascunho) => {
        const tarefa = rascunho.tarefas.find((t) => t.id === id);
        if (!tarefa) return;
        tarefa.status = "aprovada";
        tarefa.decisao = decisao;
        adicionarEventoHistorico(rascunho, {
          tipo: "tarefa_aprovada",
          em: decisao.decididoEm,
          equipamentoId: tarefa.equipamentoId,
          operadorId: tarefa.operadorId,
          refs: { tarefaId: tarefa.id },
          resumo: `Solicitação aprovada por ${decisao.decididoPor.nome}.`,
        });
      });
    },
    rejeitar(id: Id, decisao: DecisaoTarefa) {
      if (!REGRA_APROVACAO_TAREFA_PADRAO.perfisPermitidos.includes(decisao.decididoPor.perfil)) {
        throw new Error(`Perfil "${decisao.decididoPor.perfil}" não tem permissão para rejeitar esta solicitação.`);
      }
      mutar((rascunho) => {
        const tarefa = rascunho.tarefas.find((t) => t.id === id);
        if (!tarefa) return;
        tarefa.status = "rejeitada";
        tarefa.decisao = decisao;
        adicionarEventoHistorico(rascunho, {
          tipo: "tarefa_rejeitada",
          em: decisao.decididoEm,
          equipamentoId: tarefa.equipamentoId,
          operadorId: tarefa.operadorId,
          refs: { tarefaId: tarefa.id },
          resumo: `Solicitação rejeitada por ${decisao.decididoPor.nome}.`,
        });
      });
    },
    concluir(id: Id) {
      mutar((rascunho) => {
        const tarefa = rascunho.tarefas.find((t) => t.id === id);
        if (!tarefa || tarefa.status !== "aprovada") return;
        const em = agora().toISOString();
        tarefa.status = "concluida";
        tarefa.concluidaEm = em;
        adicionarEventoHistorico(rascunho, {
          tipo: "tarefa_concluida",
          em,
          equipamentoId: tarefa.equipamentoId,
          operadorId: tarefa.operadorId,
          refs: { tarefaId: tarefa.id },
          resumo: "Tarefa finalizada pelo operador.",
        });
      });
    },
    reagendar(id: Id, agendamentoPara: ISODateString) {
      mutar((rascunho) => {
        const tarefa = rascunho.tarefas.find((t) => t.id === id);
        if (!tarefa || tarefa.status !== "aprovada") return;
        tarefa.agendamentoPara = agendamentoPara;
        adicionarEventoHistorico(rascunho, {
          tipo: "tarefa_reagendada",
          em: agora().toISOString(),
          equipamentoId: tarefa.equipamentoId,
          operadorId: tarefa.operadorId,
          refs: { tarefaId: tarefa.id },
          resumo: `Novo uso agendado para ${new Date(agendamentoPara).toLocaleDateString("pt-BR")}.`,
        });
      });
    },
  };
}
