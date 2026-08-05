import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevado?: boolean;
  densidade?: "espacada" | "densa";
}

export function Card({ elevado = false, densidade = "espacada", className = "", children, ...resto }: CardProps) {
  const preenchimento = densidade === "densa" ? "p-4" : "p-6";
  return (
    <div
      className={`rounded-card border border-border bg-surface ${preenchimento} ${elevado ? "shadow-md" : "shadow-sm"} ${className}`}
      {...resto}
    >
      {children}
    </div>
  );
}
