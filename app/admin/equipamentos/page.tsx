"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type ColunaDataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Input } from "@/components/ui/Input";
import { useEquipamentos } from "@/lib/data/context";
import { TAXONOMIA_STATUS_EQUIPAMENTO } from "@/components/status/statusTaxonomy";
import type { Equipamento } from "@/lib/types";

const ROTULO_TIPO: Record<Equipamento["tipo"], string> = {
  empilhadeira: "Empilhadeira",
  reach_stacker: "Reach stacker",
  transpaleteira: "Transpaleteira",
};

export default function AdminEquipamentosPage() {
  const equipamentos = useEquipamentos();
  const router = useRouter();
  const [busca, setBusca] = useState("");

  const linhas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return equipamentos;
    return equipamentos.filter(
      (eq) =>
        eq.tag.toLowerCase().includes(termo) ||
        eq.categoria.toLowerCase().includes(termo) ||
        eq.localizacaoAtual.toLowerCase().includes(termo),
    );
  }, [equipamentos, busca]);

  const colunas: ColunaDataTable<Equipamento>[] = [
    { chave: "tag", cabecalho: "Tag", renderizar: (eq) => <span className="font-medium">{eq.tag}</span> },
    { chave: "tipo", cabecalho: "Tipo", renderizar: (eq) => ROTULO_TIPO[eq.tipo] },
    { chave: "categoria", cabecalho: "Categoria", renderizar: (eq) => eq.categoria },
    { chave: "localizacao", cabecalho: "Localização", renderizar: (eq) => eq.localizacaoAtual },
    {
      chave: "status",
      cabecalho: "Status",
      renderizar: (eq) => <StatusBadge entrada={TAXONOMIA_STATUS_EQUIPAMENTO[eq.status]} tamanho="sm" />,
    },
  ];

  return (
    <div>
      <PageHeader titulo="Equipamentos" subtitulo={`${equipamentos.length} equipamentos cadastrados.`} />
      <div className="mb-4 max-w-xs">
        <Input
          rotulo="Buscar"
          placeholder="Tag, categoria ou localização"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>
      <DataTable
        colunas={colunas}
        linhas={linhas}
        chaveLinha={(eq) => eq.id}
        aoClicarLinha={(eq) => router.push(`/equipamento/${eq.tag}`)}
        legendaVazia="Nenhum equipamento encontrado para essa busca."
      />
    </div>
  );
}
