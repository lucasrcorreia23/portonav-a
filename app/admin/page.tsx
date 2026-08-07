"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  Ban,
  ClipboardCheck,
  ClipboardList,
  Percent,
  ShieldCheck,
  Truck,
  Users,
  Wrench,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/charts/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ModuleStatusCard } from "@/components/admin/ModuleStatusCard";
import { FleetStatusDistribution } from "@/components/supervisor/FleetStatusDistribution";
import { TAXONOMIA_RESULTADO_CHECKLIST, TAXONOMIA_STATUS_CHAMADO } from "@/components/status/statusTaxonomy";
import { ROTULO_PERFIL } from "@/components/perfil/rotulos";
import { REGRA_APROVACAO_TAREFA_PADRAO, REGRA_LIBERACAO_PADRAO } from "@/lib/data/regras";
import {
  useApontamentos,
  useChamados,
  useChecklistsPreenchidos,
  useEquipamentos,
  useEstadoDemo,
  useModelosChecklist,
  useOperadores,
  useSincronizacaoPortal,
  useTarefas,
} from "@/lib/data/context";
import type { PrioridadeChamado, SincronizacaoPortal, StatusChamado } from "@/lib/types";

const SETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000;

/** Chamados concluídos não entram no painel — só o que ainda exige alguém. */
const ORDEM_STATUS_CHAMADO_ABERTO: StatusChamado[] = ["aberto", "em_atendimento", "aguardando_liberacao"];

const ROTULO_PRIORIDADE: Record<PrioridadeChamado, string> = {
  alta: "Prioridade alta",
  media: "Prioridade média",
  baixa: "Prioridade baixa",
};

const ROTULO_STATUS_SINCRONIZACAO: Record<SincronizacaoPortal["status"], string> = {
  nunca_sincronizado: "Nunca sincronizado",
  sincronizado: "Sincronizado",
  sincronizando: "Sincronizando…",
  falha: "Falha na sincronização",
};

