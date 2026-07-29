import type { TipoEquipamento, TipoOperacao } from "@/lib/types";

/** Fonte única do rótulo de tipo de equipamento — evita repetir o mesmo Record em cada tela. */
export const ROTULO_TIPO_EQUIPAMENTO: Record<TipoEquipamento, string> = {
  empilhadeira: "Empilhadeira",
  reach_stacker: "Reach stacker",
  transpaleteira: "Transpaleteira",
};

/** Fonte única do rótulo de tipo de operação (classificação operacional do equipamento). */
export const ROTULO_TIPO_OPERACAO: Record<TipoOperacao, string> = {
  carga_geral: "Carga geral",
  conteineres: "Contêineres",
  graneis: "Granéis",
  armazem: "Armazém",
};
