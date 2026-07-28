import type { BloqueioAtivo, Id } from "@/lib/types";
import type { EquipamentosRepositorio } from "../repository";
import { getStore, mutar } from "../store";

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
    bloquear(id: Id, bloqueio: BloqueioAtivo) {
      mutar((rascunho) => {
        const equipamento = rascunho.equipamentos.find((e) => e.id === id);
        if (!equipamento) return;
        equipamento.status = "bloqueado";
        equipamento.bloqueio = bloqueio;
      });
    },
    liberarParaUso(id: Id) {
      mutar((rascunho) => {
        const equipamento = rascunho.equipamentos.find((e) => e.id === id);
        if (!equipamento) return;
        equipamento.status = "disponivel";
        equipamento.bloqueio = null;
        equipamento.chamadoAtivoId = null;
        equipamento.previsaoManutencao = undefined;
      });
    },
    marcarEmManutencao(id: Id, chamadoId: Id) {
      mutar((rascunho) => {
        const equipamento = rascunho.equipamentos.find((e) => e.id === id);
        if (!equipamento) return;
        equipamento.status = "em_manutencao";
        equipamento.chamadoAtivoId = chamadoId;
      });
    },
  };
}
