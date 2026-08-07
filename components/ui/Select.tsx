"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import type { KeyboardEvent } from "react";

export interface OpcaoSelect {
  valor: string;
  rotulo: string;
}

interface SelectProps {
  rotulo?: string;
  erro?: string;
  dica?: string;
  opcoes: OpcaoSelect[];
  placeholder?: string;
  valor?: string;
  aoAlterar?: (valor: string) => void;
  nome?: string;
  desabilitado?: boolean;
  id?: string;
  className?: string;
  classeBotao?: string;
  "aria-label"?: string;
}

/**
 * Popover estilizado — nunca o `<select>` nativo do SO (proibido pelo design
 * system, ver docs/design-system/UI-PRIMITIVES.md §1). API por valor/callback,
 * compatível com formulários controlados.
 */
export function Select({
  rotulo,
  erro,
  dica,
  opcoes,
  placeholder,
  valor,
  aoAlterar,
  nome,
  desabilitado,
  id,
  className = "",
  classeBotao = "",
  "aria-label": ariaLabel,
}: SelectProps) {
  const [aberto, setAberto] = useState(false);
  const [indiceDestacado, setIndiceDestacado] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listaRef = useRef<HTMLUListElement>(null);
  const idGerado = useId();
  const selectId = id ?? idGerado;
  const dicaId = dica ? `${selectId}-dica` : undefined;

  const selecionada = opcoes.find((o) => o.valor === valor);

  const selecionar = useCallback(
    (valorEscolhido: string) => {
      aoAlterar?.(valorEscolhido);
      setAberto(false);
    },
    [aoAlterar],
  );

  useEffect(() => {
    if (!aberto) return;
    function aoClicarFora(evento: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(evento.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, [aberto]);

  useEffect(() => {
    if (indiceDestacado >= 0 && listaRef.current) {
      const el = listaRef.current.children[indiceDestacado] as HTMLElement | undefined;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [indiceDestacado]);

  function alternar() {
    if (desabilitado) return;
    setAberto((anterior) => {
      if (!anterior) {
        const idx = opcoes.findIndex((o) => o.valor === valor);
        setIndiceDestacado(idx >= 0 ? idx : -1);
      }
      return !anterior;
    });
  }

  function aoTeclar(evento: KeyboardEvent) {
    if (!aberto) {
      if (evento.key === "ArrowDown" || evento.key === "Enter" || evento.key === " ") {
        evento.preventDefault();
        alternar();
      }
      return;
    }
    switch (evento.key) {
      case "ArrowDown":
        evento.preventDefault();
        setIndiceDestacado((anterior) => Math.min(anterior + 1, opcoes.length - 1));
        break;
      case "ArrowUp":
        evento.preventDefault();
        setIndiceDestacado((anterior) => Math.max(anterior - 1, 0));
        break;
      case "Enter":
      case " ":
        evento.preventDefault();
        if (indiceDestacado >= 0 && indiceDestacado < opcoes.length) {
          selecionar(opcoes[indiceDestacado].valor);
        }
        break;
      case "Escape":
      case "Tab":
        if (evento.key === "Escape") evento.preventDefault();
        setAberto(false);
        break;
    }
  }

  return (
    <div ref={containerRef} className={`relative flex flex-col gap-1.5 ${className}`}>
      {rotulo && (
        <label htmlFor={selectId} className="text-xs font-semibold text-foreground-muted">
          {rotulo}
        </label>
      )}

      {nome && <input type="hidden" name={nome} value={valor ?? ""} />}

      <button
        type="button"
        id={selectId}
        disabled={desabilitado}
        onClick={alternar}
        onKeyDown={aoTeclar}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-describedby={dicaId}
        className={`flex h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-[10px] border bg-background pr-3.5 pl-4 text-left text-sm transition-colors hover:bg-surface-2 focus:outline-none focus-visible:border-foreground focus-visible:bg-background disabled:cursor-not-allowed disabled:opacity-50 ${
          erro ? "border-error" : "border-border"
        } ${aberto ? "border-foreground bg-background" : ""} ${classeBotao}`}
      >
        <span className={selecionada ? "text-foreground" : "text-foreground-subtle"}>
          {selecionada ? selecionada.rotulo : (placeholder ?? "Selecionar…")}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`shrink-0 text-foreground-subtle transition-transform ${aberto ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {dica && !erro && (
        <p id={dicaId} className="text-xs text-foreground-muted">
          {dica}
        </p>
      )}
      {erro && (
        <p className="text-xs text-error" role="alert">
          {erro}
        </p>
      )}

      {aberto && (
        <div
          className="absolute top-full z-[var(--z-dropdown)] mt-1 w-full min-w-max rounded-lg border border-border bg-surface p-1"
          role="listbox"
          aria-label={rotulo ?? ariaLabel}
        >
          <ul ref={listaRef} className="max-h-52 space-y-0.5 overflow-y-auto">
            {placeholder && (
              <li
                role="option"
                aria-selected={!valor}
                onClick={() => selecionar("")}
                className="cursor-pointer rounded-[4px] px-2.5 py-1.5 text-sm text-foreground-subtle transition-colors hover:bg-surface-2"
              >
                {placeholder}
              </li>
            )}
            {opcoes.map((opcao, indice) => (
              <li
                key={opcao.valor}
                role="option"
                aria-selected={opcao.valor === valor}
                onMouseEnter={() => setIndiceDestacado(indice)}
                onClick={() => selecionar(opcao.valor)}
                className={`flex cursor-pointer items-center justify-between rounded-[4px] px-2.5 py-1.5 text-sm transition-colors hover:bg-surface-2 ${
                  opcao.valor === valor
                    ? "bg-surface-2 font-medium text-foreground"
                    : indice === indiceDestacado
                      ? "bg-surface-2 text-foreground"
                      : "text-foreground"
                }`}
              >
                {opcao.rotulo}
                {opcao.valor === valor && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
