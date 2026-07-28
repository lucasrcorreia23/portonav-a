import type { ReactNode } from "react";

/** Shell mobile-first para a jornada do operador: coluna estreita, espaçada, toques grandes. */
export function OperatorShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col gap-6 px-4 py-6 sm:px-6">{children}</div>
  );
}
