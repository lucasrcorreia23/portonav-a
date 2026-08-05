"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { Stepper } from "@/components/ui/Stepper";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { ChecklistItemRow } from "@/components/checklist/ChecklistItemRow";
import { useDraftChecklist, type RespostaRascunho } from "../draft-context";
import type { ItemChecklistDefinicao } from "@/lib/types";

function formatarDecorrido(segundos: number): string {
  if (segundos < 60) return `${segundos}s`;
  return `${Math.floor(segundos / 60)}min ${String(segundos % 60).padStart(2, "0")}s`;
}

export default function SecaoChecklistPage(props: PageProps<"/equipamento/[tag]/checklist/[secaoOrdem]">) {
  const { secaoOrdem } = use(props.params);
  const { modelo, itensPorSecao, respostas, responder, confirmarSecao } = useDraftChecklist();

  const ordemNumerica = Number(secaoOrdem);
  const secao = modelo.secoes[ordemNumerica - 1];
  if (!secao || !Number.isInteger(ordemNumerica) || ordemNumerica < 1) {
    notFound();
  }

  const [inicioSecaoMs] = useState(() => Date.now());
  const [segundosDecorridos, setSegundosDecorridos] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => setSegundosDecorridos(Math.round((Date.now() - inicioSecaoMs) / 1000)), 1000);
    return () => clearInterval(intervalo);
  }, [inicioSecaoMs]);

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
    const duracaoSegundos = Math.max(1, Math.round((Date.now() - inicioSecaoMs) / 1000));
    confirmarSecao(ordemNumerica, secao.id, duracaoSegundos);
  }

  const ultimaSecao = ordemNumerica === modelo.secoes.length;
  const variasSecoes = modelo.secoes.length > 1;

  return (
    <div className="flex flex-col gap-5">
      {/* Com uma seção só, a trilha não informa nada — o título e a barra já dizem onde se está. */}
      {variasSecoes && <Stepper etapas={modelo.secoes.map((s) => s.titulo)} etapaAtualIndice={ordemNumerica - 1} />}

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          {/* Os rótulos do Stepper só aparecem a partir de sm — no celular do operador
              este título é a única indicação de qual seção está aberta. */}
          <h1 className="text-lg font-medium text-foreground">{secao.titulo}</h1>
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
        <p className="text-xs text-foreground-subtle">
          {variasSecoes && `Seção ${ordemNumerica} de ${modelo.secoes.length} · `}
          Itens em ordem aleatória · {formatarDecorrido(segundosDecorridos)} nesta seção
        </p>
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

      <Button tamanho="touch" larguraTotal disabled={!todosRespondidos} onClick={aoConfirmar}>
        {ultimaSecao ? "Concluir verificação" : "Confirmar seção"}
      </Button>
    </div>
  );
}
