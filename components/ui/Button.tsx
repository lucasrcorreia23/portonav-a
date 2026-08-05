import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Spinner } from "./Spinner";

type VarianteBotao = "primary" | "secondary" | "danger" | "ghost";
type TamanhoBotao = "sm" | "md" | "lg";

interface BotaoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBotao;
  tamanho?: TamanhoBotao;
  iconeEsquerda?: ReactNode;
  iconeDireita?: ReactNode;
  larguraTotal?: boolean;
  carregando?: boolean;
}

// Primário = gradiente-assinatura (indigo → magenta → laranja), texto branco.
const CLASSES_VARIANTE: Record<VarianteBotao, string> = {
  primary: "text-white shadow-sm hover:brightness-110 [background:var(--gradient-brand-button)]",
  secondary: "border border-border bg-background text-foreground hover:bg-surface-2",
  danger: "bg-error text-white hover:bg-error/90",
  ghost: "bg-transparent text-foreground-muted hover:bg-surface-2",
};

// Altura FIXA por tamanho (box-border, shrink-0) — nunca sobrescrever via className.
// sm 32px · md 40px (padrão, igual aos inputs) · lg 44px.
const CLASSES_TAMANHO: Record<TamanhoBotao, string> = {
  sm: "h-8 gap-1.5 px-4 text-xs",
  md: "h-10 gap-2 px-5 text-sm",
  lg: "h-11 gap-2.5 px-6 text-sm",
};

const REGEX_ACAO_CRIACAO = /^(Criar|Adicionar|Nova|Novo)\b/;

export const Button = forwardRef<HTMLButtonElement, BotaoProps>(function Button(
  {
    variante = "primary",
    tamanho = "md",
    iconeEsquerda,
    iconeDireita,
    larguraTotal,
    carregando = false,
    disabled,
    className = "",
    children,
    ...resto
  },
  ref,
) {
  // Prefixo "+" automático em ações de criação primárias sem ícone explícito —
  // labels não devem levar "+" manual (ver docs/design-system/DESIGN.md).
  const iconeAutoCriacao =
    !iconeEsquerda &&
    !carregando &&
    variante === "primary" &&
    typeof children === "string" &&
    REGEX_ACAO_CRIACAO.test(children);

  return (
    <button
      ref={ref}
      disabled={disabled || carregando}
      className={`box-border inline-flex shrink-0 items-center justify-center rounded-control font-semibold transition-[opacity,background-color,color,box-shadow] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground disabled:pointer-events-none disabled:opacity-50 ${CLASSES_VARIANTE[variante]} ${CLASSES_TAMANHO[tamanho]} ${larguraTotal ? "w-full" : ""} ${className}`}
      {...resto}
    >
      {carregando && <Spinner tamanho="sm" />}
      {!carregando && iconeEsquerda}
      {iconeAutoCriacao && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M12 5v14M5 12h14" />
        </svg>
      )}
      {children}
      {!carregando && iconeDireita}
    </button>
  );
});
