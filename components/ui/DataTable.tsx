import type { ReactNode } from "react";

export interface ColunaDataTable<T> {
  chave: string;
  cabecalho: string;
  renderizar: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  colunas: ColunaDataTable<T>[];
  linhas: T[];
  chaveLinha: (item: T) => string;
  aoClicarLinha?: (item: T) => void;
  legendaVazia?: string;
}

/**
 * Tabela densa de admin — sem borda no container, um único divider sob o
 * cabeçalho, sem dividers entre linhas, hover sutil (ver docs/design-system).
 */
export function DataTable<T>({
  colunas,
  linhas,
  chaveLinha,
  aoClicarLinha,
  legendaVazia = "Nenhum registro encontrado.",
}: DataTableProps<T>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-max border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr className="bg-background">
            {colunas.map((coluna) => (
              <th
                key={coluna.chave}
                className={`border-b border-border px-3 py-3 text-[13px] font-semibold text-foreground ${coluna.className ?? ""}`}
              >
                {coluna.cabecalho}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.length === 0 ? (
            <tr>
              <td colSpan={colunas.length} className="px-3 py-8 text-center text-foreground-muted">
                {legendaVazia}
              </td>
            </tr>
          ) : (
            linhas.map((linha) => (
              <tr
                key={chaveLinha(linha)}
                onClick={aoClicarLinha ? () => aoClicarLinha(linha) : undefined}
                tabIndex={aoClicarLinha ? 0 : undefined}
                onKeyDown={
                  aoClicarLinha
                    ? (evento) => {
                        if (evento.key === "Enter" || evento.key === " ") {
                          evento.preventDefault();
                          aoClicarLinha(linha);
                        }
                      }
                    : undefined
                }
                className={`group/row ${aoClicarLinha ? "cursor-pointer hover:bg-surface-2" : ""}`}
              >
                {colunas.map((coluna) => (
                  <td key={coluna.chave} className={`px-3 py-3 text-foreground ${coluna.className ?? ""}`}>
                    {coluna.renderizar(linha)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
