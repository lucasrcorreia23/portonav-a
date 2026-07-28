import type { Equipamento, ModeloChecklist, TipoEquipamento } from "@/lib/types";
import { criarIdSeed, type RNG } from "./rng";

interface EquipamentoSeedInput {
  tag: string;
  tipo: TipoEquipamento;
  categoria: string;
  modelo: string;
  localizacaoAtual: string;
}

const ROSTER: EquipamentoSeedInput[] = [
  { tag: "EMP-01", tipo: "empilhadeira", categoria: "Carga geral", modelo: "Toyota 8FD25", localizacaoAtual: "Pátio A — Fileira 1" },
  { tag: "EMP-02", tipo: "empilhadeira", categoria: "Contêineres", modelo: "Hyster H2.5FT", localizacaoAtual: "Pátio A — Fileira 2" },
  { tag: "EMP-03", tipo: "empilhadeira", categoria: "Carga geral", modelo: "Toyota 8FD25", localizacaoAtual: "Pátio B — Fileira 1" },
  { tag: "EMP-04", tipo: "empilhadeira", categoria: "Granéis", modelo: "Still RX 60", localizacaoAtual: "Pátio B — Fileira 3" },
  { tag: "RS-01", tipo: "reach_stacker", categoria: "Contêineres", modelo: "Kalmar DRF450", localizacaoAtual: "Pátio C — Fileira 1" },
  { tag: "RS-02", tipo: "reach_stacker", categoria: "Contêineres", modelo: "Kalmar DRF450", localizacaoAtual: "Pátio C — Fileira 2" },
  { tag: "TP-01", tipo: "transpaleteira", categoria: "Armazém", modelo: "Still EGV 10", localizacaoAtual: "Galpão 1" },
  { tag: "TP-02", tipo: "transpaleteira", categoria: "Armazém", modelo: "Still EGV 10", localizacaoAtual: "Galpão 2" },
];

export function gerarEquipamentos(
  agoraBaseMs: number,
  modelos: ModeloChecklist[],
  rng: RNG,
): Equipamento[] {
  const modeloPorTipo = (tipo: TipoEquipamento): string => {
    const especifico = modelos.find((m) => m.tipoEquipamentoAlvo === tipo);
    if (especifico) return especifico.id;
    const universal = modelos.find((m) => m.tipoEquipamentoAlvo === "todos");
    if (!universal) throw new Error("Nenhum modelo de checklist universal encontrado no seed");
    return universal.id;
  };

  const criadoEm = new Date(agoraBaseMs - 400 * 24 * 60 * 60 * 1000).toISOString();

  return ROSTER.map((entrada) => ({
    id: criarIdSeed(rng, "equip"),
    tag: entrada.tag,
    tipo: entrada.tipo,
    categoria: entrada.categoria,
    modelo: entrada.modelo,
    localizacaoAtual: entrada.localizacaoAtual,
    status: "disponivel",
    bloqueio: null,
    chamadoAtivoId: null,
    modeloChecklistIdPadrao: modeloPorTipo(entrada.tipo),
    criadoEm,
  }));
}
