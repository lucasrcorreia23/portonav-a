"use client";

import Link from "next/link";
import { AlertTriangle, Ban, ClipboardCheck, Hourglass, Percent } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/charts/StatCard";
import { SuspiciousChecklistTable } from "@/components/supervisor/SuspiciousChecklistTable";
import { FleetStatusDistribution } from "@/components/supervisor/FleetStatusDistribution";
import { useApontamentos, useChamados, useChecklistsPreenchidos, useEquipamentos } from "@/lib/data/context";

export default function SupervisorPainelPage() {
  const equipamentos = useEquipamentos();
  const apontamentos = useApontamentos();
  const checklists = useChecklistsPreenchidos();
  const chamados = useChamados();

  const bloqueados = equipamentos.filter((e) => e.status === "bloqueado" || e.status === "em_manutencao");
  const apontamentosAbertos = apontamentos.filter((a) => a.status !== "resolvido");
  const suspeitos = checklists.filter((c) => c.suspeito).sort((a, b) => b.concluidoEm.localeCompare(a.concluidoEm));
  const aguardandoLiberacao = chamados.filter((c) => c.status === "aguardando_liberacao");
  const disponibilidadePercentual = Math.round(
    (equipamentos.filter((e) => e.status !== "bloqueado" && e.status !== "em_manutencao").length / (equipamentos.length || 1)) * 100,
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader titulo="Painel do supervisor" subtitulo="Visão geral da frota em tempo real." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard titulo="Bloqueados/em manutenção" valor={bloqueados.length} icone={Ban} tom="avariado" />
        <StatCard titulo="Apontamentos abertos" valor={apontamentosAbertos.length} icone={AlertTriangle} tom="apontamento" />
        <StatCard
          titulo="Checklists suspeitos"
          valor={suspeitos.length}
          icone={ClipboardCheck}
          tom="apontamento"
          href="/supervisor/checklists-suspeitos"
        />
        <StatCard
          titulo="Aguardando aprovação"
          valor={aguardandoLiberacao.length}
          icone={Hourglass}
          tom="apontamento"
          href="/supervisor/liberacoes"
        />
        <StatCard titulo="Disponibilidade da frota" valor={`${disponibilidadePercentual}%`} icone={Percent} tom="disponivel" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card densidade="densa">
          <h2 className="mb-3 font-medium text-foreground">Equipamentos bloqueados ou em manutenção</h2>
          {bloqueados.length === 0 ? (
            <p className="text-sm text-foreground-subtle">Nenhum equipamento bloqueado ou em manutenção.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {bloqueados.map((eq) => (
                <li key={eq.id} className="py-2.5">
                  <Link href={`/equipamento/${eq.tag}`} className="flex items-center justify-between gap-2 hover:text-info">
                    <div>
                      <p className="text-sm font-medium">{eq.tag}</p>
                      <p className="text-xs text-foreground-subtle">{eq.bloqueio?.motivo ?? eq.previsaoManutencao?.descricao}</p>
                    </div>
                    <span className="text-xs text-foreground-subtle">
                      {eq.bloqueio && new Date(eq.bloqueio.bloqueadoEm).toLocaleDateString("pt-BR")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card densidade="densa">
          <h2 className="mb-3 font-medium text-foreground">Apontamentos abertos</h2>
          {apontamentosAbertos.length === 0 ? (
            <p className="text-sm text-foreground-subtle">Nenhum apontamento em aberto.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {apontamentosAbertos.slice(0, 8).map((ap) => {
                const eq = equipamentos.find((e) => e.id === ap.equipamentoId);
                return (
                  <li key={ap.id} className="py-2.5">
                    <Link href={`/equipamento/${eq?.tag}`} className="flex items-center justify-between gap-2 hover:text-info">
                      <div>
                        <p className="text-sm font-medium">{eq?.tag}</p>
                        <p className="text-xs text-foreground-subtle">{ap.origem.itemTitulo}</p>
                      </div>
                      <span className="text-xs text-foreground-subtle">{new Date(ap.criadoEm).toLocaleDateString("pt-BR")}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <Card densidade="densa">
        <h2 className="mb-3 font-medium text-foreground">Checklists em revisão</h2>
        <SuspiciousChecklistTable checklists={suspeitos} />
      </Card>

      <Card densidade="densa">
        <h2 className="mb-3 font-medium text-foreground">Distribuição de status da frota</h2>
        <FleetStatusDistribution equipamentos={equipamentos} />
      </Card>
    </div>
  );
}
