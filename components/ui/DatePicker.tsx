"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

interface DatePickerProps {
  valor?: string;
  aoAlterar?: (data: string) => void;
  rotulo?: string;
  placeholder?: string;
  nome?: string;
  desabilitado?: boolean;
}

const DIAS = ["D", "S", "T", "Q", "Q", "S", "S"];
const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function diasNoMes(ano: number, mes: number) {
  return new Date(ano, mes + 1, 0).getDate();
}
function diaDeInicio(ano: number, mes: number) {
  return new Date(ano, mes, 1).getDay();
}

/** Calendário custom em popover — nunca `type="date"` nativo (abre o calendário do SO). */
export function DatePicker({ valor, aoAlterar, rotulo, placeholder = "Selecionar data", nome, desabilitado }: DatePickerProps) {
  const [aberto, setAberto] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [posicao, setPosicao] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const hoje = new Date();
  const analisada = valor ? new Date(valor + "T00:00:00") : null;
  const [anoVisivel, setAnoVisivel] = useState(analisada?.getFullYear() ?? hoje.getFullYear());
  const [mesVisivel, setMesVisivel] = useState(analisada?.getMonth() ?? hoje.getMonth());

  const totalDias = diasNoMes(anoVisivel, mesVisivel);
  const primeiroDia = diaDeInicio(anoVisivel, mesVisivel);

  useEffect(() => {
    if (!aberto) return;
    function aoClicarFora(evento: MouseEvent) {
      const alvo = evento.target as Node;
      if (triggerRef.current?.contains(alvo)) return;
      if (dropRef.current?.contains(alvo)) return;
      setAberto(false);
    }
    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, [aberto]);

  useLayoutEffect(() => {
    if (!aberto || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const alturaDropdown = 280;
    const espacoAbaixo = window.innerHeight - rect.bottom;
    const top = espacoAbaixo >= alturaDropdown ? rect.bottom + 4 : rect.top - alturaDropdown - 4;
    let left = rect.left;
    if (left + 260 > window.innerWidth) left = window.innerWidth - 268;
    setPosicao({ top: Math.max(4, top), left: Math.max(4, left) });
  }, [aberto, mesVisivel, anoVisivel]);

  function selecionarData(dia: number) {
    const m = String(mesVisivel + 1).padStart(2, "0");
    const d = String(dia).padStart(2, "0");
    aoAlterar?.(`${anoVisivel}-${m}-${d}`);
    setAberto(false);
  }

  function mesAnterior() {
    if (mesVisivel === 0) {
      setMesVisivel(11);
      setAnoVisivel((y) => y - 1);
    } else setMesVisivel((m) => m - 1);
  }
  function mesSeguinte() {
    if (mesVisivel === 11) {
      setMesVisivel(0);
      setAnoVisivel((y) => y + 1);
    } else setMesVisivel((m) => m + 1);
  }

  const exibicao = analisada ? analisada.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }) : null;

  return (
    <div className="flex flex-col gap-1.5">
      {rotulo && <label className="text-xs font-semibold text-foreground-muted">{rotulo}</label>}
      {nome && <input type="hidden" name={nome} value={valor ?? ""} />}

      <button
        ref={triggerRef}
        type="button"
        onClick={() => !desabilitado && setAberto((anterior) => !anterior)}
        disabled={desabilitado}
        className={`flex h-10 w-full items-center justify-between rounded-full border border-border bg-background px-3 text-left text-sm transition-colors focus:border-foreground focus:outline-none ${
          desabilitado ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        } ${aberto ? "border-foreground" : ""}`}
      >
        <span className={exibicao ? "text-foreground" : "text-foreground-subtle"}>{exibicao ?? placeholder}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-foreground-subtle" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      </button>

      {aberto &&
        createPortal(
          <div
            ref={dropRef}
            className="fixed z-[99999] w-64 rounded-lg border border-border bg-surface p-3"
            style={{ top: posicao.top, left: posicao.left }}
          >
            <div className="mb-2 flex items-center justify-between">
              <button type="button" onClick={mesAnterior} className="cursor-pointer rounded-sm p-1 text-foreground-muted hover:bg-surface-2" aria-label="Mês anterior">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <span className="text-sm font-semibold text-foreground">
                {MESES[mesVisivel]} {anoVisivel}
              </span>
              <button type="button" onClick={mesSeguinte} className="cursor-pointer rounded-sm p-1 text-foreground-muted hover:bg-surface-2" aria-label="Próximo mês">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>

            <div className="mb-1 grid grid-cols-7 gap-0">
              {DIAS.map((d, i) => (
                <span key={i} className="py-1 text-center text-[11px] font-medium text-foreground-subtle">
                  {d}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0">
              {Array.from({ length: primeiroDia }).map((_, i) => (
                <span key={`vazio${i}`} />
              ))}
              {Array.from({ length: totalDias }).map((_, i) => {
                const dia = i + 1;
                const selecionado = analisada && analisada.getFullYear() === anoVisivel && analisada.getMonth() === mesVisivel && analisada.getDate() === dia;
                const ehHoje = hoje.getFullYear() === anoVisivel && hoje.getMonth() === mesVisivel && hoje.getDate() === dia;
                return (
                  <button
                    key={dia}
                    type="button"
                    onClick={() => selecionarData(dia)}
                    className={`h-7 w-full cursor-pointer rounded-sm text-sm transition-colors ${
                      selecionado ? "bg-primary text-primary-foreground" : ehHoje ? "border border-primary text-primary" : "text-foreground hover:bg-surface-2"
                    }`}
                  >
                    {dia}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
