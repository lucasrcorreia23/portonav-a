import { Check } from "lucide-react";

interface StepperProps {
  etapas: string[];
  etapaAtualIndice: number;
}

/** Linha de segmentos no topo do checklist — mostra a posição seção a seção. */
export function Stepper({ etapas, etapaAtualIndice }: StepperProps) {
  return (
    <ol className="flex w-full items-center gap-2" aria-label="Progresso do checklist">
      {etapas.map((etapa, indice) => {
        const concluida = indice < etapaAtualIndice;
        const atual = indice === etapaAtualIndice;
        return (
          <li key={etapa} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-pill text-sm font-medium ${
                concluida
                  ? "bg-status-disponivel text-white"
                  : atual
                    ? "bg-status-em-uso text-white"
                    : "bg-neutral-100 text-neutral-500"
              }`}
              aria-current={atual ? "step" : undefined}
            >
              {concluida ? <Check size={16} aria-hidden /> : indice + 1}
            </div>
            <span className="hidden text-center text-xs text-neutral-600 sm:block">{etapa}</span>
          </li>
        );
      })}
    </ol>
  );
}
