"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { EquipmentStatusHero } from "@/components/equipamento/EquipmentStatusHero";
import { OrigemStatusNota } from "@/components/equipamento/OrigemStatusNota";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ROTULO_TIPO_EQUIPAMENTO } from "@/components/equipamento/rotulos";
import { useRepositorio, useSessoes } from "@/lib/data/context";
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
  const router = useRouter();
  const [supervisorNotificado, setSupervisorNotificado] = useState(false);

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
          <p className="text-sm text-neutral-800">{motivo ?? "Equipamento indisponível para uso."}</p>
          {equipamento.bloqueio && (
            <p className="mt-2 text-xs text-neutral-600">
              Bloqueado por {equipamento.bloqueio.bloqueadoPor.nome}
              {quandoBloqueado &&
                ` em ${new Date(quandoBloqueado).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}`}
            </p>
          )}
        </Card>
        <Button variante="secondary" tamanho="touch" onClick={() => router.push("/entrada")}>
          Voltar
        </Button>
      </div>
    );
  }

  // 2. Equipamento já em uso por outra sessão aberta.
  const sessaoAberta = sessoes.find((s) => s.equipamentoId === equipamento.id && s.status === "em_andamento");
  if (sessaoAberta && sessaoAberta.operadorId !== operador.id) {
    return (
      <div className="flex flex-col gap-4">
        <EquipmentStatusHero equipamento={equipamento} />
        <OrigemStatusNota ultimoEvento={ultimoEventoHistorico} />
        <Card densidade="densa" className="border-status-em-uso/30 bg-status-em-uso-surface">
          <h2 className="mb-2 font-medium text-status-em-uso">Equipamento em uso</h2>
          <p className="text-sm text-neutral-800">Este equipamento já está em operação por outro operador no momento.</p>
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
          <p className="text-sm text-neutral-800">{detalhe}</p>
          <p className="mt-2 text-xs text-neutral-600">
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
