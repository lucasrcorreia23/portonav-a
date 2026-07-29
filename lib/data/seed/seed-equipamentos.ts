import type { Equipamento, ModeloChecklist, TipoEquipamento, TipoOperacao } from "@/lib/types";
import { resolverModeloChecklistPadrao } from "../checklist-logica";
import { criarIdSeed, type RNG } from "./rng";

interface EquipamentoSeedInput {
  tag: string;
  tipo: TipoEquipamento;
  tipoOperacao: TipoOperacao;
  modelo: string;
  localizacaoAtual: string;
}

const ROSTER: EquipamentoSeedInput[] = [
  { tag: "EMP-01", tipo: "empilhadeira", tipoOperacao: "carga_geral", modelo: "Toyota 8FD25", localizacaoAtual: "Pátio A — Fileira 1" },
  { tag: "EMP-02", tipo: "empilhadeira", tipoOperacao: "conteineres", modelo: "Hyster H2.5FT", localizacaoAtual: "Pátio A — Fileira 2" },
  { tag: "EMP-03", tipo: "empilhadeira", tipoOperacao: "carga_geral", modelo: "Toyota 8FD25", localizacaoAtual: "Pátio B — Fileira 1" },
  { tag: "EMP-04", tipo: "empilhadeira", tipoOperacao: "graneis", modelo: "Still RX 60", localizacaoAtual: "Pátio B — Fileira 3" },
  { tag: "RS-01", tipo: "reach_stacker", tipoOperacao: "conteineres", modelo: "Kalmar DRF450", localizacaoAtual: "Pátio C — Fileira 1" },
  { tag: "RS-02", tipo: "reach_stacker", tipoOperacao: "conteineres", modelo: "Kalmar DRF450", localizacaoAtual: "Pátio C — Fileira 2" },
  { tag: "TP-01", tipo: "transpaleteira", tipoOperacao: "armazem", modelo: "Still EGV 10", localizacaoAtual: "Galpão 1" },
  { tag: "TP-02", tipo: "transpaleteira", tipoOperacao: "armazem", modelo: "Still EGV 10", localizacaoAtual: "Galpão 2" },
];

export function gerarEquipamentos(
  agoraBaseMs: number,
  modelos: ModeloChecklist[],
  rng: RNG,
): Equipamento[] {
  const criadoEm = new Date(agoraBaseMs - 400 * 24 * 60 * 60 * 1000).toISOString();

  return ROSTER.map((entrada) => ({
    id: criarIdSeed(rng, "equip"),
    tag: entrada.tag,
    tipo: entrada.tipo,
    tipoOperacao: entrada.tipoOperacao,
    modelo: entrada.modelo,
    localizacaoAtual: entrada.localizacaoAtual,
    status: "disponivel",
    bloqueio: null,
    chamadoAtivoId: null,
    modeloChecklistIdPadrao: resolverModeloChecklistPadrao(entrada.tipo, entrada.tipoOperacao, modelos).id,
    criadoEm,
  }));
}
