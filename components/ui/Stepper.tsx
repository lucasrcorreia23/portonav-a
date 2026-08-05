import { Fragment } from "react";

interface StepperProps {
  etapas: string[];
  etapaAtualIndice: number;
}

/** Linha de segmentos no topo do checklist — mostra a posição seção a seção. */
export function Stepper({ etapas, etapaAtualIndice }: StepperProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <ol className="flex w-full items-center" aria-label="Progresso do checklist">
        {etapas.map((etapa, indice) => {
          const concluida = indice < etapaAtualIndice;
          const atual = indice === etapaAtualIndice;
          return (
            <Fragment key={etapa}>
              {indice > 0 && (
                <div className={`h-px flex-1 transition-colors ${indice <= etapaAtualIndice ? "bg-foreground" : "bg-border"}`} />
              )}
              <li className="flex flex-col items-center gap-1.5">
                <span
                  aria-current={atual ? "step" : undefined}
                  aria-label={etapa}
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors ${
                    concluida
                      ? "border-foreground bg-foreground text-background"
                      : atual
                        ? "border-foreground bg-transparent text-foreground"
                        : "border-border bg-transparent text-foreground-subtle"
                  }`}
                >
                  {indice + 1}
                </span>
              </li>
            </Fragment>
          );
        })}
      </ol>
      <ol className="flex w-full" aria-hidden>
        {etapas.map((etapa, indice) => (
          <li
            key={etapa}
            className={`flex-1 text-center text-xs ${indice === etapaAtualIndice ? "font-semibold text-foreground" : "text-foreground-subtle"} hidden sm:block`}
          >
            {etapa}
          </li>
        ))}
      </ol>
    </div>
  );
}
