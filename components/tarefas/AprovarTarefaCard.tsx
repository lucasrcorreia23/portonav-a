"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { agora, useRepositorio } from "@/lib/data/context";
import type { Equipamento, Operador, Perfil, Tarefa } from "@/lib/types";

/** Rótulo estável — este protótipo não tem login/identidade individual por perfil. */
const NOME_SUPERVISOR = "Supervisor";

export function AprovarTarefaCard({
  tarefa,
  equipamento,
  operador,
  perfilAtivo,
}: {
  tarefa: Tarefa;
  equipamento: Equipamento | undefined;
  operador: Operador | undefined;
  perfilAtivo: Perfil;
}) {
  const repo = useRepositorio();
  const [observacao, setObservacao] = useState("");

  function decidir(decisao: "aprovada" | "rejeitada") {
    const payload = {
      decididoPor: { perfil: perfilAtivo, nome: NOME_SUPERVISOR },
      decisao,
      decididoEm: agora().toISOString(),
      observacao: observacao.trim() || undefined,
    };
    if (decisao === "aprovada") {
      repo.tarefas.aprovar(tarefa.id, payload);
    } else {
      repo.tarefas.rejeitar(tarefa.id, payload);
    }
  }

  return (
    <Card densidade="densa" className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-neutral-900">{equipamento?.tag ?? "—"}</p>
          <p className="text-sm text-neutral-600">{operador?.nome ?? "—"}</p>
          <p className="mt-1 text-sm text-neutral-800">{tarefa.descricaoDemanda}</p>
        </div>
        {equipamento && (
          <Link href={`/equipamento/${equipamento.tag}`} className="shrink-0 text-sm text-brand-600 hover:underline">
            Ver ficha →
          </Link>
        )}
      </div>
      <Textarea rotulo="Observação (opcional)" value={observacao} onChange={(e) => setObservacao(e.target.value)} rows={2} />
      <div className="flex gap-2">
        <Button variante="danger" tamanho="sm" onClick={() => decidir("rejeitada")}>
          Rejeitar
        </Button>
        <Button tamanho="sm" onClick={() => decidir("aprovada")}>
          Aprovar
        </Button>
      </div>
    </Card>
  );
}
