"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type ColunaDataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useEquipamentos } from "@/lib/data/context";
import { TAXONOMIA_STATUS_EQUIPAMENTO } from "@/components/status/statusTaxonomy";
import { ROTULO_TIPO_EQUIPAMENTO, ROTULO_TIPO_OPERACAO } from "@/components/equipamento/rotulos";
import type { Equipamento } from "@/lib/types";

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
        ROTULO_TIPO_OPERACAO[eq.tipoOperacao].toLowerCase().includes(termo) ||
        eq.localizacaoAtual.toLowerCase().includes(termo),
    );
  }, [equipamentos, busca]);

  const colunas: ColunaDataTable<Equipamento>[] = [
    { chave: "tag", cabecalho: "Tag", renderizar: (eq) => <span className="font-medium">{eq.tag}</span> },
    { chave: "tipo", cabecalho: "Tipo", renderizar: (eq) => ROTULO_TIPO_EQUIPAMENTO[eq.tipo] },
    { chave: "tipoOperacao", cabecalho: "Tipo de operação", renderizar: (eq) => ROTULO_TIPO_OPERACAO[eq.tipoOperacao] },
    { chave: "localizacao", cabecalho: "Localização", renderizar: (eq) => eq.localizacaoAtual },
    {
      chave: "status",
      cabecalho: "Status",
      renderizar: (eq) => <StatusBadge entrada={TAXONOMIA_STATUS_EQUIPAMENTO[eq.status]} tamanho="sm" />,
    },
  ];

  return (
    <div>
      <PageHeader
        titulo="Equipamentos"
        subtitulo={`${equipamentos.length} equipamentos cadastrados.`}
        acoes={
          <Button iconeEsquerda={<Plus size={16} aria-hidden />} onClick={() => router.push("/admin/equipamentos/novo")}>
            Novo equipamento
          </Button>
        }
      />
      <div className="mb-4 max-w-xs">
        <Input
          rotulo="Buscar"
          placeholder="Tag, tipo de operação ou localização"
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
