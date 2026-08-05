"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ReliabilityScoreBadge } from "@/components/operador/ReliabilityScoreBadge";
import { TAXONOMIA_RESULTADO_CHECKLIST } from "@/components/status/statusTaxonomy";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ROTULO_TIPO_EQUIPAMENTO } from "@/components/equipamento/rotulos";
import { useChecklistsPreenchidos, useEquipamentos, useEstadoDemo, useOperadores } from "@/lib/data/context";

const SETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000;

export default function FichaOperadorPage(props: PageProps<"/admin/operadores/[operadorId]">) {
  const { operadorId } = use(props.params);
  const operadores = useOperadores();
  const checklists = useChecklistsPreenchidos();
  const equipamentos = useEquipamentos();
  const demo = useEstadoDemo();
  // Real, capturado uma única vez — somado ao deslocamento do "avançar o tempo" para
  // decidir vencimento de habilitação sem chamar Date.now() no render.
  const [agoraRealMs] = useState(() => Date.now());
  const agoraSimuladoMs = agoraRealMs + demo.deslocamentoTempoMs;
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
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-medium text-foreground">Habilitações</h2>
            <span className="text-xs text-foreground-subtle">Somente leitura — sincronizado do portal</span>
          </div>
          <ul className="flex flex-col gap-2">
            {operador.habilitacoes.map((h) => {
              const vencimentoMs = h.validoAte ? new Date(h.validoAte).getTime() : null;
              const vencida = vencimentoMs !== null && vencimentoMs < agoraSimuladoMs;
              const venceEmBreve = vencimentoMs !== null && !vencida && vencimentoMs - agoraSimuladoMs < SETE_DIAS_MS;
              return (
                <li
                  key={h.tipoEquipamento}
                  className="flex flex-col gap-1 border-b border-border pb-2 text-sm last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span>{ROTULO_TIPO_EQUIPAMENTO[h.tipoEquipamento]}</span>
                    <span className="text-foreground-subtle">{h.numeroCertificado}</span>
                  </div>
                  {h.validoAte ? (
                    <Badge
                      texto={
                        vencida
                          ? `Vencida em ${new Date(h.validoAte).toLocaleDateString("pt-BR")}`
                          : `Válida até ${new Date(h.validoAte).toLocaleDateString("pt-BR")}`
                      }
                      icone={<AlertTriangle size={12} aria-hidden />}
                      classeCor={
                        vencida || venceEmBreve
                          ? "text-status-avariado bg-status-avariado-surface"
                          : "text-foreground-muted bg-surface-3"
                      }
                      tamanho="sm"
                    />
                  ) : (
                    <Badge
                      texto="Sem validade"
                      icone={<CheckCircle2 size={12} aria-hidden />}
                      classeCor="text-status-disponivel bg-status-disponivel-surface"
                      tamanho="sm"
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
        <Card densidade="densa">
          <h2 className="mb-3 font-medium text-foreground">Score de confiabilidade</h2>
          <ReliabilityScoreBadge score={operador.scoreConfiabilidade} />
          <p className="mt-2 text-sm text-foreground-muted">
            {historicoOperador.filter((c) => c.suspeito).length} checklist(s) suspeito(s) no histórico.
          </p>
        </Card>
      </div>

      <Card densidade="densa">
        <h2 className="mb-3 font-medium text-foreground">Histórico de checklists</h2>
        {historicoOperador.length === 0 ? (
          <p className="text-sm text-foreground-subtle">Nenhum checklist preenchido ainda.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {historicoOperador.slice(0, 20).map((c) => {
              const eq = equipamentos.find((e) => e.id === c.equipamentoId);
              return (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{eq?.tag ?? "—"}</p>
                    <p className="text-xs text-foreground-subtle">
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
