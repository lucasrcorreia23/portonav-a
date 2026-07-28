import type { Id, LiberacaoEquipamento, RegistroReparo, StatusChamado } from "@/lib/types";
import type { ManutencaoRepositorio } from "../repository";
import { agora, getStore, mutar } from "../store";
import { adicionarEventoHistorico } from "./historico";

export function criarManutencaoRepositorio(): ManutencaoRepositorio {
  return {
    listarApontamentos() {
      return getStore().apontamentos;
    },
    listarChamados() {
      return getStore().chamados;
    },
    buscarChamadoPorId(id: Id) {
      return getStore().chamados.find((c) => c.id === id);
    },
    moverChamado(id: Id, status: StatusChamado) {
      mutar((rascunho) => {
        const chamado = rascunho.chamados.find((c) => c.id === id);
        if (!chamado) return;
        const em = agora().toISOString();
        chamado.status = status;
        chamado.historicoStatus.push({ status, em });
        adicionarEventoHistorico(rascunho, {
          tipo: "chamado_status_alterado",
          em,
          equipamentoId: chamado.equipamentoId,
          refs: { chamadoId: chamado.id },
          resumo: `Chamado movido para "${status.replace(/_/g, " ")}".`,
        });
      });
    },
    registrarReparo(id: Id, reparo: RegistroReparo) {
      mutar((rascunho) => {
        const chamado = rascunho.chamados.find((c) => c.id === id);
        if (!chamado) return;
        chamado.registroReparo = reparo;
        if (chamado.status !== "concluido") {
          chamado.status = "aguardando_liberacao";
          chamado.historicoStatus.push({ status: "aguardando_liberacao", em: reparo.registradoEm });
        }
        adicionarEventoHistorico(rascunho, {
          tipo: "chamado_status_alterado",
          em: reparo.registradoEm,
          equipamentoId: chamado.equipamentoId,
          refs: { chamadoId: chamado.id },
          resumo: `Reparo registrado: ${reparo.descricao}`,
        });
      });
    },
    liberarChamado(id: Id, liberacao: LiberacaoEquipamento) {
      mutar((rascunho) => {
        const chamado = rascunho.chamados.find((c) => c.id === id);
        if (!chamado) return;

        chamado.liberacao = liberacao;
        chamado.status = "concluido";
        chamado.historicoStatus.push({ status: "concluido", em: liberacao.liberadoEm });

        for (const apontamentoId of chamado.apontamentoIds) {
          const apontamento = rascunho.apontamentos.find((a) => a.id === apontamentoId);
          if (apontamento && apontamento.status !== "resolvido") {
            apontamento.status = "resolvido";
            apontamento.resolvidoEm = liberacao.liberadoEm;
          }
        }

        const equipamento = rascunho.equipamentos.find((e) => e.id === chamado.equipamentoId);
        if (equipamento) {
          equipamento.status = "disponivel";
          equipamento.bloqueio = null;
          equipamento.chamadoAtivoId = null;
          equipamento.previsaoManutencao = undefined;
        }

        adicionarEventoHistorico(rascunho, {
          tipo: "chamado_concluido_liberacao",
          em: liberacao.liberadoEm,
          equipamentoId: chamado.equipamentoId,
          refs: { chamadoId: chamado.id },
          resumo: `Chamado concluído — equipamento liberado por ${liberacao.liberadoPor.nome}.`,
        });
      });
    },
  };
}
