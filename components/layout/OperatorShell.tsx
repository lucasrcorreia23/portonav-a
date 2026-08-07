import type { ReactNode } from "react";
import { OperatorHeader } from "@/components/layout/OperatorHeader";

/** Shell mobile-first para a jornada do operador: coluna estreita, espaçada, toques grandes. */
export function OperatorShell({
  children,
  cabecalho,
}: {
  children: ReactNode;
  /**
   * Nome do operador para o cabeçalho (avatar + marca + notificações). Omitir em
   * telas focadas — checklist, resultado e onboarding não têm cabeçalho no fluxo.
   */
  cabecalho?: { nomeOperador: string; fotoOperador?: string | null; quantidadeNotificacoes?: number };
}) {
  return (
    // Sem folga extra embaixo: a pílula "Modo demonstração" só aparece no hover do
    // canto, então o conteúdo pode ir até o fim da tela.
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col gap-6 px-4 py-6 sm:px-6">
      {cabecalho && (
        <OperatorHeader
          nomeOperador={cabecalho.nomeOperador}
          fotoOperador={cabecalho.fotoOperador}
          quantidadeNotificacoes={cabecalho.quantidadeNotificacoes}
        />
      )}
      {children}
    </div>
  );
}
