"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { LineChart } from "@/components/charts/LineChart";
import { useChecklistsPreenchidos } from "@/lib/data/context";

export default function DisponibilidadePage() {
  const checklists = useChecklistsPreenchidos();

  const porDia = new Map<string, { total: number; disponiveis: number }>();
  for (const c of checklists) {
    const dia = c.concluidoEm.slice(0, 10);
    const atual = porDia.get(dia) ?? { total: 0, disponiveis: 0 };
    atual.total += 1;
    if (c.resultado !== "bloqueado") atual.disponiveis += 1;
    porDia.set(dia, atual);
  }

  const pontos = [...porDia.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([dia, { total, disponiveis }]) => ({
      rotulo: new Date(dia).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      valor: Math.round((disponiveis / total) * 100),
    }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Disponibilidade da frota"
        subtitulo="Percentual de checklists diários que não resultaram em bloqueio — proxy de disponibilidade operacional."
      />
      <Card densidade="densa">
        {pontos.length === 0 ? (
          <p className="text-sm text-neutral-500">Sem dados suficientes ainda.</p>
        ) : (
          <LineChart pontos={pontos} sufixo="%" />
        )}
      </Card>
    </div>
  );
}
