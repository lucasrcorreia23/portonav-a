import type { ChecklistPreenchido, Id, ISODateString, ModeloChecklist } from "@/lib/types";

export interface FalhaRecorrente {
  equipamentoId: Id;
  itemId: Id;
  itemTitulo: string;
  ocorrencias: number;
  ultimaOcorrenciaEm: ISODateString;
}

/**
 * Reincidência = o mesmo item de checklist reprovado 2+ vezes no mesmo equipamento ao
 * longo do histórico — é o que a raia A3 chama de "indicadores de falha recorrente".
 * Agregação por equipamento×item (não só por tipo de equipamento ou por item isolado),
 * para que o efeito apareça tanto no relatório do supervisor quanto na ficha do equipamento.
 */
export function calcularFalhasRecorrentes(
  checklists: ChecklistPreenchido[],
  modelos: ModeloChecklist[],
): FalhaRecorrente[] {
  const contagem = new Map<string, FalhaRecorrente>();

  for (const checklist of checklists) {
    const modelo = modelos.find((m) => m.id === checklist.modeloChecklistId);
    const itensDoModelo = modelo?.secoes.flatMap((s) => s.itens) ?? [];

    for (const resposta of checklist.respostas) {
      if (!resposta.reprovado) continue;
      const chave = `${checklist.equipamentoId}::${resposta.itemId}`;
      const existente = contagem.get(chave);
      if (existente) {
        existente.ocorrencias += 1;
        if (checklist.concluidoEm > existente.ultimaOcorrenciaEm) {
          existente.ultimaOcorrenciaEm = checklist.concluidoEm;
        }
      } else {
        contagem.set(chave, {
          equipamentoId: checklist.equipamentoId,
          itemId: resposta.itemId,
          itemTitulo: itensDoModelo.find((i) => i.id === resposta.itemId)?.titulo ?? "Item removido",
          ocorrencias: 1,
          ultimaOcorrenciaEm: checklist.concluidoEm,
        });
      }
    }
  }

  return [...contagem.values()]
    .filter((f) => f.ocorrencias >= 2)
    .sort((a, b) => b.ocorrencias - a.ocorrencias || b.ultimaOcorrenciaEm.localeCompare(a.ultimaOcorrenciaEm));
}
