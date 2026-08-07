import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Superfície destacada — hoje expressa por fundo, já que o produto não usa sombra. */
  elevado?: boolean;
  densidade?: "espacada" | "densa";
}

// Este produto não usa sombra em nenhum lugar: separação vem de borda e superfície.
export function Card({ elevado = false, densidade = "espacada", className = "", children, ...resto }: CardProps) {
  const preenchimento = densidade === "densa" ? "p-4" : "p-6";
  return (
    <div
      className={`rounded-card border border-border ${preenchimento} ${elevado ? "bg-surface-2" : "bg-surface"} ${className}`}
      {...resto}
    >
      {children}
    </div>
  );
}
