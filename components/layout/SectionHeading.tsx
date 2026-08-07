import type { ReactNode } from "react";

/**
 * Título de seção da jornada do operador — Body/Medium-Bold do Figma (14px/700,
 * tracking -0.01em) em `foreground-muted`. É rótulo de agrupamento, não manchete: fica
 * abaixo do h1 da tela na hierarquia visual, mas continua sendo um heading no DOM.
 *
 * Bold e não medium de propósito: a Averta self-hosted não tem peso 500 (ver
 * app/globals.css), então `font-medium` cai num peso sintetizado pelo navegador.
 */
export function SectionHeading({ children, acao }: { children: ReactNode; acao?: ReactNode }) {
  const titulo = <h2 className="text-sm font-bold tracking-[-0.01em] text-foreground-muted">{children}</h2>;

  if (!acao) return titulo;

  return (
    <div className="flex items-center justify-between gap-3">
      {titulo}
      {acao}
    </div>
  );
}
