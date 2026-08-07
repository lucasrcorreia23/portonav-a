"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { agora, useRepositorio } from "@/lib/data/context";
import { SUPERVISOR_PADRAO } from "@/lib/data/regras";
import type { Equipamento, Operador, Perfil, Tarefa } from "@/lib/types";

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
      // O perfil é o de quem está decidindo agora (supervisor ou admin); o nome é o único
      // da demo, para o histórico não mostrar dois aprovadores diferentes.
      decididoPor: { perfil: perfilAtivo, nome: SUPERVISOR_PADRAO.nome },
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
          <p className="font-medium text-foreground">{equipamento?.tag ?? "—"}</p>
          <p className="text-sm text-foreground-subtle">{operador?.nome ?? "—"}</p>
          <p className="mt-1 text-sm text-foreground-muted">{tarefa.descricaoDemanda}</p>
        </div>
        {equipamento && (
          <Link href={`/equipamento/${equipamento.tag}`} className="shrink-0 text-sm text-foreground-muted hover:underline">
            Ver ficha →
          </Link>
        )}
      </div>
      <Textarea rotulo="Observação (opcional)" value={observacao} onChange={(e) => setObservacao(e.target.value)} rows={2} />
      <div className="grid grid-cols-2 gap-2">
        <Button variante="secondary" onClick={() => decidir("rejeitada")}>
          Rejeitar
        </Button>
        <Button onClick={() => decidir("aprovada")}>
          Aprovar
        </Button>
      </div>
    </Card>
  );
}
