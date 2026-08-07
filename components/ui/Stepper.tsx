interface StepperProps {
  etapas: string[];
  etapaAtualIndice: number;
}

/**
 * Trilha de etapas do checklist — anatomia do Figma "Operador Flow" (node 4119:4089):
 * círculos de 32px numerados, ligados por um fio de 1px, sem rótulo visível. O nome da
 * etapa vive no `aria-label`; quem enxerga lê o título da seção logo abaixo da trilha.
 *
 * Cada item cresce igual (`flex-1`) e os fios são elementos de verdade dentro dele, não
 * metades absolutas: o primeiro item só tem fio à direita e o último só à esquerda, então
 * a trilha começa e termina no círculo, sem sobra pendurada nas pontas.
 */
export function Stepper({ etapas, etapaAtualIndice }: StepperProps) {
  const ultimo = etapas.length - 1;
  return (
    <ol className="flex w-full items-center" aria-label="Progresso do checklist">
      {etapas.map((etapa, indice) => {
        const concluida = indice < etapaAtualIndice;
        const atual = indice === etapaAtualIndice;
        return (
          <li key={etapa} className="flex min-w-px flex-1 items-center">
            {indice > 0 && (
              <span
                aria-hidden
                className={`h-px min-w-px flex-1 transition-colors ${
                  indice <= etapaAtualIndice ? "bg-foreground" : "bg-border"
                }`}
              />
            )}
            {/* Concluída fica cinza sólida e a atual preta: quem só enxerga preenchimento
                ainda distingue onde está, sem depender do aria-current. */}
            <span
              aria-current={atual ? "step" : undefined}
              aria-label={etapa}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                atual
                  ? "bg-foreground text-background"
                  : concluida
                    ? "bg-foreground-subtle text-background"
                    : "border-[0.8px] border-border bg-background text-foreground-subtle"
              }`}
            >
              {indice + 1}
            </span>
            {indice < ultimo && (
              <span
                aria-hidden
                className={`h-px min-w-px flex-1 transition-colors ${
                  indice < etapaAtualIndice ? "bg-foreground" : "bg-border"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
