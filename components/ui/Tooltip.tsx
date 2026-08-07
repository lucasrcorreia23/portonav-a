"use client";

import { useState, useRef, useCallback, useEffect, useLayoutEffect } from "react";
import type { ReactNode, CSSProperties } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  children: ReactNode;
  rotulo: string;
  lado?: "top" | "bottom" | "left" | "right";
  className?: string;
}

/** Tooltip custom pontual — usar quando o alvo não pode receber `title`/`aria-label` direto (ver TooltipLayer abaixo para o caso comum). */
export function Tooltip({ children, rotulo, lado = "top", className = "" }: TooltipProps) {
  const [visivel, setVisivel] = useState(false);
  const [estilo, setEstilo] = useState<CSSProperties>({ position: "fixed", visibility: "hidden" });
  const ref = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  const mostrar = useCallback(() => setVisivel(true), []);
  const esconder = useCallback(() => setVisivel(false), []);

  useLayoutEffect(() => {
    if (!visivel || !ref.current || !tipRef.current) return;
    const rect = ref.current.getBoundingClientRect();
    const tip = tipRef.current.getBoundingClientRect();
    const pad = 8;
    let x = 0;
    let y = 0;
    let tx = "-50%";
    let ty = "0";

    if (lado === "top") {
      x = rect.left + rect.width / 2;
      y = rect.top - 6;
      ty = "-100%";
    } else if (lado === "bottom") {
      x = rect.left + rect.width / 2;
      y = rect.bottom + 6;
    } else if (lado === "left") {
      x = rect.left - 6;
      y = rect.top + rect.height / 2;
      tx = "-100%";
      ty = "-50%";
    } else {
      x = rect.right + 6;
      y = rect.top + rect.height / 2;
      tx = "0";
      ty = "-50%";
    }

    const metadeLargura = tip.width / 2;
    if (lado === "top" || lado === "bottom") {
      if (x - metadeLargura < pad) {
        tx = "0";
        x = Math.max(pad, rect.left);
      } else if (x + metadeLargura > window.innerWidth - pad) {
        tx = "-100%";
        x = Math.min(window.innerWidth - pad, rect.right);
      }
    }
    if (lado === "left" || lado === "right") {
      const metadeAltura = tip.height / 2;
      if (y - metadeAltura < pad) {
        ty = "0";
        y = pad;
      } else if (y + metadeAltura > window.innerHeight - pad) {
        ty = "-100%";
        y = window.innerHeight - pad;
      }
    }

    setEstilo({ position: "fixed", left: x, top: y, transform: `translate(${tx}, ${ty})`, zIndex: 99999, visibility: "visible" });
  }, [visivel, lado]);

  if (!rotulo) return <>{children}</>;

  return (
    <div ref={ref} className={`relative ${className}`} onMouseEnter={mostrar} onMouseLeave={esconder}>
      {children}
      {visivel &&
        createPortal(
          <div
            ref={tipRef}
            role="tooltip"
            style={estilo}
            className="pointer-events-none rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-background"
          >
            {rotulo}
          </div>,
          document.body,
        )}
    </div>
  );
}

/* ============================================================
   TooltipLayer — camada global de tooltips (NUNCA nativas). Montar uma
   única vez em app/layout.tsx. Intercepta qualquer `title` nativo (move
   pra `data-tooltip` e remove o `title`, matando o balão nativo do
   navegador) e cobre botões só-ícone via `aria-label` sem texto visível.
   Para desativar num elemento específico, usar `data-tooltip=""`.
   ============================================================ */

const ATRASO_TOOLTIP = 350;
type Ancora = { rect: DOMRect; texto: string };

function textoTooltipDe(el: HTMLElement): string {
  if (el.hasAttribute("title")) {
    const t = el.getAttribute("title") || "";
    el.removeAttribute("title");
    if (t) el.setAttribute("data-tooltip", t);
  }
  if (el.hasAttribute("data-tooltip")) return el.getAttribute("data-tooltip") || "";
  const tag = el.tagName.toLowerCase();
  const role = el.getAttribute("role");
  if (tag === "button" || tag === "a" || role === "button") {
    const aria = el.getAttribute("aria-label");
    if (aria && (el.textContent ?? "").trim() === "") return aria;
  }
  return "";
}

export function TooltipLayer() {
  const [ancora, setAncora] = useState<Ancora | null>(null);
  const [estilo, setEstilo] = useState<CSSProperties>({ position: "fixed", visibility: "hidden", left: 0, top: 0 });
  const tipRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const elAtivo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    function encontrarAlvo(inicio: EventTarget | null): { el: HTMLElement; texto: string } | null {
      let el = inicio as HTMLElement | null;
      while (el && el !== document.body && el.nodeType === 1) {
        const texto = textoTooltipDe(el);
        if (texto) return { el, texto };
        el = el.parentElement;
      }
      return null;
    }
    function esconder() {
      clearTimeout(timer.current);
      elAtivo.current = null;
      setAncora(null);
    }
    function aoPassarPor(evento: Event) {
      const encontrado = encontrarAlvo(evento.target);
      if (!encontrado || encontrado.el === elAtivo.current) return;
      elAtivo.current = encontrado.el;
      clearTimeout(timer.current);
      setAncora(null);
      timer.current = setTimeout(() => {
        if (elAtivo.current !== encontrado.el || !encontrado.el.isConnected) return;
        setAncora({ rect: encontrado.el.getBoundingClientRect(), texto: encontrado.texto });
      }, ATRASO_TOOLTIP);
    }
    function aoSair(evento: MouseEvent) {
      const relacionado = evento.relatedTarget as Node | null;
      if (elAtivo.current && relacionado && elAtivo.current.contains(relacionado)) return;
      esconder();
    }

    document.addEventListener("mouseover", aoPassarPor, true);
    document.addEventListener("mouseout", aoSair, true);
    document.addEventListener("focusin", aoPassarPor, true);
    document.addEventListener("focusout", esconder, true);
    document.addEventListener("click", esconder, true);
    window.addEventListener("scroll", esconder, true);
    window.addEventListener("keydown", esconder, true);
    return () => {
      clearTimeout(timer.current);
      document.removeEventListener("mouseover", aoPassarPor, true);
      document.removeEventListener("mouseout", aoSair, true);
      document.removeEventListener("focusin", aoPassarPor, true);
      document.removeEventListener("focusout", esconder, true);
      document.removeEventListener("click", esconder, true);
      window.removeEventListener("scroll", esconder, true);
      window.removeEventListener("keydown", esconder, true);
    };
  }, []);

  useLayoutEffect(() => {
    if (!ancora || !tipRef.current) return;
    const tip = tipRef.current.getBoundingClientRect();
    const r = ancora.rect;
    const pad = 8;
    const margem = 6;
    const lado: "top" | "bottom" = r.top - tip.height - margem >= pad ? "top" : "bottom";
    const top = lado === "top" ? r.top - margem - tip.height : r.bottom + margem;
    let left = r.left + r.width / 2 - tip.width / 2;
    left = Math.min(Math.max(pad, left), window.innerWidth - pad - tip.width);
    setEstilo({ position: "fixed", left, top, zIndex: 99999, visibility: "visible" });
  }, [ancora]);

  if (!ancora) return null;
  return createPortal(
    <div
      ref={tipRef}
      role="tooltip"
      style={estilo}
      className="pointer-events-none rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-background"
    >
      {ancora.texto}
    </div>,
    document.body,
  );
}
