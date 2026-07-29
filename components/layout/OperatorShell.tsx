import type { ReactNode } from "react";

/** Shell mobile-first para a jornada do operador: coluna estreita, espaçada, toques grandes. */
export function OperatorShell({ children }: { children: ReactNode }) {
  return (
    // pb-24 evita que botões no fim da tela fiquem embaixo da pílula fixa "Modo demonstração".
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col gap-6 px-4 py-6 pb-24 sm:px-6">{children}</div>
  );
}
