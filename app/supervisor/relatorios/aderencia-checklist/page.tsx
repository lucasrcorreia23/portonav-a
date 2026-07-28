"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { BarChart } from "@/components/charts/BarChart";
import { useChecklistsPreenchidos, useOperadores } from "@/lib/data/context";
import type { Turno } from "@/lib/types";

const ROTULO_TURNO: Record<Turno, string> = { manha: "Manhã", tarde: "Tarde", noite: "Noite" };

export default function AderenciaChecklistPage() {
  const checklists = useChecklistsPreenchidos();
  const operadores = useOperadores();

  const porTurno: Record<Turno, { total: number; naoSuspeitos: number }> = {
    manha: { total: 0, naoSuspeitos: 0 },
    tarde: { total: 0, naoSuspeitos: 0 },
    noite: { total: 0, naoSuspeitos: 0 },
  };

  for (const c of checklists) {
    const operador = operadores.find((o) => o.id === c.operadorId);
    if (!operador) continue;
    porTurno[operador.turnoPadrao].total += 1;
    if (!c.suspeito) porTurno[operador.turnoPadrao].naoSuspeitos += 1;
  }

  const dados = (Object.keys(porTurno) as Turno[]).map((turno) => {
    const { total, naoSuspeitos } = porTurno[turno];
    return { rotulo: ROTULO_TURNO[turno], valor: total > 0 ? Math.round((naoSuspeitos / total) * 100) : 0 };
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Aderência ao checklist por turno"
        subtitulo="Percentual de preenchimentos sem sinais de suspeita, por turno do operador."
      />
      <Card densidade="densa">
        <BarChart dados={dados} formatarValor={(v) => `${v}%`} />
      </Card>
    </div>
  );
}
