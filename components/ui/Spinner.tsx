interface SpinnerProps {
  tamanho?: "sm" | "md" | "lg";
  className?: string;
}

const CLASSES_TAMANHO: Record<NonNullable<SpinnerProps["tamanho"]>, string> = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-10 w-10",
};

/** Anel fino com um arco em rotação. Usa currentColor — herda a cor do texto ao redor. */
export function Spinner({ tamanho = "md", className = "" }: SpinnerProps) {
  return (
    <svg
      className={`animate-spin ${CLASSES_TAMANHO[tamanho]} ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Carregando"
      role="status"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.25" className="opacity-15" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
    </svg>
  );
}
