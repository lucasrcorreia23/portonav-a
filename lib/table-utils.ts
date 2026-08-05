import { useState } from "react";

export type DirecaoOrdenacao = "asc" | "desc";
export type CampoOrdenacao = { valor: string; rotulo: string };

/** Estado de seleção em massa para uma lista de ids. */
export function useSelecaoLinhas(ids: string[]) {
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());

  const todosSelecionados = ids.length > 0 && ids.every((id) => selecionados.has(id));
  const algunsSelecionados = ids.some((id) => selecionados.has(id)) && !todosSelecionados;

  function alternar(id: string) {
    setSelecionados((anterior) => {
      const novo = new Set(anterior);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  function alternarTodos() {
    setSelecionados((anterior) => {
      const todos = ids.every((id) => anterior.has(id));
      const novo = new Set(anterior);
      ids.forEach((id) => (todos ? novo.delete(id) : novo.add(id)));
      return novo;
    });
  }

  function limpar() {
    setSelecionados(new Set());
  }

  return {
    selecionados,
    alternar,
    alternarTodos,
    limpar,
    todosSelecionados,
    algunsSelecionados,
    quantidade: selecionados.size,
    estaSelecionado: (id: string) => selecionados.has(id),
  };
}

/** Exporta linhas para CSV (download no client). */
export function exportarLinhasParaCsv(
  nomeArquivo: string,
  colunas: { chave: string; rotulo: string }[],
  linhas: Record<string, unknown>[],
) {
  const escapar = (valor: unknown) => {
    const texto = valor == null ? "" : String(valor);
    return /[",\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
  };
  const cabecalho = colunas.map((c) => escapar(c.rotulo)).join(",");
  const corpo = linhas.map((linha) => colunas.map((c) => escapar(linha[c.chave])).join(",")).join("\n");
  const csv = `${cabecalho}\n${corpo}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  a.click();
  URL.revokeObjectURL(url);
}
