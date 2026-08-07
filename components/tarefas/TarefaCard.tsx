"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TAXONOMIA_STATUS_EQUIPAMENTO, TAXONOMIA_STATUS_TAREFA } from "@/components/status/statusTaxonomy";
import type { Equipamento, Tarefa } from "@/lib/types";

export function TarefaCard({
  tarefa,
  equipamento,
  emUso = false,
  onCriarNovaPara,
}: {
  tarefa: Tarefa;
  equipamento: Equipamento | undefined;
  /**
   * O operador já está com este equipamento (sessão aberta). O card deixa de convidar a
   * iniciar e passa a ser o registro de que a máquina está com ele — selo "Em uso" e
   * devolução como única ação.
   */
  emUso?: boolean;
  onCriarNovaPara?: (tag: string) => void;
}) {
  const router = useRouter();

  // Aprovada é o estado esperado da lista — o selo só aparece quando algo foge disso.
  const mostrarSelo = tarefa.status !== "aprovada";
  // "Iniciar" também na pendente: leva ao gate do equipamento, que explica que a
  // solicitação aguarda aprovação — informa em vez de esconder o caminho.
  const podeIniciar = !emUso && (tarefa.status === "aprovada" || tarefa.status === "pendente") && equipamento;

  return (
    <Card densidade="densa" className="flex flex-col gap-4 shadow-card-operador">
      {/* Tag e selo dividem uma linha só; a descrição vem embaixo, na largura inteira do
          card. Enfiar a descrição na mesma coluna da tag espremia o selo contra a borda. */}
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 truncate text-foreground">{equipamento?.tag ?? "—"}</p>
          {emUso ? (
            <StatusBadge entrada={TAXONOMIA_STATUS_EQUIPAMENTO.em_uso} tamanho="sm" />
          ) : (
            mostrarSelo && <StatusBadge entrada={TAXONOMIA_STATUS_TAREFA[tarefa.status]} tamanho="sm" />
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-foreground-muted">{tarefa.descricaoDemanda}</p>
      </div>

      {tarefa.status === "rejeitada" && tarefa.decisao?.observacao && (
        <p className="text-sm text-status-avariado">{tarefa.decisao.observacao}</p>
      )}

      {podeIniciar && (
        <Button
          variante="secondary"
          tamanho="md"
          larguraTotal
          // Aprovada passa pela leitura do QR — é a retirada, e ela só vale com o operador
          // ao lado da máquina. Pendente vai direto para a ficha: o gate de lá é que explica
          // que falta aprovação, e mandar escanear antes faria o operador descobrir isso
          // depois do esforço.
          onClick={() =>
            router.push(
              tarefa.status === "aprovada"
                ? `/equipamento/${equipamento.tag}/iniciar`
                : `/equipamento/${equipamento.tag}`,
            )
          }
        >
          Iniciar
        </Button>
      )}

      {emUso && equipamento && (
        <Button tamanho="md" larguraTotal onClick={() => router.push(`/equipamento/${equipamento.tag}/sessao`)}>
          Devolver
        </Button>
      )}

      {tarefa.status === "rejeitada" && equipamento && onCriarNovaPara && (
        <Button variante="secondary" tamanho="touch" larguraTotal onClick={() => onCriarNovaPara(equipamento.tag)}>
          Nova solicitação
        </Button>
      )}
    </Card>
  );
}
