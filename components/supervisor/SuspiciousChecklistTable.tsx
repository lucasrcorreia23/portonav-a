"use client";

import { useState } from "react";
import { DataTable, type ColunaDataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { SuspicionReasonChips } from "@/components/supervisor/SuspicionReasonChips";
import { ReliabilityScoreBadge } from "@/components/operador/ReliabilityScoreBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TAXONOMIA_RESULTADO_CHECKLIST } from "@/components/status/statusTaxonomy";
import { useEquipamentos, useModelosChecklist, useOperadores } from "@/lib/data/context";
import type { ChecklistPreenchido } from "@/lib/types";

export function SuspiciousChecklistTable({ checklists }: { checklists: ChecklistPreenchido[] }) {
  const equipamentos = useEquipamentos();
  const operadores = useOperadores();
  const modelos = useModelosChecklist();
  const [emRevisao, setEmRevisao] = useState<ChecklistPreenchido | null>(null);

  const colunas: ColunaDataTable<ChecklistPreenchido>[] = [
    {
      chave: "data",
      cabecalho: "Data/hora",
      renderizar: (c) => new Date(c.concluidoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
    },
    {
      chave: "operador",
      cabecalho: "Operador",
      renderizar: (c) => operadores.find((o) => o.id === c.operadorId)?.nome ?? "—",
    },
    {
      chave: "equipamento",
      cabecalho: "Equipamento",
      renderizar: (c) => equipamentos.find((e) => e.id === c.equipamentoId)?.tag ?? "—",
    },
    { chave: "motivo", cabecalho: "Motivo", renderizar: (c) => <SuspicionReasonChips motivos={c.motivosSuspeita} /> },
    {
      chave: "score",
      cabecalho: "Score do operador",
      renderizar: (c) => <ReliabilityScoreBadge score={c.scoreConfiabilidadeNoMomento} />,
    },
  ];

  const equipamentoEmRevisao = emRevisao ? equipamentos.find((e) => e.id === emRevisao.equipamentoId) : undefined;
  const operadorEmRevisao = emRevisao ? operadores.find((o) => o.id === emRevisao.operadorId) : undefined;
  const modeloEmRevisao = emRevisao ? modelos.find((m) => m.id === emRevisao.modeloChecklistId) : undefined;
  const secoesEmRevisao = modeloEmRevisao?.secoes ?? [];

  return (
    <>
      <DataTable
        colunas={colunas}
        linhas={checklists}
        chaveLinha={(c) => c.id}
        aoClicarLinha={(c) => setEmRevisao(c)}
        legendaVazia="Nenhum checklist suspeito no momento."
      />

      <Modal aberto={emRevisao !== null} titulo="Revisar checklist" onFechar={() => setEmRevisao(null)} largura="lg">
        {emRevisao && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{equipamentoEmRevisao?.tag}</p>
                <p className="text-sm text-foreground-muted">{operadorEmRevisao?.nome}</p>
              </div>
              <StatusBadge entrada={TAXONOMIA_RESULTADO_CHECKLIST[emRevisao.resultado]} tamanho="sm" />
            </div>
            <SuspicionReasonChips motivos={emRevisao.motivosSuspeita} />
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Duração por seção</p>
              <ul className="flex flex-col gap-1 text-sm text-foreground-muted">
                {Object.entries(emRevisao.duracaoPorSecaoSegundos).map(([secaoId, segundos]) => (
                  <li key={secaoId} className="flex justify-between">
                    <span>{secoesEmRevisao.find((s) => s.id === secaoId)?.titulo ?? "Seção removida"}</span>
                    <span className="font-medium">{segundos}s</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-sm text-foreground-muted">Duração total: {emRevisao.duracaoTotalSegundos}s</p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
