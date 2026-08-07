"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Download, Trash2 } from "lucide-react";
import { ConfirmDialog } from "./ConfirmDialog";

interface RowActionsProps {
  onExportar?: () => void;
  onExcluir?: () => void;
  textoExcluir?: string;
  mensagemConfirmarExclusao?: string;
}

/** Menu de ações de linha (3 pontos) — visível só no hover (`group/row` na `<tr>`). */
export function RowActions({
  onExportar,
  onExcluir,
  textoExcluir = "Excluir",
  mensagemConfirmarExclusao = "Tem certeza que deseja excluir? Esta ação não pode ser desfeita.",
}: RowActionsProps) {
  const [aberto, setAberto] = useState(false);
  const [confirmarAberto, setConfirmarAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    function aoClicarFora(evento: MouseEvent) {
      if (ref.current && !ref.current.contains(evento.target as Node)) setAberto(false);
    }
    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, [aberto]);

  return (
    <>
      <div ref={ref} className="relative" onClick={(evento) => evento.stopPropagation()}>
        <button
          type="button"
          onClick={() => setAberto((anterior) => !anterior)}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-foreground-subtle opacity-0 transition-colors group-hover/row:opacity-100 hover:bg-surface-3 hover:text-foreground"
          aria-label="Mais opções"
        >
          <MoreVertical size={15} aria-hidden />
        </button>

        {aberto && (
          <div className="absolute top-full right-0 z-[var(--z-dropdown)] mt-1 min-w-[9rem] rounded-lg border border-border bg-surface p-1">
            {onExportar && (
              <button
                type="button"
                onClick={() => {
                  onExportar();
                  setAberto(false);
                }}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-[4px] px-2.5 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-surface-2"
              >
                <Download size={14} aria-hidden />
                Exportar
              </button>
            )}
            {onExcluir && (
              <button
                type="button"
                onClick={() => {
                  setConfirmarAberto(true);
                  setAberto(false);
                }}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-[4px] px-2.5 py-1.5 text-[13px] font-medium text-error transition-colors hover:bg-error/10"
              >
                <Trash2 size={14} aria-hidden />
                {textoExcluir}
              </button>
            )}
          </div>
        )}
      </div>

      {onExcluir && (
        <ConfirmDialog
          aberto={confirmarAberto}
          titulo={textoExcluir}
          descricao={mensagemConfirmarExclusao}
          textoConfirmar={textoExcluir}
          varianteConfirmar="danger"
          onCancelar={() => setConfirmarAberto(false)}
          onConfirmar={() => {
            onExcluir();
            setConfirmarAberto(false);
          }}
        />
      )}
    </>
  );
}
