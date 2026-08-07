"use client";

import { useState } from "react";
import { AlertTriangle, Check, Sparkles, X } from "lucide-react";
import { PhotoCapture, PhotoThumbnail } from "@/components/checklist/PhotoCapture";
import { CampoGerandoIA } from "@/components/ia/CampoGerandoIA";
import { IaVeuFoto } from "@/components/ia/IaVeu";
import { useGeracaoIA } from "@/components/ia/useGeracaoIA";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ETAPAS_DESCRICAO, gerarDescricaoNaoConformidade } from "@/lib/data/ia-simulada";
import type { ItemChecklistDefinicao } from "@/lib/types";
import type { RespostaRascunho } from "@/app/equipamento/[tag]/checklist/draft-context";

interface ChecklistItemRowProps {
  item: ItemChecklistDefinicao;
  resposta: RespostaRascunho | undefined;
  onMudar: (resposta: RespostaRascunho) => void;
}

export function ChecklistItemRow({ item, resposta, onMudar }: ChecklistItemRowProps) {
  const reprovado = resposta?.reprovado ?? false;
  const okSelecionado = resposta?.valor === "ok";
  const naoOkSelecionado = resposta?.valor === "nao_ok";
  const foto = resposta?.fotoEvidencia;

  // Erros só depois de interação — não ao marcar Não OK.
  const [tocouFoto, setTocouFoto] = useState(false);
  const [tocouObservacao, setTocouObservacao] = useState(false);

  const { gerando, revelando, etapaAtual, gerar } = useGeracaoIA(ETAPAS_DESCRICAO);

  const faltaObservacao = reprovado && item.exigeObservacaoAoReprovar && !resposta?.observacao?.trim();
  const faltaFoto = reprovado && item.exigeFotoAoReprovar && !foto;
  const mostrarErroFoto = tocouFoto && faltaFoto;
  const mostrarErroObservacao = tocouObservacao && faltaObservacao;

  const textoInstrucao =
    item.exigeFotoAoReprovar && item.exigeObservacaoAoReprovar
      ? "Anexe uma foto e descreva o problema encontrado."
      : item.exigeFotoAoReprovar
        ? "Anexe uma foto do problema encontrado."
        : item.exigeObservacaoAoReprovar
          ? "Descreva o problema encontrado. A foto ajuda a manutenção."
          : "Anexe uma foto e/ou descreva o problema encontrado.";

  function aoEscolherOk() {
    setTocouFoto(false);
    setTocouObservacao(false);
    onMudar({ valor: "ok", reprovado: false });
  }

  function aoEscolherNaoOk() {
    setTocouFoto(false);
    setTocouObservacao(false);
    onMudar({ valor: "nao_ok", reprovado: true });
  }

  return (
    <div className="rounded-card border-[0.8px] border-border bg-surface p-4 shadow-card-operador">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-foreground">{item.titulo}</p>
          {item.descricaoAjuda && <p className="mt-0.5 text-sm text-foreground-subtle">{item.descricaoAjuda}</p>}
        </div>
        {item.modoTratamento === "bloqueia" && (
          <span className="shrink-0 rounded-pill bg-status-avariado-surface px-2.5 py-0.5 text-xs font-medium text-status-avariado">
            Crítico
          </span>
        )}
      </div>

      {item.tipoResposta === "ok_nao_ok" && (
        // Em repouso os dois botões são neutros (Figma node 4171:5697/5730): a cor de status
        // só entra na resposta escolhida, junto de ícone e texto — nunca cor sozinha.
        <div className="flex items-stretch gap-3">
          <button
            type="button"
            onClick={aoEscolherOk}
            aria-pressed={okSelecionado}
            className={`flex h-14 min-w-px flex-1 items-center justify-center gap-2 rounded-control border-[1.6px] text-base transition-colors outline-none focus-visible:outline-none ${
              okSelecionado
                ? "border-transparent bg-status-disponivel-surface text-status-disponivel"
                : "border-border bg-background text-foreground-muted"
            }`}
          >
            <Check size={20} aria-hidden /> OK
          </button>
          <button
            type="button"
            onClick={aoEscolherNaoOk}
            aria-pressed={naoOkSelecionado}
            className={`flex h-14 min-w-px flex-1 items-center justify-center gap-2 rounded-control border-[1.6px] text-base transition-colors outline-none focus-visible:outline-none ${
              naoOkSelecionado
                ? "border-transparent bg-status-avariado-surface text-status-avariado"
                : "border-border bg-background text-foreground-muted"
            }`}
          >
            <X size={20} aria-hidden /> Com falha
          </button>
        </div>
      )}

      {item.tipoResposta === "numerico" && (
        <div className="flex items-center gap-2">
          <div className="w-32">
            <Input
              type="number"
              inputMode="decimal"
              value={typeof resposta?.valor === "number" ? resposta.valor : ""}
              onChange={(e) => {
                const numero = Number(e.target.value);
                const foraDaFaixa = item.faixaEsperada
                  ? numero < item.faixaEsperada.min || numero > item.faixaEsperada.max
                  : false;
                onMudar({ valor: numero, reprovado: foraDaFaixa });
              }}
              aria-label={item.titulo}
            />
          </div>
          {item.unidade && <span className="text-sm text-foreground-subtle">{item.unidade}</span>}
          {item.faixaEsperada && (
            <span className="text-xs text-foreground-subtle">
              (esperado: {item.faixaEsperada.min}–{item.faixaEsperada.max})
            </span>
          )}
        </div>
      )}

      {item.tipoResposta === "texto" && (
        <Textarea
          rotulo="Observação"
          value={typeof resposta?.valor === "string" ? resposta.valor : ""}
          onChange={(e) => onMudar({ valor: e.target.value, reprovado: false })}
        />
      )}

      {/* Todo item reprovado oferece foto + observação — obrigatórias só quando o modelo exige.
          Ordem do print: miniatura → Gerar IA → Tirar foto → Observação.
          Sem foto ainda: Tirar foto sobe para antes da IA. */}
      {reprovado && (
        <div className="mt-4 flex flex-col gap-3">
          <p className="text-sm text-foreground">{textoInstrucao}</p>

          {foto && (
            <PhotoThumbnail
              valor={foto}
              travada={gerando}
              sobreposicao={gerando ? <IaVeuFoto /> : null}
              onRemover={() => {
                setTocouFoto(true);
                onMudar({ ...resposta!, fotoEvidencia: undefined });
              }}
            />
          )}

          {!foto && (
            <div>
              <PhotoCapture onCapturar={(nova) => onMudar({ ...resposta!, fotoEvidencia: nova })} />
              {mostrarErroFoto && (
                <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-error" role="alert">
                  <AlertTriangle size={13} aria-hidden /> Anexe uma foto do problema.
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Button
              variante="ia"
              tamanho="md"
              larguraTotal
              iconeEsquerda={<Sparkles size={16} aria-hidden />}
              disabled={!foto}
              carregando={gerando}
              onClick={() =>
                gerar(
                  () => gerarDescricaoNaoConformidade(item, true),
                  (texto) => onMudar({ ...resposta!, observacao: texto, descricaoGeradaPorIA: true }),
                )
              }
            >
              {gerando ? "Pensando…" : "Gerar descrição"}
            </Button>
            {!foto && !gerando && (
              <p className="text-xs text-foreground-subtle">Anexe uma foto para a IA analisar e descrever o problema.</p>
            )}
          </div>

          {foto && (
            <PhotoCapture
              desabilitado={gerando}
              onCapturar={(nova) => onMudar({ ...resposta!, fotoEvidencia: nova })}
            />
          )}

          {gerando ? (
            <CampoGerandoIA rotulo="Observação" etapa={ETAPAS_DESCRICAO[etapaAtual]} />
          ) : (
            <Textarea
              rotulo="Observação"
              required={item.exigeObservacaoAoReprovar}
              className={revelando ? "ia-revelar" : ""}
              value={resposta?.observacao ?? ""}
              onChange={(e) => onMudar({ ...resposta!, observacao: e.target.value, descricaoGeradaPorIA: false })}
              onBlur={() => {
                setTocouObservacao(true);
                if (item.exigeFotoAoReprovar && !foto) setTocouFoto(true);
              }}
              erro={mostrarErroObservacao ? "Descreva o problema encontrado." : undefined}
            />
          )}
        </div>
      )}
    </div>
  );
}
