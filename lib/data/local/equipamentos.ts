import type { BloqueioAtivo, Equipamento, Id } from "@/lib/types";
import type { EquipamentosRepositorio, NovoEquipamento } from "../repository";
import { resolverModeloChecklistPadrao } from "../checklist-logica";
import { criarId } from "../id";
import { agora, getStore, mutar, type EstadoAplicacao } from "../store";
import { adicionarEventoHistorico } from "./historico";

/**
 * Helpers internos (fora de EquipamentosRepositorio) — mutam o rascunho dentro da
 * transação mutar() de quem chamou, para que operações compostas (registrar checklist,
 * mover chamado, liberar chamado) permaneçam uma única transação/re-render. As mesmas
 * regras também ficam expostas como métodos individuais do repositório logo abaixo.
 */
export function bloquearEquipamento(rascunho: EstadoAplicacao, equipamentoId: Id, bloqueio: BloqueioAtivo): void {
  const equipamento = rascunho.equipamentos.find((e) => e.id === equipamentoId);
  if (!equipamento) return;
  equipamento.status = "bloqueado";
  equipamento.bloqueio = bloqueio;
}

export function liberarEquipamentoParaUso(rascunho: EstadoAplicacao, equipamentoId: Id): void {
  const equipamento = rascunho.equipamentos.find((e) => e.id === equipamentoId);
  if (!equipamento) return;
  equipamento.status = "disponivel";
  equipamento.bloqueio = null;
  equipamento.chamadoAtivoId = null;
  equipamento.previsaoManutencao = undefined;
}

export function marcarEquipamentoEmManutencao(rascunho: EstadoAplicacao, equipamentoId: Id, chamadoId: Id): void {
  const equipamento = rascunho.equipamentos.find((e) => e.id === equipamentoId);
  if (!equipamento) return;
  equipamento.status = "em_manutencao";
  equipamento.chamadoAtivoId = chamadoId;
}

export function criarEquipamentosRepositorio(): EquipamentosRepositorio {
  return {
    listar() {
      return getStore().equipamentos;
    },
    buscarPorId(id: Id) {
      return getStore().equipamentos.find((e) => e.id === id);
    },
    buscarPorTag(tag: string) {
      const alvo = tag.trim().toLowerCase();
      return getStore().equipamentos.find((e) => e.tag.toLowerCase() === alvo);
    },
    criar(entrada: NovoEquipamento) {
      const tag = entrada.tag.trim().toUpperCase();
      if (getStore().equipamentos.some((e) => e.tag.toLowerCase() === tag.toLowerCase())) {
        throw new Error(`Já existe um equipamento com a tag "${tag}".`);
      }

      let criado!: Equipamento;
      mutar((rascunho) => {
        const modeloChecklist = resolverModeloChecklistPadrao(entrada.tipo, entrada.tipoOperacao, rascunho.modelosChecklist);
        const em = agora().toISOString();
        const equipamento: Equipamento = {
          id: criarId("equip"),
          tag,
          tipo: entrada.tipo,
          tipoOperacao: entrada.tipoOperacao,
          modelo: entrada.modelo,
          localizacaoAtual: entrada.localizacaoAtual,
          status: "disponivel",
          bloqueio: null,
          chamadoAtivoId: null,
          modeloChecklistIdPadrao: modeloChecklist.id,
          criadoEm: em,
        };
        rascunho.equipamentos.push(equipamento);
        adicionarEventoHistorico(rascunho, {
          tipo: "equipamento_cadastrado",
          em,
          equipamentoId: equipamento.id,
          refs: {},
          resumo: `Equipamento ${equipamento.tag} cadastrado (checklist padrão: ${modeloChecklist.nome}).`,
        });
        criado = equipamento;
      });
      return criado;
    },
    bloquear(id: Id, bloqueio: BloqueioAtivo) {
      mutar((rascunho) => bloquearEquipamento(rascunho, id, bloqueio));
    },
    liberarParaUso(id: Id) {
      mutar((rascunho) => liberarEquipamentoParaUso(rascunho, id));
    },
    marcarEmManutencao(id: Id, chamadoId: Id) {
      mutar((rascunho) => marcarEquipamentoEmManutencao(rascunho, id, chamadoId));
    },
  };
}
