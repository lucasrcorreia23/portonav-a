import type { ReactNode } from "react";

interface BadgeProps {
  texto: string;
  icone?: ReactNode;
  /** Classes Tailwind de cor (ex.: "text-status-disponivel bg-status-disponivel-surface") — nunca hex direto. */
  classeCor: string;
  tamanho?: "sm" | "md" | "lg";
}

const CLASSES_TAMANHO = {
  sm: "gap-1 px-2 py-0.5 text-xs",
  md: "gap-1.5 px-2.5 py-1 text-sm",
  lg: "gap-2 px-3.5 py-1.5 text-base",
} as const;

/**
 * Pill genérico de cor+ícone+texto — StatusBadge compõe isto com a taxonomia de
 * status. `texto` já deve chegar em sentence case (1ª letra maiúscula, resto
 * conforme o dado — acrônimos como está); este componente não reformata a
 * string pra não quebrar acrônimos (ex.: "Todos (EPI)").
 */
export function Badge({ texto, icone, classeCor, tamanho = "md" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-sm font-semibold ${classeCor} ${CLASSES_TAMANHO[tamanho]}`}>
      {icone}
      {texto}
    </span>
  );
}
