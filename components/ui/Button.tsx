import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type VarianteBotao = "primary" | "secondary" | "danger" | "ghost";
type TamanhoBotao = "sm" | "md" | "lg";

interface BotaoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBotao;
  tamanho?: TamanhoBotao;
  iconeEsquerda?: ReactNode;
  iconeDireita?: ReactNode;
  larguraTotal?: boolean;
}

const CLASSES_VARIANTE: Record<VarianteBotao, string> = {
  primary: "bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 disabled:bg-neutral-200 disabled:text-neutral-400",
  secondary:
    "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50 active:bg-neutral-100 disabled:text-neutral-400",
  danger: "bg-status-avariado text-white hover:bg-brand-700 active:bg-brand-800 disabled:bg-neutral-200 disabled:text-neutral-400",
  ghost: "text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 disabled:text-neutral-400",
};

const CLASSES_TAMANHO: Record<TamanhoBotao, string> = {
  sm: "h-9 gap-1.5 px-3 text-sm",
  md: "h-11 gap-2 px-4 text-sm",
  lg: "h-14 gap-2.5 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, BotaoProps>(function Button(
  { variante = "primary", tamanho = "md", iconeEsquerda, iconeDireita, larguraTotal, className = "", children, ...resto },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center rounded-control font-medium transition-colors disabled:cursor-not-allowed ${CLASSES_VARIANTE[variante]} ${CLASSES_TAMANHO[tamanho]} ${larguraTotal ? "w-full" : ""} ${className}`}
      {...resto}
    >
      {iconeEsquerda}
      {children}
      {iconeDireita}
    </button>
  );
});
