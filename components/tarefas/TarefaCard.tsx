"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TAXONOMIA_STATUS_TAREFA } from "@/components/status/statusTaxonomy";
import type { Equipamento, Tarefa } from "@/lib/types";

export function TarefaCard({
  tarefa,
  equipamento,
  onCriarNovaPara,
}: {
  tarefa: Tarefa;
  equipamento: Equipamento | undefined;
  onCriarNovaPara?: (tag: string) => void;
}) {
  const router = useRouter();

  return (
    <Card densidade="densa" className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-foreground">{equipamento?.tag ?? "—"}</p>
          <p className="mt-0.5 line-clamp-2 text-sm text-foreground-muted">{tarefa.descricaoDemanda}</p>
        </div>
        <StatusBadge entrada={TAXONOMIA_STATUS_TAREFA[tarefa.status]} tamanho="sm" />
      </div>

      {tarefa.status === "rejeitada" && tarefa.decisao?.observacao && (
        <p className="text-sm text-status-avariado">{tarefa.decisao.observacao}</p>
      )}

      {tarefa.status === "aprovada" && equipamento && (
        <Button tamanho="sm" onClick={() => router.push(`/equipamento/${equipamento.tag}`)}>
          Iniciar
        </Button>
      )}

      {tarefa.status === "rejeitada" && equipamento && onCriarNovaPara && (
        <Button variante="secondary" tamanho="sm" onClick={() => onCriarNovaPara(equipamento.tag)}>
          Nova solicitação
        </Button>
      )}
    </Card>
  );
}
