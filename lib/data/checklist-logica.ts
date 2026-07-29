import type {
  ItemChecklistDefinicao,
  ModeloChecklist,
  RespostaItemChecklist,
  StatusChecklistPreenchido,
  TipoEquipamento,
  TipoOperacao,
} from "@/lib/types";

export interface ItemPlano {
  item: ItemChecklistDefinicao;
  secaoId: string;
}

/** Achata as seções de um modelo em uma lista única de itens, na ordem canônica de cadastro. */
export function itensPlanos(modelo: ModeloChecklist): ItemPlano[] {
  return modelo.secoes.flatMap((secao) => secao.itens.map((item) => ({ item, secaoId: secao.id })));
}

/**
 * Regra central do produto: nenhuma reprovação => liberado; alguma reprovação em item
 * "bloqueia" => bloqueado; só reprovações em item "alerta" => liberado com apontamento.
 */
export function calcularResultadoChecklist(
  plano: ItemPlano[],
  respostas: RespostaItemChecklist[],
): StatusChecklistPreenchido {
  const reprovados = respostas.filter((r) => r.reprovado);
  if (reprovados.length === 0) return "liberado";
  const algumBloqueia = reprovados.some((r) => {
    const def = plano.find((p) => p.item.id === r.itemId)?.item;
    return def?.modoTratamento === "bloqueia";
  });
  return algumBloqueia ? "bloqueado" : "liberado_com_apontamento";
}

/**
 * Resolve o modelo de checklist padrão de um equipamento — precedência
 * tipo+operação > tipo (todas as operações) > universal ("todos" os tipos).
 * Usada tanto no seed quanto no cadastro de equipamento em runtime, para que as
 * duas origens de dados apliquem exatamente a mesma regra de negócio.
 */
export function resolverModeloChecklistPadrao(
  tipo: TipoEquipamento,
  tipoOperacao: TipoOperacao,
  modelos: ModeloChecklist[],
): ModeloChecklist {
  const exato = modelos.find((m) => m.tipoEquipamentoAlvo === tipo && m.tipoOperacaoAlvo === tipoOperacao);
  if (exato) return exato;
  const porTipo = modelos.find((m) => m.tipoEquipamentoAlvo === tipo && m.tipoOperacaoAlvo === "todas");
  if (porTipo) return porTipo;
  const universal = modelos.find((m) => m.tipoEquipamentoAlvo === "todos");
  if (!universal) throw new Error("Nenhum modelo de checklist universal encontrado.");
  return universal;
}
