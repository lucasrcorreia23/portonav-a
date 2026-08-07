"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";

interface ConfirmDialogProps {
  aberto: boolean;
  titulo: string;
  descricao?: ReactNode;
  textoConfirmar?: string;
  textoCancelar?: string;
  /** Cor do botão de confirmação (destrutivo por padrão). */
  varianteConfirmar?: "danger" | "primary";
  carregando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

/**
 * Popup padrão de confirmação/alerta do produto (card compacto centralizado,
 * sem X nem dividers). Usar sempre para exclusão/ação destrutiva/alerta — ver
 * docs/design-system/UI-PRIMITIVES.md §2.
 */
export function ConfirmDialog({
  aberto,
  titulo,
  descricao,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  varianteConfirmar = "danger",
  carregando = false,
  onConfirmar,
  onCancelar,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!aberto) return;
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        evento.stopPropagation();
        onCancelar();
      }
    }
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [aberto, onCancelar]);

  if (!aberto) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onCancelar} />
      <div className="relative w-full max-w-sm rounded-card-hero border border-border bg-surface p-6">
        <h3 className="text-base font-semibold text-foreground">{titulo}</h3>
        {descricao != null && <div className="mt-2 text-sm text-foreground-muted">{descricao}</div>}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button variante="ghost" onClick={onCancelar}>
            {textoCancelar}
          </Button>
          <Button variante={varianteConfirmar} carregando={carregando} onClick={onConfirmar}>
            {textoConfirmar}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
