"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import type { ReactNode, KeyboardEvent } from "react";

export interface OpcaoCombobox {
  valor: string;
  rotulo: string;
  /** Ponto de cor opcional, mostrado antes do rótulo. */
  cor?: string;
  /** Ícone opcional, mostrado antes do rótulo. */
  icone?: ReactNode;
}

interface ComboboxProps {
  opcoes: OpcaoCombobox[];
  valor?: string;
  aoAlterar?: (valor: string) => void;
  placeholder?: string;
  rotulo?: string;
  erro?: string;
  pesquisavel?: boolean;
  desabilitado?: boolean;
  className?: string;
  nome?: string;
  /** Lado de ancoragem do popover. "direita" abre para dentro da página. */
  alinhar?: "esquerda" | "direita";
  /** Quando true, permite criar novos valores a partir do texto pesquisado. */
  criavel?: boolean;
}

/** Autocomplete / busca em lista — type-ahead embutido no próprio trigger. */
export function Combobox({
  opcoes,
  valor,
  aoAlterar,
  placeholder = "Selecionar...",
  rotulo,
  erro,
  pesquisavel,
  desabilitado,
  className = "",
  nome,
  alinhar = "esquerda",
  criavel,
}: ComboboxProps) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const [indiceDestacado, setIndiceDestacado] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listaRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listaId = useId();

  const mostrarBusca = pesquisavel ?? opcoes.length > 6;
  const selecionada = opcoes.find((o) => o.valor === valor);

  const filtradas = busca ? opcoes.filter((o) => o.rotulo.toLowerCase().includes(busca.toLowerCase())) : opcoes;

  const alternar = useCallback(() => {
    if (desabilitado) return;
    setAberto((anterior) => {
      if (!anterior) {
        setBusca("");
        const idx = opcoes.findIndex((o) => o.valor === valor);
        setIndiceDestacado(idx >= 0 ? idx : -1);
      } else {
        (document.activeElement as HTMLElement)?.blur();
      }
      return !anterior;
    });
  }, [desabilitado, opcoes, valor]);

  const selecionar = useCallback(
    (valorEscolhido: string) => {
      aoAlterar?.(valorEscolhido);
      setAberto(false);
      setBusca("");
      (document.activeElement as HTMLElement)?.blur();
    },
    [aoAlterar],
  );

  useEffect(() => {
    if (!aberto) return;
    function aoClicarFora(evento: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(evento.target as Node)) {
        setAberto(false);
        setBusca("");
      }
    }
    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, [aberto]);

  useEffect(() => {
    if (aberto && mostrarBusca) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [aberto, mostrarBusca]);

  useEffect(() => {
    if (indiceDestacado >= 0 && listaRef.current) {
      const el = listaRef.current.children[indiceDestacado] as HTMLElement | undefined;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [indiceDestacado]);

  function aoTeclar(evento: KeyboardEvent) {
    if (!aberto) {
      if (evento.key === "ArrowDown" || (!mostrarBusca && (evento.key === "Enter" || evento.key === " "))) {
        evento.preventDefault();
        setAberto(true);
      }
      return;
    }
    switch (evento.key) {
      case "ArrowDown":
        evento.preventDefault();
        setIndiceDestacado((anterior) => (anterior + 1) % filtradas.length);
        break;
      case "ArrowUp":
        evento.preventDefault();
        setIndiceDestacado((anterior) => (anterior <= 0 ? filtradas.length - 1 : anterior - 1));
        break;
      case "Enter":
        evento.preventDefault();
        if (indiceDestacado >= 0 && indiceDestacado < filtradas.length) {
          selecionar(filtradas[indiceDestacado].valor);
        } else if (mostrarBusca && filtradas.length > 0) {
          selecionar(filtradas[0].valor);
        }
        break;
      case "Escape":
        evento.preventDefault();
        setAberto(false);
        setBusca("");
        break;
    }
  }

  return (
    <div ref={containerRef} className={`relative flex flex-col gap-1.5 ${className}`}>
      {rotulo && <label className="text-xs font-semibold text-foreground-muted">{rotulo}</label>}

      {nome && <input type="hidden" name={nome} value={valor ?? ""} />}

      {mostrarBusca ? (
        <div className="relative">
          {selecionada?.cor && !aberto && (
            <span
              className="pointer-events-none absolute top-1/2 left-3.5 z-10 h-2.5 w-2.5 flex-none -translate-y-1/2 rounded-full"
              style={{ backgroundColor: selecionada.cor }}
            />
          )}
          {selecionada?.icone && !aberto && (
            <span className="pointer-events-none absolute top-1/2 left-3.5 z-10 flex-none -translate-y-1/2 text-foreground-muted">
              {selecionada.icone}
            </span>
          )}
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={aberto}
            aria-controls={listaId}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            disabled={desabilitado}
            value={aberto ? busca : selecionada ? selecionada.rotulo : ""}
            placeholder={selecionada ? selecionada.rotulo : placeholder}
            onChange={(evento) => {
              setBusca(evento.target.value);
              setIndiceDestacado(0);
              if (!aberto) setAberto(true);
            }}
            onFocus={() => {
              if (!aberto) {
                setAberto(true);
                setBusca("");
                const idx = opcoes.findIndex((o) => o.valor === valor);
                setIndiceDestacado(idx >= 0 ? idx : -1);
              }
            }}
            onKeyDown={aoTeclar}
            className={`h-10 w-full rounded-[10px] border bg-background pr-10 text-sm text-foreground transition-colors placeholder:text-foreground-subtle hover:bg-background focus:border-foreground focus:bg-background focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
              erro ? "border-error" : "border-border"
            } ${aberto ? "border-foreground bg-background" : ""} ${(selecionada?.cor || selecionada?.icone) && !aberto ? "pl-9" : "pl-4"}`}
          />
          <button
            type="button"
            tabIndex={-1}
            disabled={desabilitado}
            onClick={() => {
              if (desabilitado) return;
              if (aberto) {
                setAberto(false);
              } else {
                setAberto(true);
                setBusca("");
                setIndiceDestacado(-1);
                inputRef.current?.focus();
              }
            }}
            className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3.5 text-foreground-subtle disabled:cursor-not-allowed"
            aria-label={aberto ? "Fechar opções" : "Abrir opções"}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`transition-transform ${aberto ? "rotate-180" : ""}`}
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={alternar}
          onKeyDown={aoTeclar}
          disabled={desabilitado}
          className={`flex h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-[10px] border bg-background pr-3.5 pl-4 text-left text-sm text-foreground transition-colors hover:bg-background focus:border-foreground focus:bg-background focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
            erro ? "border-error" : "border-border"
          } ${aberto ? "border-foreground bg-background" : ""}`}
          role="combobox"
          aria-expanded={aberto}
          aria-controls={listaId}
          aria-haspopup="listbox"
        >
          <span className={`flex items-center gap-2 ${selecionada ? "text-foreground" : "text-foreground-subtle"}`}>
            {selecionada?.cor && <span className="h-2.5 w-2.5 flex-none rounded-full" style={{ backgroundColor: selecionada.cor }} />}
            {selecionada?.icone && <span className="flex-none text-foreground-muted">{selecionada.icone}</span>}
            {selecionada ? selecionada.rotulo : placeholder}
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`text-foreground-subtle transition-transform ${aberto ? "rotate-180" : ""}`}
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      )}

      {erro && (
        <p className="text-xs text-error" role="alert">
          {erro}
        </p>
      )}

      {aberto && (
        <div
          className={`absolute top-full z-[var(--z-dropdown)] mt-1 w-max max-w-[18rem] min-w-full rounded-lg border border-border bg-surface p-1 shadow-md ${
            alinhar === "direita" ? "right-0" : "left-0"
          }`}
          role="listbox"
        >
          <ul ref={listaRef} id={listaId} className="max-h-52 overflow-y-auto">
            {filtradas.length === 0 && !criavel ? (
              <li className="px-2.5 py-1.5 text-sm text-foreground-subtle">Nenhum resultado</li>
            ) : filtradas.length === 0 && criavel && busca.trim() ? (
              <li
                className="flex cursor-pointer items-center gap-2 rounded-[4px] px-2.5 py-1.5 text-sm text-primary transition-colors hover:bg-surface-2"
                onClick={() => selecionar(busca.trim())}
              >
                Adicionar &ldquo;{busca.trim()}&rdquo;
              </li>
            ) : (
              filtradas.map((opcao, i) => (
                <li
                  key={opcao.valor}
                  role="option"
                  aria-selected={opcao.valor === valor}
                  className={`flex items-center justify-between gap-3 rounded-[4px] px-2.5 py-1.5 text-sm whitespace-nowrap transition-colors hover:bg-surface-2 ${
                    opcao.valor === valor ? "bg-surface-2 font-medium text-foreground" : i === indiceDestacado ? "bg-surface-2 text-foreground" : "text-foreground"
                  } cursor-pointer`}
                  onClick={() => selecionar(opcao.valor)}
                  onMouseEnter={() => setIndiceDestacado(i)}
                >
                  <span className="flex items-center gap-2">
                    {opcao.cor && <span className="h-2.5 w-2.5 flex-none rounded-full" style={{ backgroundColor: opcao.cor }} />}
                    {opcao.icone && <span className="flex-none text-foreground-muted">{opcao.icone}</span>}
                    {opcao.rotulo}
                  </span>
                  {opcao.valor === valor && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </li>
              ))
            )}
            {criavel && busca.trim() && filtradas.length > 0 && !filtradas.some((o) => o.rotulo.toLowerCase() === busca.trim().toLowerCase()) && (
              <li
                className="mt-1 flex cursor-pointer items-center gap-2 rounded-[4px] border-t border-border px-2.5 py-1.5 pt-1.5 text-sm text-primary transition-colors hover:bg-surface-2"
                onClick={() => selecionar(busca.trim())}
              >
                Adicionar &ldquo;{busca.trim()}&rdquo;
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
