import type { ItemChecklistDefinicao, ModeloChecklist, SecaoChecklist } from "@/lib/types";
import { criarId } from "../id";

function item(
  ordemPadrao: number,
  titulo: string,
  opcoes: Partial<ItemChecklistDefinicao> = {},
): ItemChecklistDefinicao {
  return {
    id: criarId("item"),
    ordemPadrao,
    titulo,
    tipoResposta: "ok_nao_ok",
    modoTratamento: "alerta",
    exigeFotoAoReprovar: false,
    exigeObservacaoAoReprovar: false,
    ...opcoes,
  };
}

function secao(titulo: string, itens: ItemChecklistDefinicao[]): SecaoChecklist {
  return { id: criarId("secao"), titulo, itens };
}

export function gerarModelosChecklist(agoraBaseMs: number): ModeloChecklist[] {
  const criadoEm = new Date(agoraBaseMs - 200 * 24 * 60 * 60 * 1000).toISOString();

  const empilhadeira: ModeloChecklist = {
    id: criarId("modelo"),
    nome: "Pré-operação de empilhadeira",
    tipoEquipamentoAlvo: "empilhadeira",
    versao: 3,
    ativo: true,
    criadoEm,
    atualizadoEm: criadoEm,
    secoes: [
      secao("Itens visuais", [
        item(1, "Buzina", {
          modoTratamento: "bloqueia",
          exigeFotoAoReprovar: true,
          exigeObservacaoAoReprovar: true,
          descricaoAjuda: "Acione a buzina e confirme se o som é audível.",
        }),
        item(2, "Faróis dianteiros", { descricaoAjuda: "Verifique acendimento dos dois faróis." }),
        item(3, "Lanternas traseiras e sinalização", {}),
        item(4, "Espelhos retrovisores", {}),
      ]),
      secao("Freios e direção", [
        item(5, "Freio de serviço", {
          modoTratamento: "bloqueia",
          exigeFotoAoReprovar: true,
          exigeObservacaoAoReprovar: true,
        }),
        item(6, "Freio de estacionamento", { modoTratamento: "bloqueia", exigeObservacaoAoReprovar: true }),
        item(7, "Direção — folga e resposta", {}),
        item(8, "Cinto de segurança", { modoTratamento: "bloqueia" }),
      ]),
      secao("Níveis e estrutura", [
        item(9, "Nível de óleo hidráulico", {
          tipoResposta: "numerico",
          unidade: "L",
          faixaEsperada: { min: 3, max: 6 },
          descricaoAjuda: "Verifique o visor de nível no reservatório.",
        }),
        item(10, "Vazamentos visíveis", { exigeFotoAoReprovar: true, exigeObservacaoAoReprovar: true }),
        item(11, "Garfos e talha — estado geral", { exigeObservacaoAoReprovar: true }),
        item(12, "Pneus / rodízios", {}),
        item(13, "Observações gerais", { tipoResposta: "texto", exigeObservacaoAoReprovar: false }),
      ]),
    ],
  };

  const epi: ModeloChecklist = {
    id: criarId("modelo"),
    nome: "EPI do operador",
    tipoEquipamentoAlvo: "todos",
    versao: 2,
    ativo: true,
    criadoEm,
    atualizadoEm: criadoEm,
    secoes: [
      secao("Equipamento de proteção individual", [
        item(1, "Capacete de segurança", { modoTratamento: "bloqueia" }),
        item(2, "Botina com bico de segurança", { modoTratamento: "bloqueia" }),
        item(3, "Óculos de proteção", { modoTratamento: "bloqueia" }),
        item(4, "Colete refletivo", { modoTratamento: "bloqueia" }),
        item(5, "Luvas de proteção", { modoTratamento: "alerta", exigeObservacaoAoReprovar: true }),
        item(6, "Protetor auricular", { modoTratamento: "alerta" }),
      ]),
    ],
  };

  const reachStacker: ModeloChecklist = {
    id: criarId("modelo"),
    nome: "Inspeção de reach stacker",
    tipoEquipamentoAlvo: "reach_stacker",
    versao: 4,
    ativo: true,
    criadoEm,
    atualizadoEm: criadoEm,
    secoes: [
      secao("Cabine e comandos", [
        item(1, "Buzina", { modoTratamento: "bloqueia", exigeFotoAoReprovar: true, exigeObservacaoAoReprovar: true }),
        item(2, "Alarme de ré", { modoTratamento: "bloqueia", exigeObservacaoAoReprovar: true }),
        item(3, "Câmeras e monitores", {}),
        item(4, "Espelhos retrovisores", {}),
        item(5, "Extintor de incêndio — validade e lacre", { modoTratamento: "bloqueia" }),
      ]),
      secao("Sistema de içamento", [
        item(6, "Spreader — travas e sensores", { modoTratamento: "bloqueia", exigeFotoAoReprovar: true }),
        item(7, "Cabos e correntes — desgaste visível", { exigeFotoAoReprovar: true, exigeObservacaoAoReprovar: true }),
        item(8, "Pressão hidráulica de içamento", {
          tipoResposta: "numerico",
          unidade: "bar",
          faixaEsperada: { min: 180, max: 250 },
        }),
      ]),
      secao("Freios, pneus e estrutura", [
        item(9, "Freio de serviço", { modoTratamento: "bloqueia", exigeObservacaoAoReprovar: true }),
        item(10, "Pneus — desgaste e calibragem", {}),
        item(11, "Vazamentos visíveis", { exigeFotoAoReprovar: true }),
        item(12, "Observações gerais", { tipoResposta: "texto" }),
      ]),
    ],
  };

  return [empilhadeira, epi, reachStacker];
}
