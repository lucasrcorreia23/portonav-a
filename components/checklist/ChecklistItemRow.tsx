"use client";

import { AlertTriangle, Check, X } from "lucide-react";
import { PhotoCapture } from "@/components/checklist/PhotoCapture";
import { Textarea } from "@/components/ui/Textarea";
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
    <div className="rounded-card border border-neutral-100 bg-white p-4 shadow-card">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-neutral-900">{item.titulo}</p>
          {item.descricaoAjuda && <p className="mt-0.5 text-sm text-neutral-500">{item.descricaoAjuda}</p>}
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
                : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
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
                : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
            }`}
          >
            <X size={20} aria-hidden /> Não OK
          </button>
        </div>
      )}

      {item.tipoResposta === "numerico" && (
        <div className="flex items-center gap-2">
          <input
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
            className="h-12 w-32 rounded-control border border-neutral-300 px-3 text-base"
            aria-label={item.titulo}
          />
          {item.unidade && <span className="text-sm text-neutral-500">{item.unidade}</span>}
          {item.faixaEsperada && (
            <span className="text-xs text-neutral-400">
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

      {reprovado && (item.exigeObservacaoAoReprovar || item.exigeFotoAoReprovar) && (
        <div className="mt-3 flex flex-col gap-3 rounded-control bg-status-avariado-surface p-3">
          {item.exigeObservacaoAoReprovar && (
            <Textarea
              rotulo="Observação (obrigatória)"
              required
              value={resposta?.observacao ?? ""}
              onChange={(e) => onMudar({ ...resposta!, observacao: e.target.value })}
              erro={faltaObservacao ? "Descreva o problema encontrado." : undefined}
            />
          )}
          {item.exigeFotoAoReprovar && (
            <div>
              <p className="mb-1.5 text-sm font-medium text-neutral-800">Foto (obrigatória)</p>
              <PhotoCapture
                valor={resposta?.fotoEvidencia}
                onCapturar={(foto) => onMudar({ ...resposta!, fotoEvidencia: foto })}
                onRemover={() => onMudar({ ...resposta!, fotoEvidencia: undefined })}
              />
              {faltaFoto && (
                <p className="mt-1.5 inline-flex items-center gap-1 text-sm text-status-avariado">
                  <AlertTriangle size={14} aria-hidden /> Anexe uma foto do problema.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
