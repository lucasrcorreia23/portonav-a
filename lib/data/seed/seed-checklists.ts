import type { ItemChecklistDefinicao, ModeloChecklist, SecaoChecklist } from "@/lib/types";
import { criarIdSeed, type RNG } from "./rng";

function item(
  rng: RNG,
  ordemPadrao: number,
  titulo: string,
  opcoes: Partial<ItemChecklistDefinicao> = {},
): ItemChecklistDefinicao {
  return {
    id: criarIdSeed(rng, "item"),
    ordemPadrao,
    titulo,
    tipoResposta: "ok_nao_ok",
    modoTratamento: "alerta",
    exigeFotoAoReprovar: false,
    exigeObservacaoAoReprovar: false,
    ...opcoes,
  };
}

function secao(rng: RNG, titulo: string, itens: ItemChecklistDefinicao[]): SecaoChecklist {
  return { id: criarIdSeed(rng, "secao"), titulo, itens };
}

export function gerarModelosChecklist(agoraBaseMs: number, rng: RNG): ModeloChecklist[] {
  const criadoEm = new Date(agoraBaseMs - 200 * 24 * 60 * 60 * 1000).toISOString();

  const empilhadeira: ModeloChecklist = {
    id: criarIdSeed(rng, "modelo"),
    nome: "Pré-operação de empilhadeira",
    tipoEquipamentoAlvo: "empilhadeira",
    tipoOperacaoAlvo: "todas",
    versao: 3,
    ativo: true,
    criadoEm,
    atualizadoEm: criadoEm,
    secoes: [
      secao(rng, "Itens visuais", [
        item(rng, 1, "Buzina", {
          modoTratamento: "bloqueia",
          exigeFotoAoReprovar: true,
          exigeObservacaoAoReprovar: true,
          descricaoAjuda: "Acione a buzina e confirme se o som é audível.",
        }),
        item(rng, 2, "Faróis dianteiros", { descricaoAjuda: "Verifique acendimento dos dois faróis." }),
        item(rng, 3, "Lanternas traseiras e sinalização", {}),
        item(rng, 4, "Espelhos retrovisores", {}),
      ]),
      secao(rng, "Freios e direção", [
        item(rng, 5, "Freio de serviço", {
          modoTratamento: "bloqueia",
          exigeFotoAoReprovar: true,
          exigeObservacaoAoReprovar: true,
        }),
        item(rng, 6, "Freio de estacionamento", { modoTratamento: "bloqueia", exigeObservacaoAoReprovar: true }),
        item(rng, 7, "Direção — folga e resposta", {}),
        item(rng, 8, "Cinto de segurança", { modoTratamento: "bloqueia" }),
      ]),
      secao(rng, "Níveis e estrutura", [
        item(rng, 9, "Nível de óleo hidráulico", {
          tipoResposta: "numerico",
          unidade: "L",
          faixaEsperada: { min: 3, max: 6 },
          descricaoAjuda: "Verifique o visor de nível no reservatório.",
        }),
        item(rng, 10, "Vazamentos visíveis", { exigeFotoAoReprovar: true, exigeObservacaoAoReprovar: true }),
        item(rng, 11, "Garfos e talha — estado geral", { exigeObservacaoAoReprovar: true }),
        item(rng, 12, "Pneus / rodízios", {}),
        item(rng, 13, "Observações gerais", { tipoResposta: "texto", exigeObservacaoAoReprovar: false }),
      ]),
    ],
  };

  const epi: ModeloChecklist = {
    id: criarIdSeed(rng, "modelo"),
    nome: "EPI do operador",
    tipoEquipamentoAlvo: "todos",
    tipoOperacaoAlvo: "todas",
    versao: 2,
    ativo: true,
    criadoEm,
    atualizadoEm: criadoEm,
    secoes: [
      secao(rng, "Equipamento de proteção individual", [
        item(rng, 1, "Capacete de segurança", { modoTratamento: "bloqueia" }),
        item(rng, 2, "Botina com bico de segurança", { modoTratamento: "bloqueia" }),
        item(rng, 3, "Óculos de proteção", { modoTratamento: "bloqueia" }),
        item(rng, 4, "Colete refletivo", { modoTratamento: "bloqueia" }),
        item(rng, 5, "Luvas de proteção", { modoTratamento: "alerta", exigeObservacaoAoReprovar: true }),
        item(rng, 6, "Protetor auricular", { modoTratamento: "alerta" }),
      ]),
    ],
  };

  const reachStacker: ModeloChecklist = {
    id: criarIdSeed(rng, "modelo"),
    nome: "Inspeção de reach stacker",
    tipoEquipamentoAlvo: "reach_stacker",
    tipoOperacaoAlvo: "todas",
    versao: 4,
    ativo: true,
    criadoEm,
    atualizadoEm: criadoEm,
    secoes: [
      secao(rng, "Cabine e comandos", [
        item(rng, 1, "Buzina", { modoTratamento: "bloqueia", exigeFotoAoReprovar: true, exigeObservacaoAoReprovar: true }),
        item(rng, 2, "Alarme de ré", { modoTratamento: "bloqueia", exigeObservacaoAoReprovar: true }),
        item(rng, 3, "Câmeras e monitores", {}),
        item(rng, 4, "Espelhos retrovisores", {}),
        item(rng, 5, "Extintor de incêndio — validade e lacre", { modoTratamento: "bloqueia" }),
      ]),
      secao(rng, "Sistema de içamento", [
        item(rng, 6, "Spreader — travas e sensores", { modoTratamento: "bloqueia", exigeFotoAoReprovar: true }),
        item(rng, 7, "Cabos e correntes — desgaste visível", { exigeFotoAoReprovar: true, exigeObservacaoAoReprovar: true }),
        item(rng, 8, "Pressão hidráulica de içamento", {
          tipoResposta: "numerico",
          unidade: "bar",
          faixaEsperada: { min: 180, max: 250 },
        }),
      ]),
      secao(rng, "Freios, pneus e estrutura", [
        item(rng, 9, "Freio de serviço", { modoTratamento: "bloqueia", exigeObservacaoAoReprovar: true }),
        item(rng, 10, "Pneus — desgaste e calibragem", {}),
        item(rng, 11, "Vazamentos visíveis", { exigeFotoAoReprovar: true }),
        item(rng, 12, "Observações gerais", { tipoResposta: "texto" }),
      ]),
    ],
  };

  return [empilhadeira, epi, reachStacker];
}
