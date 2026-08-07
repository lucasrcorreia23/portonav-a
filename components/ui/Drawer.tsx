"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { BackButton } from "@/components/ui/BackButton";

interface DrawerProps {
  aberto: boolean;
  onFechar: () => void;
  titulo: string;
  children: ReactNode;
  rodape?: ReactNode;
  acoesCabecalho?: ReactNode;
  largura?: string;
  /**
   * "voltar" troca o "×" à direita pelo botão circular de voltar à esquerda, colado no
   * título — o padrão das pranchas da jornada de operador, onde a folha ocupa a tela
   * inteira e se comporta como uma tela a mais. "fechar" (padrão) é o drawer de desktop.
   */
  navegacao?: "fechar" | "voltar";
}

/**
 * Drawer lateral (slide-in pela direita). Usar para criar/editar registros
 * sem sair da tela atual — nunca `Modal` centralizado para isso (ver
 * docs/design-system/UI-PRIMITIVES.md §2). Fecha no ESC, no clique no
 * backdrop e no botão de fechar.
 */
export function Drawer({
  aberto,
  onFechar,
  titulo,
  children,
  rodape,
  acoesCabecalho,
  largura = "max-w-md",
  navegacao = "fechar",
}: DrawerProps) {
  useEffect(() => {
    if (!aberto) return;
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") onFechar();
    }
    document.addEventListener("keydown", aoTeclar);
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = overflowAnterior;
    };
  }, [aberto, onFechar]);

  return (
    <div className={`fixed inset-0 z-[var(--z-modal)] ${aberto ? "" : "pointer-events-none"}`} aria-hidden={!aberto}>
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${aberto ? "opacity-100" : "opacity-0"}`}
        onClick={onFechar}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className={`absolute top-0 right-0 flex h-full w-full ${largura} flex-col border-l border-border bg-surface transition-transform duration-200 ease-out ${
          aberto ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 px-5 py-3.5">
          {navegacao === "voltar" && <BackButton aoVoltar={onFechar} rotulo={`Voltar — sair de ${titulo}`} />}
          <h2 className="min-w-0 flex-1 truncate text-lg font-bold text-foreground">{titulo}</h2>
          {acoesCabecalho && <div className="flex items-center gap-1.5">{acoesCabecalho}</div>}
          {navegacao === "fechar" && (
            <button
              type="button"
              onClick={onFechar}
              className="-mr-1 cursor-pointer rounded-md p-1 text-foreground-subtle transition-colors hover:bg-surface-2 hover:text-foreground"
              aria-label="Fechar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">{aberto && children}</div>

        {rodape && <div className="flex justify-end gap-2 px-5 py-3.5">{rodape}</div>}
      </div>
    </div>
  );
}
