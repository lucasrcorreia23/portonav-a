"use client";

import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import type { CampoOrdenacao, DirecaoOrdenacao } from "@/lib/table-utils";

/** Botão "Ordenar" com dropdown de campos; clicar no campo ativo inverte a direção. */
export function SortMenu({
  opcoes,
  campo,
  direcao,
  aoAlterar,
}: {
  opcoes: CampoOrdenacao[];
  campo: string;
  direcao: DirecaoOrdenacao;
  aoAlterar: (campo: string, direcao: DirecaoOrdenacao) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    function aoClicarFora(evento: MouseEvent) {
      if (ref.current && !ref.current.contains(evento.target as Node)) setAberto(false);
    }
    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, [aberto]);

  const atual = opcoes.find((o) => o.valor === campo);

  function escolher(valor: string) {
    if (valor === campo) aoAlterar(valor, direcao === "asc" ? "desc" : "asc");
    else aoAlterar(valor, "asc");
    setAberto(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setAberto((anterior) => !anterior)}
        className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-[10px] border border-border bg-background pr-3 pl-4 text-sm text-foreground-muted transition-colors hover:bg-surface-2"
      >
        <span>Ordenar{atual ? `: ${atual.rotulo}` : ""}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`-mr-0.5 text-foreground-subtle transition-transform ${aberto ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {aberto && (
        <div className="absolute top-full right-0 z-[var(--z-dropdown)] mt-1 min-w-[12rem] rounded-lg border border-border bg-surface p-1 shadow-md" role="menu">
          {opcoes.map((opcao) => {
            const ativo = opcao.valor === campo;
            return (
              <button
                key={opcao.valor}
                type="button"
                onClick={() => escolher(opcao.valor)}
                className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-[4px] px-2.5 py-1.5 text-sm text-foreground transition-colors hover:bg-surface-2 ${ativo ? "bg-surface-2 font-medium" : ""}`}
              >
                <span className="min-w-0 flex-1 truncate text-left">{opcao.rotulo}</span>
                {ativo && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={direcao === "desc" ? "rotate-180" : ""}
                    aria-hidden="true"
                  >
                    <path d="M12 19V5M5 12l7-7 7 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Filtro multi-seleção em dropdown (checkbox por opção). */
export function MultiSelectFilter({
  rotulo,
  opcoes,
  selecionados,
  aoAlterar,
}: {
  rotulo: string;
  opcoes: { valor: string; rotulo: string }[];
  selecionados: string[];
  aoAlterar: (valores: string[]) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    function aoClicarFora(evento: MouseEvent) {
      if (ref.current && !ref.current.contains(evento.target as Node)) setAberto(false);
    }
    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, [aberto]);

  function alternar(valor: string) {
    aoAlterar(selecionados.includes(valor) ? selecionados.filter((v) => v !== valor) : [...selecionados, valor]);
  }

  const quantidade = selecionados.length;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setAberto((anterior) => !anterior)}
        className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-[10px] border border-border bg-background pr-3 pl-4 text-sm text-foreground-muted transition-colors hover:bg-surface-2"
      >
        <span>
          {quantidade === 1
            ? (opcoes.find((o) => o.valor === selecionados[0])?.rotulo ?? rotulo)
            : quantidade > 1
              ? `${rotulo}: ${quantidade}`
              : rotulo}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`-mr-0.5 text-foreground-subtle transition-transform ${aberto ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {aberto && (
        <div className="absolute top-full right-0 z-[var(--z-dropdown)] mt-1 min-w-[12rem] rounded-lg border border-border bg-surface p-1 shadow-md" role="menu">
          {opcoes.map((opcao) => {
            const ativo = selecionados.includes(opcao.valor);
            return (
              <button
                key={opcao.valor}
                type="button"
                onClick={() => alternar(opcao.valor)}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-[4px] px-2.5 py-1.5 text-sm text-foreground transition-colors hover:bg-surface-2"
              >
                <span
                  className={`flex h-4 w-4 flex-none items-center justify-center rounded-[3px] border ${ativo ? "border-foreground bg-foreground text-background" : "border-border"}`}
                  aria-hidden="true"
                >
                  {ativo && (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </span>
                <span className="min-w-0 flex-1 truncate text-left">{opcao.rotulo}</span>
              </button>
            );
          })}
          {quantidade > 0 && (
            <button
              type="button"
              onClick={() => aoAlterar([])}
              className="mt-0.5 flex w-full cursor-pointer items-center justify-center rounded-[4px] px-2.5 py-1.5 text-xs text-foreground-muted transition-colors hover:bg-surface-2"
            >
              Limpar filtro
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** Checkbox de cabeçalho com estado indeterminado. */
export function SelectAllCheckbox({
  marcado,
  indeterminado,
  aoAlterar,
}: {
  marcado: boolean;
  indeterminado: boolean;
  aoAlterar: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminado;
  }, [indeterminado]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={marcado}
      onChange={aoAlterar}
      aria-label="Selecionar todos"
      onClick={(evento) => evento.stopPropagation()}
    />
  );
}

/** Barra flutuante de ações em massa. */
export function BulkBar({
  quantidade,
  onLimpar,
  onExcluir,
  children,
}: {
  quantidade: number;
  onLimpar: () => void;
  onExcluir?: () => void;
  children?: ReactNode;
}) {
  if (quantidade === 0) return null;
  return createPortal(
    <div className="fixed bottom-4 left-1/2 z-[var(--z-sticky)] flex w-max min-w-[24rem] max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 rounded-full border border-border bg-surface px-5 py-2.5 shadow-lg">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-foreground">
          {quantidade} selecionado{quantidade !== 1 ? "s" : ""}
        </span>
        <button type="button" onClick={onLimpar} className="cursor-pointer text-xs text-foreground-muted hover:text-foreground">
          Limpar
        </button>
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        {children}
        {onExcluir && (
          <button
            type="button"
            onClick={onExcluir}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-error/30 bg-error/10 px-3 py-1.5 text-xs font-semibold text-error transition-colors hover:bg-error/20"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
            Excluir
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}
