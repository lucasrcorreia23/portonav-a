"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ReliabilityScoreBadge } from "@/components/operador/ReliabilityScoreBadge";
import { TAXONOMIA_RESULTADO_CHECKLIST } from "@/components/status/statusTaxonomy";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useChecklistsPreenchidos, useEquipamentos, useOperadores } from "@/lib/data/context";

const ROTULO_TIPO: Record<string, string> = {
  empilhadeira: "Empilhadeira",
  reach_stacker: "Reach stacker",
  transpaleteira: "Transpaleteira",
};

export default function FichaOperadorPage(props: PageProps<"/admin/operadores/[operadorId]">) {
  const { operadorId } = use(props.params);
  const operadores = useOperadores();
  const checklists = useChecklistsPreenchidos();
  const equipamentos = useEquipamentos();
  const operador = operadores.find((o) => o.id === operadorId);

  if (!operador) {
    notFound();
  }

  const historicoOperador = checklists
    .filter((c) => c.operadorId === operadorId)
    .sort((a, b) => b.concluidoEm.localeCompare(a.concluidoEm));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader titulo={operador.nome} subtitulo={`Matrícula ${operador.matricula} · Turno ${operador.turnoPadrao}`} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card densidade="densa">
          <h2 className="mb-3 font-medium text-neutral-900">Habilitações</h2>
          <ul className="flex flex-col gap-2">
            {operador.habilitacoes.map((h) => (
              <li key={h.tipoEquipamento} className="flex items-center justify-between text-sm">
                <span>{ROTULO_TIPO[h.tipoEquipamento]}</span>
                <span className="text-neutral-500">{h.numeroCertificado}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card densidade="densa">
          <h2 className="mb-3 font-medium text-neutral-900">Score de confiabilidade</h2>
          <ReliabilityScoreBadge score={operador.scoreConfiabilidade} />
          <p className="mt-2 text-sm text-neutral-600">
            {historicoOperador.filter((c) => c.suspeito).length} checklist(s) suspeito(s) no histórico.
          </p>
        </Card>
      </div>

      <Card densidade="densa">
        <h2 className="mb-3 font-medium text-neutral-900">Histórico de checklists</h2>
        {historicoOperador.length === 0 ? (
          <p className="text-sm text-neutral-500">Nenhum checklist preenchido ainda.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-neutral-100">
            {historicoOperador.slice(0, 20).map((c) => {
              const eq = equipamentos.find((e) => e.id === c.equipamentoId);
              return (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">{eq?.tag ?? "—"}</p>
                    <p className="text-xs text-neutral-500">
                      {new Date(c.concluidoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.suspeito && (
                      <Badge
                        texto="Suspeito"
                        icone={<AlertTriangle size={12} aria-hidden />}
                        classeCor="text-status-avariado bg-status-avariado-surface"
                        tamanho="sm"
                      />
                    )}
                    <StatusBadge entrada={TAXONOMIA_RESULTADO_CHECKLIST[c.resultado]} tamanho="sm" />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