function formatarDataHora(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export default function AdminHomePage() {
  const equipamentos = useEquipamentos();
  const operadores = useOperadores();
  const modelos = useModelosChecklist();
  const checklists = useChecklistsPreenchidos();
  const apontamentos = useApontamentos();
  const chamados = useChamados();
  const tarefas = useTarefas();
  const sincronizacao = useSincronizacaoPortal();
  const demo = useEstadoDemo();

  // Real, capturado uma única vez — somado ao deslocamento do "avançar o tempo", como na ficha
  // do operador. Evita Date.now() no render, que mudaria a cada re-render do store.
  const [agoraRealMs] = useState(() => Date.now());
  const agoraSimuladoMs = agoraRealMs + demo.deslocamentoTempoMs;
  const inicioDoDiaISO = new Date(new Date(agoraSimuladoMs).setHours(0, 0, 0, 0)).toISOString();

  // --- Frota ---
  const indisponiveis = equipamentos.filter((e) => e.status === "bloqueado" || e.status === "em_manutencao");
  const disponibilidadePercentual = Math.round(
    ((equipamentos.length - indisponiveis.length) / (equipamentos.length || 1)) * 100,
  );

  // --- Operação em curso nos outros módulos ---
  const apontamentosAbertos = apontamentos.filter((a) => a.status !== "resolvido");
  const chamadosAbertos = chamados.filter((c) => c.status !== "concluido");
  const checklistsRecentes = [...checklists].sort((a, b) => b.concluidoEm.localeCompare(a.concluidoEm));
  const checklistsHoje = checklistsRecentes.filter((c) => c.concluidoEm >= inicioDoDiaISO);
  const suspeitos = checklists.filter((c) => c.suspeito);
  const tarefasPendentes = tarefas
    .filter((t) => t.status === "pendente")
    .sort((a, b) => b.criadaEm.localeCompare(a.criadaEm));

  // --- Modelos de checklist ---
  const modelosAtivos = modelos.filter((m) => m.ativo);
  const itensAtivos = modelosAtivos.flatMap((m) => m.secoes.flatMap((s) => s.itens));
  const itensQueBloqueiam = itensAtivos.filter((i) => i.modoTratamento === "bloqueia").length;
  const ultimaEdicaoModelo = modelos.reduce<string | null>(
    (maisRecente, m) => (maisRecente === null || m.atualizadoEm > maisRecente ? m.atualizadoEm : maisRecente),
    null,
  );

  // --- Operadores ---
  const operadoresAtivos = operadores.filter((o) => o.ativo);
  const scoreMedio = Math.round(
    operadoresAtivos.reduce((soma, o) => soma + o.scoreConfiabilidade, 0) / (operadoresAtivos.length || 1),
  );
  const habilitacoesEmRisco = operadores.filter((o) =>
    o.habilitacoes.some((h) => h.validoAte && new Date(h.validoAte).getTime() - agoraSimuladoMs < SETE_DIAS_MS),
  ).length;

  function tagDoEquipamento(equipamentoId: string) {
    return equipamentos.find((e) => e.id === equipamentoId)?.tag ?? "—";
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Visão geral"
        subtitulo="Estado dos cadastros e o que está acontecendo agora em cada módulo."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard titulo="Equipamentos cadastrados" valor={equipamentos.length} icone={Truck} href="/admin/equipamentos" />
        <StatCard titulo="Disponibilidade da frota" valor={`${disponibilidadePercentual}%`} icone={Percent} tom="disponivel" />
        <StatCard titulo="Bloqueados/em manutenção" valor={indisponiveis.length} icone={Ban} tom="avariado" />
        <StatCard titulo="Apontamentos abertos" valor={apontamentosAbertos.length} icone={AlertTriangle} tom="apontamento" />
        <StatCard titulo="Chamados em aberto" valor={chamadosAbertos.length} icone={Wrench} tom="apontamento" />
        <StatCard titulo="Checklists preenchidos hoje" valor={checklistsHoje.length} icone={ClipboardCheck} />
      </div>

      <section>
        <h2 className="mb-3 font-medium text-foreground">Módulos</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ModuleStatusCard
            href="/admin/equipamentos"
            titulo="Equipamentos"
            icone={Truck}
            destaque={`${equipamentos.length} equipamentos com tag e QR`}
            metricas={[
              { rotulo: "Disponíveis", valor: equipamentos.filter((e) => e.status === "disponivel").length },
              { rotulo: "Em uso", valor: equipamentos.filter((e) => e.status === "em_uso").length },
              { rotulo: "Com apontamento", valor: equipamentos.filter((e) => e.status === "com_apontamento").length },
              { rotulo: "Indisponíveis", valor: indisponiveis.length },
            ]}
            nota={
              indisponiveis.length > 0
                ? `${indisponiveis.length} fora de operação — ver motivo na ficha de cada equipamento.`
                : "Nenhum equipamento fora de operação."
            }
          />

          <ModuleStatusCard
            href="/admin/checklists"
            titulo="Modelos de checklist"
            icone={ClipboardList}
            destaque={`${modelosAtivos.length} de ${modelos.length} modelos ativos`}
            metricas={[
              { rotulo: "Itens ativos", valor: itensAtivos.length },
              { rotulo: "Itens que bloqueiam", valor: itensQueBloqueiam },
              { rotulo: "Itens que alertam", valor: itensAtivos.length - itensQueBloqueiam },
              { rotulo: "Preenchidos hoje", valor: checklistsHoje.length },
            ]}
            nota={
              ultimaEdicaoModelo
                ? `Última edição de modelo em ${formatarDataHora(ultimaEdicaoModelo)}.`
                : "Nenhum modelo editado ainda."
            }
          />

          <ModuleStatusCard
            href="/admin/operadores"
            titulo="Operadores"
            icone={Users}
            destaque={`${operadoresAtivos.length} operadores ativos`}
            metricas={[
              { rotulo: "Score médio", valor: scoreMedio },
              { rotulo: "Habilitação vencendo", valor: habilitacoesEmRisco },
              { rotulo: "Checklists suspeitos", valor: suspeitos.length },
            ]}
            nota={
              <>
                {ROTULO_STATUS_SINCRONIZACAO[sincronizacao.status]}
                {sincronizacao.ultimaSincronizacaoEm
                  ? ` · última sincronização em ${formatarDataHora(sincronizacao.ultimaSincronizacaoEm)}.`
                  : " com o portal corporativo."}
              </>
            }
          />

          <ModuleStatusCard
            href="/admin/regras"
            titulo="Regras"
            icone={ShieldCheck}
            destaque="Regras de negócio vigentes"
            metricas={[
              {
                rotulo: "Aprovam tarefa",
                valor: REGRA_APROVACAO_TAREFA_PADRAO.perfisPermitidos.map((p) => ROTULO_PERFIL[p]).join(", "),
              },
              {
                rotulo: "Liberam equipamento",
                valor: REGRA_LIBERACAO_PADRAO.perfisPermitidos.map((p) => ROTULO_PERFIL[p]).join(", "),
              },
              { rotulo: "Tarefas aguardando", valor: tarefasPendentes.length },
              { rotulo: "Reparos aguardando liberação", valor: chamados.filter((c) => c.status === "aguardando_liberacao").length },
            ]}
          />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card densidade="densa">
          <h2 className="mb-3 font-medium text-foreground">Distribuição de status da frota</h2>
          <FleetStatusDistribution equipamentos={equipamentos} />
        </Card>

        <Card densidade="densa">
          <h2 className="mb-3 font-medium text-foreground">Manutenção — chamados em aberto</h2>
          {chamadosAbertos.length === 0 ? (
            <p className="text-sm text-foreground-subtle">Nenhum chamado em aberto.</p>
          ) : (
            <>
              <ul className="mb-3 flex flex-wrap gap-2">
                {ORDEM_STATUS_CHAMADO_ABERTO.map((status) => (
                  <li key={status} className="inline-flex items-center gap-1.5">
                    <StatusBadge entrada={TAXONOMIA_STATUS_CHAMADO[status]} tamanho="sm" />
                    <span className="text-sm font-medium text-foreground">
                      {chamados.filter((c) => c.status === status).length}
                    </span>
                  </li>
                ))}
              </ul>
              <ul className="flex flex-col divide-y divide-border">
                {chamadosAbertos.slice(0, 6).map((chamado) => (
                  <li key={chamado.id} className="py-2.5">
                    <Link
                      href={`/equipamento/${tagDoEquipamento(chamado.equipamentoId)}`}
                      className="flex items-center justify-between gap-2 hover:text-info"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{tagDoEquipamento(chamado.equipamentoId)}</p>
                        <p className="truncate text-xs text-foreground-subtle">
                          {ROTULO_PRIORIDADE[chamado.prioridade]} ·{" "}
                          {chamado.apontamentoIds.length === 1
                            ? "1 apontamento"
                            : `${chamado.apontamentoIds.length} apontamentos`}
                        </p>
                      </div>
                      <StatusBadge entrada={TAXONOMIA_STATUS_CHAMADO[chamado.status]} tamanho="sm" />
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card densidade="densa">
          <h2 className="mb-3 font-medium text-foreground">Checklists preenchidos recentemente</h2>
          {checklistsRecentes.length === 0 ? (
            <p className="text-sm text-foreground-subtle">Nenhum checklist preenchido ainda.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {checklistsRecentes.slice(0, 6).map((checklist) => {
                const operador = operadores.find((o) => o.id === checklist.operadorId);
                return (
                  <li key={checklist.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {tagDoEquipamento(checklist.equipamentoId)}
                        <span className="font-normal text-foreground-subtle"> · {operador?.nome ?? "—"}</span>
                      </p>
                      <p className="text-xs text-foreground-subtle">
                        {formatarDataHora(checklist.concluidoEm)}
                        {checklist.suspeito && (
                          <span className="ml-1.5 inline-flex items-center gap-1 text-status-apontamento">
                            <AlertTriangle size={11} aria-hidden /> em revisão
                          </span>
                        )}
                      </p>
                    </div>
                    <StatusBadge entrada={TAXONOMIA_RESULTADO_CHECKLIST[checklist.resultado]} tamanho="sm" />
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card densidade="densa">
          <h2 className="mb-3 font-medium text-foreground">Solicitações de tarefa aguardando aprovação</h2>
          {tarefasPendentes.length === 0 ? (
            <p className="text-sm text-foreground-subtle">Nenhuma solicitação pendente.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {tarefasPendentes.slice(0, 6).map((tarefa) => {
                const operador = operadores.find((o) => o.id === tarefa.operadorId);
                return (
                  <li key={tarefa.id} className="py-2.5">
                    <p className="text-sm font-medium">
                      {tagDoEquipamento(tarefa.equipamentoId)}
                      <span className="font-normal text-foreground-subtle"> · {operador?.nome ?? "—"}</span>
                    </p>
                    <p className="truncate text-xs text-foreground-subtle">{tarefa.descricaoDemanda}</p>
                    <p className="text-xs text-foreground-subtle">Solicitada em {formatarDataHora(tarefa.criadaEm)}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
