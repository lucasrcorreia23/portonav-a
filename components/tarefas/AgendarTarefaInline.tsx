"use client";

import { useState } from "react";
import { DatePicker } from "@/components/ui/DatePicker";
import { Button } from "@/components/ui/Button";
import { useRepositorio } from "@/lib/data/context";
import type { Id } from "@/lib/types";

export function AgendarTarefaInline({
  tarefaId,
  onAgendado,
}: {
  tarefaId: Id;
  onAgendado: (agendamentoPara: string) => void;
}) {
  const repo = useRepositorio();
  const [data, setData] = useState<string | undefined>(undefined);

  function confirmar() {
    if (!data) return;
    const agendamentoPara = new Date(`${data}T08:00:00`).toISOString();
    repo.tarefas.reagendar(tarefaId, agendamentoPara);
    onAgendado(agendamentoPara);
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface-2 p-3">
      <DatePicker rotulo="Nova data de uso" valor={data} aoAlterar={setData} placeholder="Selecionar data" />
      <Button variante="secondary" tamanho="sm" disabled={!data} onClick={confirmar}>
        Confirmar agendamento
      </Button>
    </div>
  );
}
