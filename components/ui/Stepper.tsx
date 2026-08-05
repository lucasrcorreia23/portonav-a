interface StepperProps {
  etapas: string[];
  etapaAtualIndice: number;
}

/** Trilha de etapas do checklist. Cada etapa ocupa uma coluna de largura igual e o conector
 * é desenhado como duas metades absolutas dentro dela — é isso que mantém o rótulo centrado
 * no próprio círculo em qualquer quantidade de etapas (inclusive uma só). */
export function Stepper({ etapas, etapaAtualIndice }: StepperProps) {
  const ultimo = etapas.length - 1;
  return (
    <ol className="flex w-full items-start" aria-label="Progresso do checklist">
      {etapas.map((etapa, indice) => {
        const concluida = indice < etapaAtualIndice;
        const atual = indice === etapaAtualIndice;
        return (
          <li key={etapa} className="relative flex flex-1 flex-col items-center gap-1.5">
            {/* top-3.5 = metade da altura do círculo (h-7), alinhando a linha ao centro dele. */}
            {indice > 0 && (
              <span
                aria-hidden
                className={`absolute left-0 top-3.5 h-px w-1/2 transition-colors ${
                  indice <= etapaAtualIndice ? "bg-foreground" : "bg-border"
                }`}
              />
            )}
            {indice < ultimo && (
              <span
                aria-hidden
                className={`absolute right-0 top-3.5 h-px w-1/2 transition-colors ${
                  indice < etapaAtualIndice ? "bg-foreground" : "bg-border"
                }`}
              />
            )}
            {/* relative: vem depois dos conectores no DOM, então cobre a linha que passa atrás. */}
            <span
              aria-current={atual ? "step" : undefined}
              aria-label={etapa}
              className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors ${
                concluida
                  ? "border-foreground bg-foreground text-background"
                  : atual
                    ? "border-foreground bg-background text-foreground"
                    : "border-border bg-background text-foreground-subtle"
              }`}
            >
              {indice + 1}
            </span>
            <span
              aria-hidden
              className={`hidden px-1 text-center text-xs sm:block ${
                atual ? "font-semibold text-foreground" : "text-foreground-subtle"
              }`}
            >
              {etapa}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
