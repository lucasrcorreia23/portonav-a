import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Spinner } from "./Spinner";

type VarianteBotao = "primary" | "secondary" | "danger" | "ghost" | "ia";
// "touch" = 56px na jornada de operador/QR-entry/checklist (pátio/externo).
type TamanhoBotao = "sm" | "md" | "lg" | "touch";

interface BotaoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBotao;
  tamanho?: TamanhoBotao;
  iconeEsquerda?: ReactNode;
  iconeDireita?: ReactNode;
  /** Padrão true — botões ocupam a largura disponível. Use false só em grupos inline (header, dialog). */
  larguraTotal?: boolean;
  carregando?: boolean;
}

// Primário = alto contraste sólido (preto no light), texto branco — sem gradiente
// (ver docs/design-system/DESIGN.md §2 / §8). Gradiente fica só na variante `ia`.
const CLASSES_VARIANTE: Record<VarianteBotao, string> = {
  primary: "bg-foreground text-background hover:opacity-90",
  secondary: "border border-border bg-background text-foreground hover:bg-surface-2",
  danger: "bg-error text-white hover:bg-error/90",
  // Texto em foreground, não esmaecido: ghost aqui é sempre uma ação real (Cancelar,
  // Voltar, Remover), nunca um estado indisponível — ver Button/Mobile no Figma.
  ghost: "bg-transparent text-foreground hover:bg-surface-2",
  // Ação de IA (simulada) — única exceção reservada para gradiente
  // (ver docs/design-system/DESIGN.md §8). Chamador deve passar iconeEsquerda={<Sparkles/>}.
  ia: "botao-ia text-white",
};

// Escala do design system (docs/design-system/DESIGN.md §67): sm 32 · md 40 · lg 44.
// `touch` 56 é a extensão deste produto para a jornada de operador (pátio/externo).
const CLASSES_TAMANHO: Record<TamanhoBotao, string> = {
  sm: "h-8 min-h-8 gap-1.5 px-4 text-sm",
  md: "h-10 min-h-10 gap-2 px-5 text-sm",
  lg: "h-11 min-h-11 gap-2.5 px-6 text-sm",
  touch: "h-14 min-h-14 gap-2.5 px-6 text-base",
};

const REGEX_ACAO_CRIACAO = /^(Criar|Adicionar|Nova|Novo)\b/;

export const Button = forwardRef<HTMLButtonElement, BotaoProps>(function Button(
  {
    variante = "primary",
    tamanho = "md",
    iconeEsquerda,
    iconeDireita,
    larguraTotal = true,
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

  // A IA não usa spinner: o botão só troca para o estado "pensando" (rótulo e cor),
  // enquanto o movimento fica na foto e no campo — ver .ia-veu em app/globals.css.
  const iaPensando = variante === "ia" && carregando;

  return (
    <button
      ref={ref}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      className={`box-border inline-flex shrink-0 items-center justify-center rounded-control font-semibold transition-[opacity,background-color,color,box-shadow] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground disabled:pointer-events-none disabled:opacity-50 ${CLASSES_VARIANTE[variante]} ${iaPensando ? "botao-ia-pensando" : ""} ${CLASSES_TAMANHO[tamanho]} ${larguraTotal ? "w-full" : ""} ${className}`}
      {...resto}
    >
      {carregando && !iaPensando && <Spinner tamanho="sm" />}
      {(!carregando || iaPensando) && iconeEsquerda}
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
