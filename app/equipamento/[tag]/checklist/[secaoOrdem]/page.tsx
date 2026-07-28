"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { Stepper } from "@/components/ui/Stepper";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { ChecklistItemRow } from "@/components/checklist/ChecklistItemRow";
import { useDraftChecklist, type RespostaRascunho } from "../draft-context";

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

  const todosRespondidos = itensDaSecao.every((item) => {
    const r = respostas[item.id];
    if (!r) return false;
    if (r.reprovado && item.exigeObservacaoAoReprovar && !r.observacao?.trim()) return false;
    if (r.reprovado && item.exigeFotoAoReprovar && !r.fotoEvidencia) return false;
    return true;
  });

  function aoConfirmar() {
    const duracaoSegundos = Math.max(1, Math.round((Date.now() - inicioSecaoMs) / 1000));
    confirmarSecao(ordemNumerica, secao.id, duracaoSegundos);
  }

  const ultimaSecao = ordemNumerica === modelo.secoes.length;

  return (
    <div className="flex flex-col gap-5">
      <Stepper etapas={modelo.secoes.map((s) => s.titulo)} etapaAtualIndice={ordemNumerica - 1} />
      <ProgressBar
        valorAtual={ordemNumerica}
        valorMaximo={modelo.secoes.length}
        rotulo={`Seção ${ordemNumerica} de ${modelo.secoes.length} — ${secao.titulo}`}
      />
      <p className="-mt-3 text-xs text-neutral-400">
        Itens em ordem aleatória para esta verificação · {segundosDecorridos}s nesta seção
      </p>

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

      <Button tamanho="lg" larguraTotal disabled={!todosRespondidos} onClick={aoConfirmar}>
        {ultimaSecao ? "Concluir verificação" : "Confirmar seção"}
      </Button>
    </div>
  );
}
