import type { EntradaTaxonomia } from "@/components/status/statusTaxonomy";

interface StatusBadgeProps {
  entrada: EntradaTaxonomia;
  tamanho?: "sm" | "md" | "lg";
  /** Mostra a descrição longa abaixo do rótulo — útil em cards de destaque. */
  comDescricao?: boolean;
}

const CLASSES_TAMANHO = {
  sm: { pill: "gap-1 px-2 py-0.5 text-xs", icone: 12 },
  md: { pill: "gap-1.5 px-2.5 py-1 text-sm", icone: 14 },
  lg: { pill: "gap-2 px-4 py-2 text-base", icone: 18 },
} as const;

/**
 * Único jeito sancionado de mostrar status no app: sempre ícone + texto + cor juntos,
 * nunca uma cor sozinha. Toda tela deve usar este componente, nunca uma "bolinha colorida" à parte.
 */
export function StatusBadge({ entrada, tamanho = "md", comDescricao = false }: StatusBadgeProps) {
  const Icone = entrada.icone;
  const classes = CLASSES_TAMANHO[tamanho];
  return (
    <div className="inline-flex flex-col items-start gap-1">
      <span className={`inline-flex items-center rounded-sm font-semibold ${entrada.classeCor} ${classes.pill}`}>
        <Icone size={classes.icone} aria-hidden />
        {entrada.label}
      </span>
      {comDescricao && <p className="text-sm text-foreground-muted">{entrada.descricao}</p>}
    </div>
  );
}
