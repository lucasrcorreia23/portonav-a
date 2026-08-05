"use client";

import { AlertTriangle, Check, Sparkles, X } from "lucide-react";
import { PhotoCapture } from "@/components/checklist/PhotoCapture";
import { BadgeIA } from "@/components/ia/BadgeIA";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { gerarDescricaoNaoConformidade } from "@/lib/data/ia-simulada";
import type { ItemChecklistDefinicao } from "@/lib/types";
import type { RespostaRascunho } from "@/app/equipamento/[tag]/checklist/draft-context";

interface ChecklistItemRowProps {
  item: ItemChecklistDefinicao;
  resposta: RespostaRascunho | undefined;
  onMudar: (resposta: RespostaRascunho) => void;
}

export function ChecklistItemRow({ item, resposta, onMudar }: ChecklistItemRowProps) {
  const reprovado = resposta?.reprovado ?? false;
  const faltaObservacao = reprovado && item.exigeObservacaoAoReprovar && !resposta?.observacao?.trim();
  const faltaFoto = reprovado && item.exigeFotoAoReprovar && !resposta?.fotoEvidencia;

  return (
    <div className="rounded-card border border-border bg-surface p-4 shadow-card">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-foreground">{item.titulo}</p>
          {item.descricaoAjuda && <p className="mt-0.5 text-sm text-foreground-subtle">{item.descricaoAjuda}</p>}
        </div>
        {item.modoTratamento === "bloqueia" && (
          <span className="shrink-0 rounded-pill bg-status-avariado-surface px-2 py-0.5 text-xs font-medium text-status-avariado">
            Crítico
          </span>
        )}
      </div>

      {item.tipoResposta === "ok_nao_ok" && (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onMudar({ valor: "ok", reprovado: false })}
            aria-pressed={resposta?.valor === "ok"}
            className={`flex h-14 items-center justify-center gap-2 rounded-control border-2 text-base font-medium transition-colors ${
              resposta?.valor === "ok"
                ? "border-status-disponivel bg-status-disponivel-surface text-status-disponivel"
                : "border-border text-foreground-muted hover:border-foreground-subtle"
            }`}
          >
            <Check size={20} aria-hidden /> OK
          </button>
          <button
            type="button"
            onClick={() => onMudar({ valor: "nao_ok", reprovado: true })}
            aria-pressed={resposta?.valor === "nao_ok"}
            className={`flex h-14 items-center justify-center gap-2 rounded-control border-2 text-base font-medium transition-colors ${
              resposta?.valor === "nao_ok"
                ? "border-status-avariado bg-status-avariado-surface text-status-avariado"
                : "border-border text-foreground-muted hover:border-foreground-subtle"
            }`}
          >
            <X size={20} aria-hidden /> Não OK
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

      {/* rounded-card, não rounded-control: --radius-control é pill (9999px), token de
          botão/campo — num bloco alto ele vira uma elipse gigante em vez de um painel. */}
      {reprovado && (item.exigeObservacaoAoReprovar || item.exigeFotoAoReprovar) && (
        <div className="mt-3 flex flex-col gap-3 rounded-card border border-status-avariado/20 bg-status-avariado-surface p-3">
          {item.exigeFotoAoReprovar && (
            <div>
              {/* Mesma tipografia do rótulo de Input/Textarea — foto e observação são dois
                  campos do mesmo bloco e precisam ler como irmãos. */}
              <p className="mb-1.5 text-xs font-semibold text-foreground-muted">
                Foto <span aria-hidden="true">*</span>
              </p>
              <PhotoCapture
                valor={resposta?.fotoEvidencia}
                onCapturar={(foto) => onMudar({ ...resposta!, fotoEvidencia: foto })}
                onRemover={() => onMudar({ ...resposta!, fotoEvidencia: undefined })}
              />
              {faltaFoto && (
                <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-error" role="alert">
                  <AlertTriangle size={13} aria-hidden /> Anexe uma foto do problema.
                </p>
              )}
            </div>
          )}
          {item.exigeObservacaoAoReprovar && (
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variante="ia"
                  tamanho="sm"
                  iconeEsquerda={<Sparkles size={14} aria-hidden />}
                  disabled={item.exigeFotoAoReprovar && !resposta?.fotoEvidencia}
                  onClick={() =>
                    onMudar({
                      ...resposta!,
                      observacao: gerarDescricaoNaoConformidade(item, Boolean(resposta?.fotoEvidencia)),
                      descricaoGeradaPorIA: true,
                    })
                  }
                >
                  Gerar descrição com IA
                </Button>
                {resposta?.descricaoGeradaPorIA && <BadgeIA />}
              </div>
              {/* Sem repetir "anexe uma foto" aqui: quando o botão de IA está desabilitado por
                  falta de foto, o erro do campo de foto logo acima já está na tela. */}
              <Textarea
                rotulo="Observação"
                required
                value={resposta?.observacao ?? ""}
                onChange={(e) => onMudar({ ...resposta!, observacao: e.target.value, descricaoGeradaPorIA: false })}
                erro={faltaObservacao ? "Descreva o problema encontrado." : undefined}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
