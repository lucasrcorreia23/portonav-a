import type { AnaliseAdminChamado, Id, LiberacaoEquipamento, RegistroReparo, StatusChamado } from "@/lib/types";
import type { ManutencaoRepositorio } from "../repository";
import { REGRA_ANALISE_ADMIN_PADRAO, REGRA_LIBERACAO_PADRAO } from "../regras";
import { agora, getStore, mutar } from "../store";
import { adicionarEventoHistorico } from "./historico";
import { liberarEquipamentoParaUso, marcarEquipamentoEmManutencao } from "./equipamentos";

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
        // Só equipamento avariado (bloqueado) vira "em manutenção" ao iniciar o atendimento —
        // um chamado não crítico (modo alerta) não deve tirar de serviço um equipamento em uso.
        const equipamentoDoChamado = rascunho.equipamentos.find((e) => e.id === chamado.equipamentoId);
        if (status === "em_atendimento" && equipamentoDoChamado?.status === "bloqueado") {
          marcarEquipamentoEmManutencao(rascunho, chamado.equipamentoId, chamado.id);
        }
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
      if (!REGRA_LIBERACAO_PADRAO.perfisPermitidos.includes(liberacao.liberadoPor.perfil)) {
        throw new Error(`Perfil "${liberacao.liberadoPor.perfil}" não tem permissão para liberar este equipamento.`);
      }
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

        liberarEquipamentoParaUso(rascunho, chamado.equipamentoId);

        adicionarEventoHistorico(rascunho, {
          tipo: "chamado_concluido_liberacao",
          em: liberacao.liberadoEm,
          equipamentoId: chamado.equipamentoId,
          refs: { chamadoId: chamado.id },
          resumo: `Chamado concluído — equipamento liberado por ${liberacao.liberadoPor.nome}.`,
        });
      });
    },
    registrarAnaliseAdmin(id: Id, analise: AnaliseAdminChamado) {
      if (!REGRA_ANALISE_ADMIN_PADRAO.perfisPermitidos.includes(analise.analisadoPor.perfil)) {
        throw new Error(`Perfil "${analise.analisadoPor.perfil}" não tem permissão para registrar análise administrativa.`);
      }
      mutar((rascunho) => {
        const chamado = rascunho.chamados.find((c) => c.id === id);
        if (!chamado) return;
        chamado.analiseAdmin = analise;
        adicionarEventoHistorico(rascunho, {
          tipo: "chamado_analise_admin_registrada",
          em: analise.analisadoEm,
          equipamentoId: chamado.equipamentoId,
          refs: { chamadoId: chamado.id },
          resumo: `Análise administrativa registrada${analise.geradoPorIA ? " (com sugestão de IA)" : ""}.`,
        });
      });
    },
  };
}
