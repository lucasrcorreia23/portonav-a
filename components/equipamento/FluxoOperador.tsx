"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, CheckCircle2, ClipboardList } from "lucide-react";
import { EquipmentIdentityCard } from "@/components/equipamento/EquipmentIdentityCard";
import { EquipmentStatusHero } from "@/components/equipamento/EquipmentStatusHero";
import { OrigemStatusNota } from "@/components/equipamento/OrigemStatusNota";
import { TAXONOMIA_STATUS_EQUIPAMENTO } from "@/components/status/statusTaxonomy";
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
      <div className="flex flex-1 flex-col gap-4">
        <EquipmentIdentityCard
          equipamento={equipamento}
          status={TAXONOMIA_STATUS_EQUIPAMENTO[equipamento.status]}
          preencherAltura
          acoes={
            <>
              {tarefaPendente ? (
                <Button tamanho="touch" larguraTotal onClick={() => router.push("/operador")}>
                  Ver minhas solicitações
                </Button>
              ) : (
                <Button
                  tamanho="touch"
                  larguraTotal
                  iconeEsquerda={<ClipboardList size={20} aria-hidden />}
                  onClick={() => router.push(`/operador?nova=1&tag=${equipamento.tag}`)}
                >
                  Criar solicitação para {equipamento.tag}
                </Button>
              )}
              <Button variante="ghost" tamanho="touch" larguraTotal onClick={() => router.push("/entrada")}>
                Voltar
              </Button>
            </>
          }
        >
          {/* Tom de atenção fixo: a pendência é da tarefa, não do equipamento — este aviso
              é o mesmo com a máquina disponível ou com apontamento. */}
          <div className="w-full rounded-card bg-status-apontamento-surface px-4 py-3 text-left">
            <h2 className="font-semibold text-status-apontamento">Nenhuma tarefa aprovada para este equipamento</h2>
            <p className="mt-1 text-sm text-foreground">
              {tarefaPendente
                ? "Sua solicitação está aguardando aprovação do supervisor."
                : "Registre a solicitação recebida do seu chefe antes de iniciar a verificação de pré-operação."}
            </p>
          </div>
        </EquipmentIdentityCard>
        <OrigemStatusNota ultimoEvento={ultimoEventoHistorico} />
      </div>
    );
  }

  // 1. Equipamento indisponível (bloqueado ou em manutenção) — nega ali mesmo.
  // Mesma peça de uma tela só da confirmação (card ocupando a altura, ação no rodapé),
  // no tom negativo: ilustração esmaecida, status do equipamento e o motivo da negativa
  // dentro do próprio card. A ação que sobra é remarcar a tarefa para outro dia.
  if (equipamento.status === "bloqueado" || equipamento.status === "em_manutencao") {
    const status = TAXONOMIA_STATUS_EQUIPAMENTO[equipamento.status];
    const motivo =
      equipamento.status === "bloqueado"
        ? equipamento.bloqueio?.motivo
        : equipamento.previsaoManutencao?.descricao;
    const quandoBloqueado = equipamento.bloqueio?.bloqueadoEm;
    return (
      <div className="flex flex-1 flex-col gap-4">
        <EquipmentIdentityCard
          equipamento={equipamento}
          status={status}
          tom="negativo"
          preencherAltura
          acoes={
            <>
              {tarefaAtiva &&
                !agendamentoConfirmado &&
                (mostrarAgendamento ? (
                  <AgendarTarefaInline tarefaId={tarefaAtiva.id} onAgendado={() => setAgendamentoConfirmado(true)} />
                ) : (
                  <Button
                    tamanho="touch"
                    larguraTotal
                    iconeEsquerda={<CalendarClock size={20} aria-hidden />}
                    onClick={() => setMostrarAgendamento(true)}
                  >
                    Agendar nova tarefa
                  </Button>
                ))}
              {agendamentoConfirmado && (
                <p className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-status-disponivel">
                  <CheckCircle2 size={16} aria-hidden /> Novo uso agendado.
                </p>
              )}
              <Button variante="secondary" tamanho="touch" onClick={() => router.push("/entrada")}>
                Voltar
              </Button>
            </>
          }
        >
          {/* Cor vem da taxonomia do status (vermelho no avariado, âmbar na manutenção),
              nunca fixa no componente. */}
          <div className={`w-full rounded-card px-4 py-3 text-left ${status.classeCor}`}>
            <h2 className="font-medium">Uso negado</h2>
            <p className="mt-1 text-sm text-foreground">{motivo ?? "Equipamento indisponível para uso."}</p>
            {equipamento.bloqueio && (
              <p className="mt-2 text-xs text-foreground-muted">
                Bloqueado por {equipamento.bloqueio.bloqueadoPor.nome}
                {quandoBloqueado &&
                  ` em ${new Date(quandoBloqueado).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}`}
              </p>
            )}
          </div>
        </EquipmentIdentityCard>
        <OrigemStatusNota ultimoEvento={ultimoEventoHistorico} />
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

  // 2b. Equipamento já está com o próprio operador — nada a iniciar de novo; o que resta
  // é devolver quando terminar.
  if (sessaoAberta && sessaoAberta.operadorId === operador.id) {
    return (
      <div className="flex flex-col gap-4">
        <EquipmentStatusHero equipamento={equipamento} />
        <OrigemStatusNota ultimoEvento={ultimoEventoHistorico} />
        <Card densidade="densa" className="border-status-em-uso/30 bg-status-em-uso-surface">
          <h2 className="mb-2 font-medium text-status-em-uso">Este equipamento está com você</h2>
          <p className="text-sm text-foreground">
            A verificação de pré-operação já foi feita. Use nas suas tarefas e devolva por aqui quando terminar.
          </p>
        </Card>
        <Button tamanho="touch" larguraTotal onClick={() => router.push(`/equipamento/${equipamento.tag}/sessao`)}>
          Devolver equipamento
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
  // Tela de uma peça só: o card ocupa toda a altura disponível em vez de deixar
  // espaço branco embaixo, com "Iniciar verificação" ancorado no rodapé.
  return (
    <div className="flex flex-1 flex-col gap-4">
      <EquipmentIdentityCard
        equipamento={equipamento}
        status={TAXONOMIA_STATUS_EQUIPAMENTO[equipamento.status]}
        preencherAltura
        acoes={
          <>
            <Button
              tamanho="touch"
              larguraTotal
              onClick={() => router.push(`/equipamento/${equipamento.tag}/checklist/1`)}
            >
              Iniciar verificação
            </Button>
            {/* Desistir aqui volta para a leitura do QR, não para a home: o operador
                continua no pátio, provavelmente indo para outro equipamento. */}
            <Button variante="ghost" tamanho="touch" larguraTotal onClick={() => router.push("/entrada")}>
              Cancelar
            </Button>
          </>
        }
      />
      <OrigemStatusNota ultimoEvento={ultimoEventoHistorico} />
    </div>
  );
}
