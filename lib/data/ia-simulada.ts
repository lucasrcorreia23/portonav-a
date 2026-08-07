import type { Apontamento, ItemChecklistDefinicao } from "@/lib/types";

/**
 * Simulador determinístico de "IA" — nenhuma chamada real a modelo de linguagem
 * (protótipo 100% client-side, sem backend). Mesmo espírito de ScanFakeCamera:
 * uma capacidade simulada, apresentada de forma direta na UI real, nunca uma
 * chamada de rede.
 */
/**
 * Duração encenada do "processamento" — puramente cenográfica, para a geração ter
 * o peso de uma operação real na UI. Não existe chamada de rede por trás.
 */
export const DURACAO_IA_SIMULADA_MS = 3000;

/** Roteiro exibido pelo loader enquanto a descrição de não-conformidade é gerada. */
export const ETAPAS_DESCRICAO = [
  "Lendo a imagem…",
  "Identificando o componente…",
  "Redigindo a não conformidade…",
] as const;

/** Roteiro exibido pelo loader enquanto a solução sugerida do chamado é gerada. */
export const ETAPAS_SOLUCAO = [
  "Lendo os apontamentos…",
  "Cruzando com o histórico do equipamento…",
  "Redigindo a solução sugerida…",
] as const;

interface CategoriaSimulada {
  padrao: RegExp;
  descricao: (titulo: string) => string;
  acao: (titulo: string) => string;
}

const CATEGORIAS: CategoriaSimulada[] = [
  {
    padrao: /buzina|alarme|sirene/i,
    descricao: (t) => `${t} não emite som ao ser acionado(a) — item crítico de segurança para alertar pessoas no entorno.`,
    acao: (t) => `Testar o acionamento elétrico de "${t}" e substituir o componente sonoro se necessário.`,
  },
  {
    padrao: /freio/i,
    descricao: (t) => `${t} não responde dentro do esperado — risco de perda de controle do equipamento em movimento.`,
    acao: (t) => `Inspecionar o sistema de frenagem ("${t}"), verificar pastilhas/fluido e testar a resposta antes de liberar.`,
  },
  {
    padrao: /faról|farol|lanterna|sinaliza/i,
    descricao: (t) => `${t} está apagado(a) ou com luminosidade insuficiente — compromete a visibilidade em operação.`,
    acao: (t) => `Substituir a lâmpada/módulo de "${t}" e testar o acendimento em ambas as posições.`,
  },
  {
    padrao: /espelho|câmera|camera|monitor/i,
    descricao: (t) => `${t} está com a imagem/reflexo comprometido(a) — reduz o campo de visão do operador.`,
    acao: (t) => `Ajustar ou substituir "${t}" e confirmar a qualidade da imagem/reflexo antes da liberação.`,
  },
  {
    padrao: /vazamento|óleo|oleo|hidráulic|hidraulic/i,
    descricao: (t) => `${t} identificado(a) — indício de perda de fluido que pode afetar sistemas críticos do equipamento.`,
    acao: (t) => `Localizar a origem de "${t}", conter o vazamento e completar/repor fluido conforme especificação.`,
  },
  {
    padrao: /pneu|rodízio|rodizio/i,
    descricao: (t) => `${t} com desgaste ou calibragem fora do esperado — afeta estabilidade e frenagem.`,
    acao: (t) => `Verificar calibragem e estado de "${t}"; substituir se o desgaste ultrapassar o limite de segurança.`,
  },
  {
    padrao: /cabo|corrente|garfo|talha|estrutura/i,
    descricao: (t) => `${t} apresenta desgaste ou dano visível — risco estrutural durante a movimentação de carga.`,
    acao: (t) => `Inspecionar "${t}" quanto a trincas/desgaste e interditar o uso até avaliação da manutenção.`,
  },
  {
    padrao: /extintor/i,
    descricao: (t) => `${t} com validade vencida ou lacre violado — equipamento de combate a incêndio indisponível.`,
    acao: (t) => `Substituir ou recarregar "${t}" e atualizar o lacre/etiqueta de validade.`,
  },
  {
    padrao: /spreader|trava|sensor/i,
    descricao: (t) => `${t} não trava/destrava corretamente — risco de queda de carga durante o içamento.`,
    acao: (t) => `Testar o acionamento de "${t}" e ajustar/substituir sensores ou travas defeituosas.`,
  },
  {
    padrao: /capacete|botina|óculos|oculos|colete|luva|protetor/i,
    descricao: (t) => `${t} ausente ou danificado(a) — item de EPI obrigatório para a operação segura.`,
    acao: (t) => `Providenciar a substituição imediata de "${t}" junto ao almoxarifado de EPI.`,
  },
  {
    padrao: /cinto/i,
    descricao: (t) => `${t} não trava ou está danificado(a) — item crítico de contenção do operador.`,
    acao: (t) => `Substituir o mecanismo/tecido de "${t}" antes de liberar o equipamento para uso.`,
  },
  {
    padrao: /direção|direcao/i,
    descricao: (t) => `${t} apresenta folga ou resposta fora do esperado — compromete a manobrabilidade do equipamento.`,
    acao: (t) => `Inspecionar o sistema de "${t}" e ajustar/reparar componentes com folga excessiva.`,
  },
];

function resolverCategoria(titulo: string): CategoriaSimulada | undefined {
  return CATEGORIAS.find((c) => c.padrao.test(titulo));
}

/** Gera uma descrição plausível de não-conformidade para um item reprovado no checklist. */
export function gerarDescricaoNaoConformidade(
  item: Pick<ItemChecklistDefinicao, "titulo" | "modoTratamento">,
  temFoto: boolean,
): string {
  const categoria = resolverCategoria(item.titulo);
  const corpo = categoria?.descricao(item.titulo) ?? `Item "${item.titulo}" não atende à condição esperada durante a inspeção de pré-operação.`;
  const prefixo = item.modoTratamento === "bloqueia" ? "Condição crítica de segurança: " : "Não conformidade identificada: ";
  const sufixo = temFoto ? " Evidência fotográfica anexada ao registro." : "";
  return `${prefixo}${corpo}${sufixo}`;
}

/** Gera uma sugestão de solução para o administrador, a partir dos apontamentos de um chamado. */
export function gerarSolucaoSugerida(apontamentos: Pick<Apontamento, "origem" | "criticidade">[]): string {
  if (apontamentos.length === 0) {
    return "Nenhum apontamento associado a este chamado.";
  }
  const cabecalho = apontamentos.some((a) => a.criticidade === "critica")
    ? "Prioridade alta — recomenda-se atendimento imediato antes de liberar o equipamento."
    : "Prioridade média — recomenda-se agendar atendimento; equipamento pode permanecer em uso até lá.";
  const linhas = apontamentos.map((a) => {
    const categoria = resolverCategoria(a.origem.itemTitulo);
    const acao = categoria?.acao(a.origem.itemTitulo) ?? `Encaminhar equipe de manutenção para diagnóstico detalhado de "${a.origem.itemTitulo}".`;
    return `- ${a.origem.itemTitulo}: ${acao}`;
  });
  return [cabecalho, "", ...linhas].join("\n");
}
