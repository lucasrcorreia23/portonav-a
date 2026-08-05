"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  aberto: boolean;
  titulo: string;
  onFechar: () => void;
  children: ReactNode;
  largura?: "md" | "lg" | "xl";
}

const CLASSES_LARGURA = {
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
} as const;

function elementosFocaveis(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => !el.hasAttribute("disabled"));
}

export function Modal({ aberto, titulo, onFechar, children, largura = "md" }: ModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gatilhoAnteriorRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!aberto) return;
    gatilhoAnteriorRef.current = document.activeElement as HTMLElement | null;
    const foco = elementosFocaveis(containerRef.current!)[0];
    foco?.focus();

    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        onFechar();
        return;
      }
      if (evento.key !== "Tab" || !containerRef.current) return;
      const focaveis = elementosFocaveis(containerRef.current);
      if (focaveis.length === 0) return;
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primeiro.focus();
      }
    }

    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      gatilhoAnteriorRef.current?.focus();
    };
  }, [aberto, onFechar]);

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-black/40 p-4">
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        className={`w-full ${CLASSES_LARGURA[largura]} rounded-card-hero border border-border bg-surface p-6 shadow-lg`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="modal-titulo" className="text-lg font-bold text-foreground">
            {titulo}
          </h2>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="rounded-md p-1.5 text-foreground-subtle hover:bg-surface-2 hover:text-foreground"
          >
            <X size={20} aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
