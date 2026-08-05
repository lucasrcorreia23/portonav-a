"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, CheckCircle2, ClipboardList } from "lucide-react";
import { EquipmentStatusHero } from "@/components/equipamento/EquipmentStatusHero";
import { OrigemStatusNota } from "@/components/equipamento/OrigemStatusNota";
import { AgendarTarefaInline } from "@/components/tarefas/AgendarTarefaInline";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ROTULO_TIPO_EQUIPAMENTO } from "@/components/equipamento/rotulos";
import { useRepositorio, useSessoes, useTarefas } from "@/lib/data/context";
import type { Equipamento, HistoricoEvento, Operador } from "@/lib/types";

export function FluxoOperador({
  equipamento,
  operador,
  ultimoEventoHistorico,
}: {
  equipamento: Equipamento;
  operador: Operador;
  ultimoEventoHistorico?: HistoricoEvento;
}) {
  const repo = useRepositorio();
  const sessoes = useSessoes();
  const tarefas = useTarefas();
  const router = useRouter();
  const [supervisorNotificado, setSupervisorNotificado] = useState(false);
  const [mostrarAgendamento, setMostrarAgendamento] = useState(false);
  const [agendamentoConfirmado, setAgendamentoConfirmado] = useState(false);

  const sessaoAberta = sessoes.find((s) => s.equipamentoId === equipamento.id && s.status === "em_andamento");
  const temSessaoPropria = sessaoAberta?.operadorId === operador.id;

  // 0. Sem tarefa aprovada para este par operador+equipamento — nega antes de qualquer
  // outra verificação (a solicitação precisa existir e ser aprovada antes do scan).
  // Uma sessão própria já em andamento dispensa a checagem (só pôde ter sido aberta
  // depois de passar por este mesmo gate).
  const tarefaAtiva = temSessaoPropria
    ? undefined
    : tarefas.find((t) => t.operadorId === operador.id && t.equipamentoId === equipamento.id && t.status === "aprovada");
  if (!temSessaoPropria && !tarefaAtiva) {
    const tarefaPendente = tarefas.find(
      (t) => t.operadorId === operador.id && t.equipamentoId === equipamento.id && t.status === "pendente",
    );
    return (
      <div className="flex flex-col gap-4">
        <EquipmentStatusHero equipamento={equipamento} />
        <OrigemStatusNota ultimoEvento={ultimoEventoHistorico} />
        <Card densidade="densa" className="border-status-apontamento/30 bg-status-apontamento-surface">
          <h2 className="mb-2 font-medium text-status-apontamento">Nenhuma tarefa aprovada para este equipamento</h2>
          <p className="text-sm text-foreground">
            {tarefaPendente
              ? "Sua solicitação está aguardando aprovação do supervisor."
              : "Registre a solicitação recebida do seu chefe antes de iniciar a verificação de pré-operação."}
          </p>
        </Card>
        {tarefaPendente ? (
          <Button tamanho="touch" larguraTotal onClick={() => router.push("/operador/tarefas")}>
            Ver minhas solicitações
          </Button>
        ) : (
          <Button
            tamanho="touch"
            larguraTotal
            iconeEsquerda={<ClipboardList size={20} aria-hidden />}
            onClick={() => router.push(`/operador/tarefas?nova=1&tag=${equipamento.tag}`)}
          >
            Criar solicitação para {equipamento.tag}
          </Button>
        )}
        <Button variante="ghost" tamanho="touch" onClick={() => router.push("/entrada")}>
          Voltar
        </Button>
      </div>
    );
  }

  // 1. Equipamento indisponível (bloqueado ou em manutenção) — nega ali mesmo.
  if (equipamento.status === "bloqueado" || equipamento.status === "em_manutencao") {
    const motivo =
      equipamento.status === "bloqueado"
        ? equipamento.bloqueio?.motivo
        : equipamento.previsaoManutencao?.descricao;
    const quandoBloqueado = equipamento.bloqueio?.bloqueadoEm;
    return (
      <div className="flex flex-col gap-4">
        <EquipmentStatusHero equipamento={equipamento} />
        <OrigemStatusNota ultimoEvento={ultimoEventoHistorico} />
        <Card densidade="densa" className="border-status-avariado/30 bg-status-avariado-surface">
          <h2 className="mb-2 font-medium text-status-avariado">Uso negado</h2>
          <p className="text-sm text-foreground">{motivo ?? "Equipamento indisponível para uso."}</p>
          {equipamento.bloqueio && (
            <p className="mt-2 text-xs text-foreground-muted">
              Bloqueado por {equipamento.bloqueio.bloqueadoPor.nome}
              {quandoBloqueado &&
                ` em ${new Date(quandoBloqueado).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}`}
            </p>
          )}
        </Card>
        {tarefaAtiva && !agendamentoConfirmado && (
          <>
            {mostrarAgendamento ? (
              <AgendarTarefaInline tarefaId={tarefaAtiva.id} onAgendado={() => setAgendamentoConfirmado(true)} />
            ) : (
              <Button
                variante="secondary"
                tamanho="touch"
                iconeEsquerda={<CalendarClock size={18} aria-hidden />}
                onClick={() => setMostrarAgendamento(true)}
              >
                Fazer agendamento
              </Button>
            )}
          </>
        )}
        {agendamentoConfirmado && (
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-status-disponivel">
            <CheckCircle2 size={16} aria-hidden /> Novo uso agendado.
          </p>
        )}
        <Button variante="secondary" tamanho="touch" onClick={() => router.push("/entrada")}>
          Voltar
        </Button>
      </div>
    );
  }

  // 2. Equipamento já em uso por outra sessão aberta.
  if (sessaoAberta && sessaoAberta.operadorId !== operador.id) {
    return (
      <div className="flex flex-col gap-4">
        <EquipmentStatusHero equipamento={equipamento} />
        <OrigemStatusNota ultimoEvento={ultimoEventoHistorico} />
        <Card densidade="densa" className="border-status-em-uso/30 bg-status-em-uso-surface">
          <h2 className="mb-2 font-medium text-status-em-uso">Equipamento em uso</h2>
          <p className="text-sm text-foreground">Este equipamento já está em operação por outro operador no momento.</p>
        </Card>
        <Button variante="secondary" tamanho="touch" onClick={() => router.push("/entrada")}>
          Voltar
        </Button>
      </div>
    );
  }

  // 2b. Sessão já aberta pelo próprio operador — retomar em vez de recomeçar.
  if (sessaoAberta && sessaoAberta.operadorId === operador.id) {
    return (
      <div className="flex flex-col gap-4">
        <EquipmentStatusHero equipamento={equipamento} />
        <OrigemStatusNota ultimoEvento={ultimoEventoHistorico} />
        <Button tamanho="touch" larguraTotal onClick={() => router.push(`/equipamento/${equipamento.tag}/sessao`)}>
          Voltar para a operação em andamento
        </Button>
      </div>
    );
  }

  // 3. Verificação de habilitação.
  const habilitado = repo.operadores.possuiHabilitacaoValida(operador.id, equipamento.tipo);
  if (!habilitado) {
    const habilitacao = operador.habilitacoes.find((h) => h.tipoEquipamento === equipamento.tipo);
    const detalhe = !habilitacao
      ? `${operador.nome} não possui habilitação registrada para ${ROTULO_TIPO_EQUIPAMENTO[equipamento.tipo]}.`
      : `Habilitação ${habilitacao.numeroCertificado} para ${ROTULO_TIPO_EQUIPAMENTO[equipamento.tipo]} venceu em ${new Date(habilitacao.validoAte!).toLocaleDateString("pt-BR")}.`;
    return (
      <div className="flex flex-col gap-4">
        <EquipmentStatusHero equipamento={equipamento} />
        <OrigemStatusNota ultimoEvento={ultimoEventoHistorico} />
        <Card densidade="densa" className="border-status-avariado/30 bg-status-avariado-surface">
          <h2 className="mb-2 font-medium text-status-avariado">Uso negado</h2>
          <p className="text-sm text-foreground">{detalhe}</p>
          <p className="mt-2 text-xs text-foreground-muted">
            Habilitação é somente leitura aqui, sincronizada do portal corporativo — regularização é responsabilidade
            do supervisor junto ao portal.
          </p>
        </Card>
        {supervisorNotificado ? (
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-status-disponivel">
            <CheckCircle2 size={16} aria-hidden /> Supervisor notificado.
          </p>
        ) : (
          <Button variante="secondary" tamanho="touch" onClick={() => setSupervisorNotificado(true)}>
            Notificar supervisor
          </Button>
        )}
        <Button variante="ghost" tamanho="touch" onClick={() => router.push("/entrada")}>
          Voltar
        </Button>
      </div>
    );
  }

  // 4. Liberado para iniciar a verificação de pré-operação.
  return (
    <div className="flex flex-col gap-4">
      <EquipmentStatusHero equipamento={equipamento} />
      <OrigemStatusNota ultimoEvento={ultimoEventoHistorico} />
      <Button tamanho="touch" larguraTotal onClick={() => router.push(`/equipamento/${equipamento.tag}/checklist/1`)}>
        Iniciar verificação de pré-operação
      </Button>
    </div>
  );
}
