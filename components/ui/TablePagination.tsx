"use client";

import { useState, useRef, useEffect } from "react";

const OPCOES_TAMANHO_PAGINA = [10, 20, 50];
const CHAVE_TAMANHO_PAGINA = "portonav:table-page-size";

export function obterTamanhoPaginaSalvo(): number {
  if (typeof window === "undefined") return 10;
  const valor = localStorage.getItem(CHAVE_TAMANHO_PAGINA);
  return valor ? Number(valor) : 10;
}

export function salvarTamanhoPagina(tamanho: number) {
  localStorage.setItem(CHAVE_TAMANHO_PAGINA, String(tamanho));
}

interface TablePaginationProps {
  pagina: number;
  totalPaginas: number;
  tamanhoPagina: number;
  aoMudarPagina: (pagina: number) => void;
  aoMudarTamanhoPagina: (tamanho: number) => void;
}

/** Monta os números de página: 2 primeiras, 2 últimas, atual ± 1, com reticências nos vãos. */
function montarPaginas(atual: number, total: number): (number | "reticencias")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const paginas = new Set<number>();
  paginas.add(0);
  paginas.add(1);
  paginas.add(total - 2);
  paginas.add(total - 1);
  for (let i = atual - 1; i <= atual + 1; i++) {
    if (i >= 0 && i < total) paginas.add(i);
  }
  const ordenadas = [...paginas].sort((a, b) => a - b);
  const resultado: (number | "reticencias")[] = [];
  for (let i = 0; i < ordenadas.length; i++) {
    if (i > 0 && ordenadas[i] - ordenadas[i - 1] > 1) resultado.push("reticencias");
    resultado.push(ordenadas[i]);
  }
  return resultado;
}

const BOTAO_BASE = "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-sm transition-colors";
const BOTAO_PAGINA = `${BOTAO_BASE} text-foreground-muted hover:bg-surface-2 hover:text-foreground`;
const BOTAO_ATIVO = `${BOTAO_BASE} bg-foreground text-background font-semibold`;
const BOTAO_SETA = `${BOTAO_BASE} text-foreground-subtle hover:bg-surface-2 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-20`;

/** Seletor de tamanho de página custom (nunca `<select>` nativo). */
function SeletorTamanhoPagina({ valor, aoAlterar }: { valor: number; aoAlterar: (valor: number) => void }) {
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

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setAberto((anterior) => !anterior)}
        className="flex h-7 cursor-pointer items-center gap-2 rounded-md border border-border bg-background pr-4 pl-2.5 text-xs text-foreground transition-colors hover:border-foreground-subtle"
      >
        {valor}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-foreground-subtle/50 transition-transform ${aberto ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {aberto && (
        <div className="absolute bottom-full left-0 z-[var(--z-dropdown)] mb-1 min-w-[3.5rem] rounded-lg border border-border bg-surface p-1 shadow-md">
          {OPCOES_TAMANHO_PAGINA.map((tamanho) => (
            <button
              key={tamanho}
              type="button"
              onClick={() => {
                aoAlterar(tamanho);
                setAberto(false);
              }}
              className={`flex w-full cursor-pointer items-center justify-center rounded-[4px] px-2.5 py-1 text-xs transition-colors hover:bg-surface-2 ${
                tamanho === valor ? "bg-surface-2 text-foreground" : "text-foreground-muted"
              }`}
            >
              {tamanho}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function TablePagination({ pagina, totalPaginas, tamanhoPagina, aoMudarPagina, aoMudarTamanhoPagina }: TablePaginationProps) {
  const paginas = montarPaginas(pagina, totalPaginas);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2.5">
        <SeletorTamanhoPagina
          valor={tamanhoPagina}
          aoAlterar={(tamanho) => {
            salvarTamanhoPagina(tamanho);
            aoMudarTamanhoPagina(tamanho);
          }}
        />
      </div>

      {totalPaginas > 1 && (
        <nav className="flex items-center gap-1" aria-label="Paginação">
          <button
            type="button"
            disabled={pagina === 0}
            onClick={() => aoMudarPagina(pagina - 1)}
            className={BOTAO_SETA}
            aria-label="Página anterior"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {paginas.map((p, i) =>
            p === "reticencias" ? (
              <span key={`r${i}`} className="flex h-8 w-6 items-center justify-center text-sm text-foreground-subtle select-none">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => aoMudarPagina(p)}
                className={p === pagina ? BOTAO_ATIVO : BOTAO_PAGINA}
                aria-current={p === pagina ? "page" : undefined}
                aria-label={`Página ${p + 1}`}
              >
                {p + 1}
              </button>
            ),
          )}

          <button
            type="button"
            disabled={pagina >= totalPaginas - 1}
            onClick={() => aoMudarPagina(pagina + 1)}
            className={BOTAO_SETA}
            aria-label="Próxima página"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </nav>
      )}
    </div>
  );
}
