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

/** Tabela densa de admin — cabeçalho fixo visualmente, linha inteira clicável quando aplicável. */
export function DataTable<T>({
  colunas,
  linhas,
  chaveLinha,
  aoClicarLinha,
  legendaVazia = "Nenhum registro encontrado.",
}: DataTableProps<T>) {
  return (
    <div className="w-full overflow-x-auto rounded-card border border-neutral-100">
      <table className="w-full min-w-max border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-neutral-100 bg-neutral-50">
            {colunas.map((coluna) => (
              <th key={coluna.chave} className={`px-4 py-3 font-medium text-neutral-700 ${coluna.className ?? ""}`}>
                {coluna.cabecalho}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.length === 0 ? (
            <tr>
              <td colSpan={colunas.length} className="px-4 py-8 text-center text-neutral-500">
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
                className={`border-b border-neutral-100 last:border-0 ${
                  aoClicarLinha ? "cursor-pointer hover:bg-neutral-50" : ""
                }`}
              >
                {colunas.map((coluna) => (
                  <td key={coluna.chave} className={`px-4 py-3 text-neutral-800 ${coluna.className ?? ""}`}>
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
