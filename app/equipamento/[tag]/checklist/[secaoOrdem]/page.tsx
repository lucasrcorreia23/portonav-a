"use client";

import { use, useEffect, useRef } from "react";
import { notFound, useRouter } from "next/navigation";
import { Stepper } from "@/components/ui/Stepper";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { ChecklistItemRow } from "@/components/checklist/ChecklistItemRow";
import { ROTULO_TIPO_EQUIPAMENTO } from "@/components/equipamento/rotulos";
import { useDraftChecklist, type RespostaRascunho } from "../draft-context";
import type { ItemChecklistDefinicao } from "@/lib/types";

export default function SecaoChecklistPage(props: PageProps<"/equipamento/[tag]/checklist/[secaoOrdem]">) {
  const { secaoOrdem } = use(props.params);
  const router = useRouter();
  const { equipamento, modelo, itensPorSecao, respostas, responder, confirmarSecao } = useDraftChecklist();

  const ordemNumerica = Number(secaoOrdem);
  const secao = modelo.secoes[ordemNumerica - 1];
  if (!secao || !Number.isInteger(ordemNumerica) || ordemNumerica < 1) {
    notFound();
  }

  // Marca o início da seção para a duração enviada em `aoConfirmar` (insumo da checagem
  // de suspeita do supervisor). Reancorado por seção dentro do efeito: navegar 1 → 2 reusa
  // a mesma instância do componente (mesmo segmento de rota), então um `useState` de mount
  // faria a seção 2 herdar o relógio da seção 1 e inflar a duração registrada.
  const inicioSecaoRef = useRef(0);
  useEffect(() => {
    inicioSecaoRef.current = Date.now();
  }, [ordemNumerica]);

  const itensDaSecao = itensPorSecao[secao.id].map((itemId) => secao.itens.find((i) => i.id === itemId)!);

  function estaRespondido(item: ItemChecklistDefinicao) {
    // Texto livre é sempre opcional — não há "pular sem olhar" a se prevenir aqui.
    if (item.tipoResposta === "texto") return true;
    const r = respostas[item.id];
    if (!r) return false;
    if (r.reprovado && item.exigeObservacaoAoReprovar && !r.observacao?.trim()) return false;
    if (r.reprovado && item.exigeFotoAoReprovar && !r.fotoEvidencia) return false;
    return true;
  }

  const respondidos = itensDaSecao.filter(estaRespondido).length;
  const todosRespondidos = respondidos === itensDaSecao.length;

  function aoConfirmar() {
    // O efeito de ancoragem sempre roda antes de qualquer clique; o fallback só evita
    // uma duração absurda caso a ref ainda esteja zerada.
    const inicio = inicioSecaoRef.current || Date.now();
    const duracaoSegundos = Math.max(1, Math.round((Date.now() - inicio) / 1000));
    confirmarSecao(ordemNumerica, secao.id, duracaoSegundos);
  }

  const ultimaSecao = ordemNumerica === modelo.secoes.length;
  const variasSecoes = modelo.secoes.length > 1;

  return (
    <div className="flex flex-col gap-5">
      {/* Contexto do equipamento — Figma node 4167:5596: linha centrada e discreta, sem
          pílula. Ela nomeia o que está sendo verificado, não compete com os itens. */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm text-foreground-subtle">
        <p>
          <span className="font-semibold">Equipamento:</span> {ROTULO_TIPO_EQUIPAMENTO[equipamento.tipo]}
        </p>
        <p>
          <span className="font-bold">Código:</span> {equipamento.tag}
        </p>
      </div>

      {/* Com uma seção só, a trilha não informa nada — o título e a barra já dizem onde se está.
          px-4 reproduz o recuo da trilha dentro da coluna (Figma node 4119:4089). */}
      {variasSecoes && (
        <div className="px-4">
          <Stepper etapas={modelo.secoes.map((s) => s.titulo)} etapaAtualIndice={ordemNumerica - 1} />
        </div>
      )}

      {/* Título e progresso acompanham a rolagem: em seções longas o operador perde de vista
          o que está verificando e quanto falta. As margens negativas devolvem a largura total
          da coluna do OperatorShell — sem elas os itens apareceriam por trás, pelas laterais,
          ao passar sob o bloco fixo. */}
      <div className="sticky top-0 z-[var(--z-sticky)] -mx-4 flex flex-col gap-2 bg-background px-4 pb-3 pt-2 sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          {/* A trilha não tem rótulo visível (Figma) — este título é a única indicação
              de qual seção está aberta. */}
          <h1 className="text-lg text-foreground">{secao.titulo}</h1>
          <span className="shrink-0 text-sm tabular-nums text-foreground-subtle">
            {respondidos}/{itensDaSecao.length}
          </span>
        </div>
        {/* A barra acompanha os itens respondidos, não a seção: em um modelo de seção única
            "seção 1 de 1" nasceria 100% cheia, sem nenhum item preenchido. */}
        <ProgressBar
          valorAtual={respondidos}
          valorMaximo={itensDaSecao.length}
          rotuloAcessivel={`${respondidos} de ${itensDaSecao.length} itens respondidos nesta seção`}
        />
      </div>

      <div className="flex flex-col gap-3">
        {itensDaSecao.map((item) => (
          <ChecklistItemRow
            key={item.id}
            item={item}
            resposta={respostas[item.id]}
            onMudar={(resposta: RespostaRascunho) => responder(item.id, resposta)}
          />
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Button tamanho="touch" larguraTotal disabled={!todosRespondidos} onClick={aoConfirmar}>
          {ultimaSecao ? "Finalizar verificação" : "Confirmar verificação"}
        </Button>
        {/* O escape do rodapé (Figma node 4171:6112). Na primeira seção não há seção anterior,
            então ele abandona a verificação e devolve o operador à ficha do equipamento —
            sem isso, corrigir um item de uma seção anterior exigia reiniciar a verificação.
            O rascunho vive no layout, então as respostas sobrevivem à navegação. */}
        <Button
          variante="ghost"
          tamanho="touch"
          larguraTotal
          onClick={() =>
            router.push(
              ordemNumerica > 1
                ? `/equipamento/${equipamento.tag}/checklist/${ordemNumerica - 1}`
                : `/equipamento/${equipamento.tag}`,
            )
          }
        >
          {ordemNumerica > 1 ? "Voltar para a seção anterior" : "Cancelar"}
        </Button>
      </div>
    </div>
  );
}
