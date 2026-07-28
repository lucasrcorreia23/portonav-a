"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type ColunaDataTable } from "@/components/ui/DataTable";
import { ReliabilityScoreBadge } from "@/components/operador/ReliabilityScoreBadge";
import { useChecklistsPreenchidos, useOperadores } from "@/lib/data/context";
import type { Operador } from "@/lib/types";

export default function ConfiabilidadeOperadoresPage() {
  const operadores = useOperadores();
  const checklists = useChecklistsPreenchidos();

  const ranking = [...operadores].sort((a, b) => b.scoreConfiabilidade - a.scoreConfiabilidade);

  const colunas: ColunaDataTable<Operador>[] = [
    { chave: "posicao", cabecalho: "#", renderizar: (o) => ranking.indexOf(o) + 1 },
    { chave: "nome", cabecalho: "Nome", renderizar: (o) => <span className="font-medium">{o.nome}</span> },
    { chave: "turno", cabecalho: "Turno", renderizar: (o) => o.turnoPadrao[0].toUpperCase() + o.turnoPadrao.slice(1) },
    {
      chave: "checklists",
      cabecalho: "Checklists preenchidos",
      renderizar: (o) => checklists.filter((c) => c.operadorId === o.id).length,
    },
    {
      chave: "suspeitos",
      cabecalho: "Suspeitos",
      renderizar: (o) => checklists.filter((c) => c.operadorId === o.id && c.suspeito).length,
    },
    { chave: "score", cabecalho: "Score", renderizar: (o) => <ReliabilityScoreBadge score={o.scoreConfiabilidade} /> },
  ];

  return (
    <div>
      <PageHeader titulo="Ranking de confiabilidade" subtitulo="Operadores ordenados pelo score de confiabilidade de preenchimento." />
      <DataTable colunas={colunas} linhas={ranking} chaveLinha={(o) => o.id} />
    </div>
  );
}
