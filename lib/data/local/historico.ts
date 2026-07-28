import type { HistoricoEvento, Id } from "@/lib/types";
import type { HistoricoRepositorio } from "../repository";
import type { EstadoAplicacao } from "../store";
import { getStore } from "../store";
import { criarId } from "../id";

/**
 * Helper interno (não faz parte de HistoricoRepositorio): usado por operações compostas
 * (ex.: registrar checklist, liberar chamado) para anexar um evento dentro do MESMO
 * `mutar()` que já está alterando outras fatias do estado — nunca chama mutar() sozinho,
 * para que toda a operação composta vire uma única transação/re-render.
 */
export function adicionarEventoHistorico(
  rascunho: EstadoAplicacao,
  evento: Omit<HistoricoEvento, "id">,
): void {
  rascunho.historico.push({ id: criarId("hist"), ...evento });
}

export function criarHistoricoRepositorio(): HistoricoRepositorio {
  return {
    listarPorEquipamento(equipamentoId: Id) {
      return getStore()
        .historico.filter((e) => e.equipamentoId === equipamentoId)
        .sort((a, b) => b.em.localeCompare(a.em));
    },
    listarRecente(limite: number) {
      return [...getStore().historico].sort((a, b) => b.em.localeCompare(a.em)).slice(0, limite);
    },
  };
}
