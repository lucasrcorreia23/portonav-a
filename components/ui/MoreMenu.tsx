"use client";

import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { MoreVertical, Download, Archive, Trash2 } from "lucide-react";
import { ConfirmDialog } from "./ConfirmDialog";

interface MoreMenuProps {
  onDuplicar?: () => void;
  textoDuplicar?: string;
  onExportar?: () => void;
  textoExportar?: string;
  onArquivar?: () => void;
  textoArquivar?: string;
  onExcluir?: () => void;
  textoExcluir?: string;
  mensagemConfirmarExclusao?: string;
  carregandoExclusao?: boolean;
  /** Render prop para abrir o menu a partir de um botão próprio, em vez do kebab padrão. */
  trigger?: (props: { aberto: boolean; alternar: () => void }) => ReactNode;
}

export function MoreMenu({
  onDuplicar,
  textoDuplicar = "Duplicar",
  onExportar,
  textoExportar = "Exportar",
  onArquivar,
  textoArquivar = "Arquivar",
  onExcluir,
  textoExcluir = "Excluir",
  mensagemConfirmarExclusao = "Tem certeza que deseja excluir? Esta ação não pode ser desfeita.",
  carregandoExclusao,
  trigger,
}: MoreMenuProps) {
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

  const alternar = () => setAberto((anterior) => !anterior);

  return (
    <>
      <div ref={ref} className="relative">
        {trigger ? (
          trigger({ aberto, alternar })
        ) : (
          <button
            type="button"
            onClick={alternar}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-foreground-muted transition-colors hover:bg-surface-2"
            aria-label="Mais opções"
          >
            <MoreVertical size={18} aria-hidden />
          </button>
        )}

        {aberto && (
          <div className="absolute top-full right-0 z-[var(--z-dropdown)] mt-1 min-w-[10rem] rounded-lg border border-border bg-surface p-1 shadow-md">
            {onDuplicar && (
              <button
                type="button"
                onClick={() => {
                  onDuplicar();
                  setAberto(false);
                }}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-[4px] px-2.5 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-surface-2"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
                {textoDuplicar}
              </button>
            )}
            {onExportar && (
              <button
                type="button"
                onClick={() => {
                  onExportar();
                  setAberto(false);
                }}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-[4px] px-2.5 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-surface-2"
              >
                <Download size={15} aria-hidden />
                {textoExportar}
              </button>
            )}
            {onArquivar && (
              <button
                type="button"
                onClick={() => {
                  onArquivar();
                  setAberto(false);
                }}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-[4px] px-2.5 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-surface-2"
              >
                <Archive size={15} aria-hidden />
                {textoArquivar}
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
                <Trash2 size={15} aria-hidden />
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
          carregando={carregandoExclusao}
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
