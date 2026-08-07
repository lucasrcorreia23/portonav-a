"use client";

import type { LucideIcon } from "lucide-react";

export interface OpcaoSegmento<T extends string> {
  valor: T;
  rotulo: string;
  icone?: LucideIcon;
}

/**
 * Seletor de poucas opções curtas e mutuamente exclusivas — o DS exige este
 * componente no lugar de um Select/dropdown (ver docs/design-system/UI-PRIMITIVES.md §1).
 * Ativo em alto contraste (foreground/background), única situação sancionada
 * para esse par fora de botão primário (DESIGN.md §2).
 */
export function SegmentedControl<T extends string>({
  opcoes,
  valor,
  aoAlterar,
  tamanho = "md",
  className = "",
  "aria-label": ariaLabel,
}: {
  opcoes: OpcaoSegmento<T>[];
  valor: T;
  aoAlterar: (valor: T) => void;
  tamanho?: "sm" | "md";
  className?: string;
  "aria-label": string;
}) {
  const alturaClasse = tamanho === "sm" ? "h-9 px-3 text-sm" : "h-11 min-h-11 px-4 text-sm";

  return (
    <div role="tablist" aria-label={ariaLabel} className={`flex flex-wrap items-center gap-2 ${className}`}>
      {opcoes.map((opcao) => {
        const Icone = opcao.icone;
        const ativo = valor === opcao.valor;
        return (
          <button
            key={opcao.valor}
            type="button"
            role="tab"
            aria-selected={ativo}
            onClick={() => aoAlterar(opcao.valor)}
            className={`inline-flex items-center justify-center gap-2 rounded-pill font-semibold transition-colors outline-none focus-visible:ring-1 focus-visible:ring-foreground ${alturaClasse} ${
              ativo ? "bg-foreground text-background" : "text-foreground-muted hover:bg-surface-2"
            }`}
          >
            {Icone && <Icone size={16} aria-hidden />}
            {opcao.rotulo}
          </button>
        );
      })}
    </div>
  );
}
