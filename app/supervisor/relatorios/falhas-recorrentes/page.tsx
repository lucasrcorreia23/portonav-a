"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { BarChart } from "@/components/charts/BarChart";
import { DataTable, type ColunaDataTable } from "@/components/ui/DataTable";
import { useChecklistsPreenchidos, useEquipamentos, useModelosChecklist } from "@/lib/data/context";
import { calcularFalhasRecorrentes, type FalhaRecorrente } from "@/lib/data/falhas-recorrentes";
import type { TipoEquipamento } from "@/lib/types";

const ROTULO_TIPO: Record<TipoEquipamento, string> = {
  empilhadeira: "Empilhadeira",
  reach_stacker: "Reach stacker",
  transpaleteira: "Transpaleteira",
};

export default function FalhasRecorrentesPage() {
  const checklists = useChecklistsPreenchidos();
  const equipamentos = useEquipamentos();
  const modelos = useModelosChecklist();

  const porTipo: Record<TipoEquipamento, number> = { empilhadeira: 0, reach_stacker: 0, transpaleteira: 0 };
  const porItem = new Map<string, number>();

  for (const checklist of checklists) {
    const equipamento = equipamentos.find((e) => e.id === checklist.equipamentoId);
    const modelo = modelos.find((m) => m.id === checklist.modeloChecklistId);
    if (!equipamento) continue;
    const itensDoModelo = modelo?.secoes.flatMap((s) => s.itens) ?? [];
    for (const resposta of checklist.respostas) {
      if (!resposta.reprovado) continue;
      porTipo[equipamento.tipo] += 1;
      const titulo = itensDoModelo.find((i) => i.id === resposta.itemId)?.titulo ?? "Item removido";
      porItem.set(titulo, (porItem.get(titulo) ?? 0) + 1);
    }
  }

  const dadosPorTipo = (Object.keys(porTipo) as TipoEquipamento[]).map((tipo) => ({
    rotulo: ROTULO_TIPO[tipo],
    valor: porTipo[tipo],
  }));

  const dadosPorItem = [...porItem.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([rotulo, valor]) => ({ rotulo, valor }));

  const falhasRecorrentes = calcularFalhasRecorrentes(checklists, modelos);

  const colunasRecorrencia: ColunaDataTable<FalhaRecorrente>[] = [
    {
      chave: "equipamento",
      cabecalho: "Equipamento",
      renderizar: (f) => <span className="font-medium">{equipamentos.find((e) => e.id === f.equipamentoId)?.tag ?? "—"}</span>,
    },
    { chave: "item", cabecalho: "Item", renderizar: (f) => f.itemTitulo },
    { chave: "ocorrencias", cabecalho: "Reprovações", renderizar: (f) => f.ocorrencias },
    {
      chave: "ultimaOcorrencia",
      cabecalho: "Última ocorrência",
      renderizar: (f) => new Date(f.ultimaOcorrenciaEm).toLocaleDateString("pt-BR"),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader titulo="Falhas mais recorrentes" subtitulo="Itens de checklist reprovados no histórico de 45 dias." />

      <Card densidade="densa">
        <h2 className="mb-4 font-medium text-foreground">Reprovações por tipo de equipamento</h2>
        <BarChart dados={dadosPorTipo} />
      </Card>

      <Card densidade="densa">
        <h2 className="mb-4 font-medium text-foreground">Itens mais reprovados</h2>
        {dadosPorItem.length === 0 ? (
          <p className="text-sm text-foreground-subtle">Nenhuma reprovação registrada ainda.</p>
        ) : (
          <BarChart dados={dadosPorItem} />
        )}
      </Card>

      <Card densidade="densa">
        <h2 className="mb-1 font-medium text-foreground">Falha recorrente por equipamento</h2>
        <p className="mb-4 text-sm text-foreground-muted">O mesmo item reprovado 2 vezes ou mais no mesmo equipamento.</p>
        <DataTable
          colunas={colunasRecorrencia}
          linhas={falhasRecorrentes}
          chaveLinha={(f) => `${f.equipamentoId}::${f.itemId}`}
          legendaVazia="Nenhuma reincidência registrada ainda."
        />
      </Card>
    </div>
  );
}
