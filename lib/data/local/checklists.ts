import type {
  Apontamento,
  ChamadoManutencao,
  ChecklistPreenchido,
  MotivoSuspeita,
  SessaoOperacao,
} from "@/lib/types";
import type {
  ChecklistsRepositorio,
  NovoPreenchimentoChecklist,
  ResultadoRegistroChecklist,
} from "../repository";
import { getStore, mutar } from "../store";
import { criarId } from "../id";
import { calcularResultadoChecklist, itensPlanos } from "../checklist-logica";
import { TEMPO_MINIMO_SECAO_SEGUNDOS, TEMPO_MINIMO_TOTAL_SEGUNDOS } from "../regras";
import { adicionarEventoHistorico } from "./historico";
import { enfileirarSeOffline } from "./sync";

export function criarChecklistsRepositorio(): ChecklistsRepositorio {
  return {
    listarModelos() {
      return getStore().modelosChecklist;
    },
    buscarModeloPorId(id) {
      return getStore().modelosChecklist.find((m) => m.id === id);
    },
    buscarModeloPorTipo(tipo) {
      const modelos = getStore().modelosChecklist;
      return modelos.find((m) => m.tipoEquipamentoAlvo === tipo) ?? modelos.find((m) => m.tipoEquipamentoAlvo === "todos");
    },
    salvarModelo(modelo) {
      mutar((rascunho) => {
        const indice = rascunho.modelosChecklist.findIndex((m) => m.id === modelo.id);
        if (indice === -1) {
          rascunho.modelosChecklist.push(modelo);
        } else {
          rascunho.modelosChecklist[indice] = modelo;
        }
      });
    },
    listarPreenchimentosPorEquipamento(equipamentoId) {
      return getStore().checklistsPreenchidos.filter((c) => c.equipamentoId === equipamentoId);
    },
    listarPreenchimentosPorOperador(operadorId) {
      return getStore().checklistsPreenchidos.filter((c) => c.operadorId === operadorId);
    },
    listarSuspeitos() {
      return getStore().checklistsPreenchidos.filter((c) => c.suspeito);
    },
    registrarPreenchimento(entrada: NovoPreenchimentoChecklist): ResultadoRegistroChecklist {
      let resultadoFinal!: ResultadoRegistroChecklist;

      mutar((rascunho) => {
        const equipamento = rascunho.equipamentos.find((e) => e.id === entrada.equipamentoId);
        const operador = rascunho.operadores.find((o) => o.id === entrada.operadorId);
        const modelo = rascunho.modelosChecklist.find((m) => m.id === entrada.modeloChecklistId);
        if (!equipamento || !operador || !modelo) {
          throw new Error(
            "Dados inconsistentes ao registrar checklist: equipamento, operador ou modelo não encontrado.",
          );
        }

        const plano = itensPlanos(modelo);
        const resultado = calcularResultadoChecklist(plano, entrada.respostas);

        const motivosSuspeita: MotivoSuspeita[] = [];
        for (const [secaoId, duracao] of Object.entries(entrada.duracaoPorSecaoSegundos)) {
          if (duracao < TEMPO_MINIMO_SECAO_SEGUNDOS) {
            motivosSuspeita.push({
              tipo: "tempo_minimo_nao_atingido",
              secaoId,
              duracaoSegundos: duracao,
              minimoEsperadoSegundos: TEMPO_MINIMO_SECAO_SEGUNDOS,
            });
          }
        }
        if (motivosSuspeita.length === 0 && entrada.duracaoTotalSegundos < TEMPO_MINIMO_TOTAL_SEGUNDOS) {
          motivosSuspeita.push({
            tipo: "preenchimento_recorde",
            duracaoTotalSegundos: entrada.duracaoTotalSegundos,
            minimoEsperadoSegundos: TEMPO_MINIMO_TOTAL_SEGUNDOS,
          });
        }

        const checklist: ChecklistPreenchido = {
          id: criarId("checklist"),
          modeloChecklistId: modelo.id,
          modeloVersao: modelo.versao,
          equipamentoId: equipamento.id,
          operadorId: operador.id,
          ordemItensEmbaralhada: entrada.ordemItensEmbaralhada,
          seedEmbaralhamento: entrada.seedEmbaralhamento,
          respostas: entrada.respostas,
          iniciadoEm: entrada.iniciadoEm,
          concluidoEm: entrada.concluidoEm,
          duracaoTotalSegundos: entrada.duracaoTotalSegundos,
          duracaoPorSecaoSegundos: entrada.duracaoPorSecaoSegundos,
          resultado,
          suspeito: motivosSuspeita.length > 0,
          motivosSuspeita,
          scoreConfiabilidadeNoMomento: operador.scoreConfiabilidade,
          preenchidoOffline: entrada.preenchidoOffline,
        };
        rascunho.checklistsPreenchidos.push(checklist);

        adicionarEventoHistorico(rascunho, {
          tipo: "checklist_preenchido",
          em: checklist.concluidoEm,
          equipamentoId: equipamento.id,
          operadorId: operador.id,
          refs: { checklistPreenchidoId: checklist.id },
          resumo: `Checklist "${modelo.nome}" preenchido por ${operador.nome} — resultado: ${resultado.replace(/_/g, " ")}.`,
        });

        const apontamentosGerados: Apontamento[] = [];
        for (const resposta of entrada.respostas.filter((r) => r.reprovado)) {
          const def = plano.find((p) => p.item.id === resposta.itemId)?.item;
          if (!def) continue;
          const apontamento: Apontamento = {
            id: criarId("apont"),
            equipamentoId: equipamento.id,
            origem: { checklistPreenchidoId: checklist.id, itemId: def.id, itemTitulo: def.titulo },
            modoTratamento: def.modoTratamento,
            criticidade: def.modoTratamento === "bloqueia" ? "critica" : "nao_critica",
            descricao: resposta.observacao ?? `${def.titulo} reprovado durante checklist de pré-operação.`,
            fotoEvidencia: resposta.fotoEvidencia,
            status: "aberto",
            chamadoId: null,
            criadoEm: checklist.concluidoEm,
            criadoPorOperadorId: operador.id,
          };
          apontamentosGerados.push(apontamento);
          rascunho.apontamentos.push(apontamento);
          adicionarEventoHistorico(rascunho, {
            tipo: "apontamento_criado",
            em: checklist.concluidoEm,
            equipamentoId: equipamento.id,
            operadorId: operador.id,
            refs: { apontamentoId: apontamento.id, checklistPreenchidoId: checklist.id },
            resumo: `Apontamento aberto para "${def.titulo}" (${apontamento.criticidade === "critica" ? "crítico" : "não crítico"}).`,
          });
        }

        let chamadoGerado: ChamadoManutencao | null = null;
        if (apontamentosGerados.length > 0) {
          const algumaCritica = apontamentosGerados.some((a) => a.criticidade === "critica");
          chamadoGerado = {
            id: criarId("chamado"),
            equipamentoId: equipamento.id,
            apontamentoIds: apontamentosGerados.map((a) => a.id),
            origemAutomatica: true,
            status: "aberto",
            prioridade: algumaCritica ? "alta" : "media",
            abertoEm: checklist.concluidoEm,
            historicoStatus: [{ status: "aberto", em: checklist.concluidoEm }],
          };
          rascunho.chamados.push(chamadoGerado);
          for (const apontamento of apontamentosGerados) {
            apontamento.chamadoId = chamadoGerado.id;
          }
          adicionarEventoHistorico(rascunho, {
            tipo: "chamado_aberto",
            em: checklist.concluidoEm,
            equipamentoId: equipamento.id,
            refs: { chamadoId: chamadoGerado.id },
            resumo: `Chamado de manutenção aberto automaticamente (prioridade ${chamadoGerado.prioridade === "alta" ? "alta" : "média"}).`,
          });
        }

        let sessao: SessaoOperacao | null = null;
        if (resultado === "bloqueado") {
          const apontamentoCritico = apontamentosGerados.find((a) => a.criticidade === "critica")!;
          equipamento.status = "bloqueado";
          equipamento.bloqueio = {
            motivo: apontamentoCritico.descricao,
            origemItemChecklistId: apontamentoCritico.origem.itemId,
            bloqueadoPor: { perfil: "sistema", nome: "Sistema (bloqueio automático)" },
            bloqueadoEm: checklist.concluidoEm,
            apontamentoId: apontamentoCritico.id,
          };
          equipamento.chamadoAtivoId = chamadoGerado!.id;
          adicionarEventoHistorico(rascunho, {
            tipo: "equipamento_bloqueado",
            em: checklist.concluidoEm,
            equipamentoId: equipamento.id,
            refs: { apontamentoId: apontamentoCritico.id, chamadoId: chamadoGerado!.id },
            resumo: `Equipamento bloqueado automaticamente: ${apontamentoCritico.descricao}`,
          });
        } else {
          const sessaoId = criarId("sessao");
          checklist.sessaoOperacaoId = sessaoId;
          sessao = {
            id: sessaoId,
            equipamentoId: equipamento.id,
            operadorId: operador.id,
            checklistPreenchidoId: checklist.id,
            resultadoChecklist: resultado,
            iniciadoEm: checklist.concluidoEm,
            status: "em_andamento",
          };
          rascunho.sessoes.push(sessao);
          equipamento.status = "em_uso";
          if (chamadoGerado) {
            equipamento.chamadoAtivoId = chamadoGerado.id;
          }
          adicionarEventoHistorico(rascunho, {
            tipo: "equipamento_liberado_uso",
            em: checklist.concluidoEm,
            equipamentoId: equipamento.id,
            operadorId: operador.id,
            refs: { sessaoOperacaoId: sessao.id, checklistPreenchidoId: checklist.id },
            resumo: `Equipamento liberado para uso por ${operador.nome}.`,
          });
        }

        enfileirarSeOffline(rascunho, { tipo: "checklist_preenchido", payload: checklist });

        resultadoFinal = {
          checklist,
          apontamentosGerados,
          chamadoGerado,
          sessao,
          novoStatusEquipamento: equipamento.status,
        };
      });

      return resultadoFinal;
    },
  };
}
