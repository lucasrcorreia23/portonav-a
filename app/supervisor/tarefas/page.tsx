"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { AprovarTarefaCard } from "@/components/tarefas/AprovarTarefaCard";
import { useEquipamentos, useEstadoDemo, useOperadores, useTarefas } from "@/lib/data/context";

export default function TarefasPendentesPage() {
  const tarefas = useTarefas();
  const equipamentos = useEquipamentos();
  const operadores = useOperadores();
  const demo = useEstadoDemo();

  const pendentes = tarefas.filter((t) => t.status === "pendente").sort((a, b) => a.criadaEm.localeCompare(b.criadaEm));

  return (
    <div>
      <PageHeader
        titulo="Tarefas"
        subtitulo="Solicitações criadas pelos operadores, aguardando aprovação para escanear o equipamento."
      />
      {pendentes.length === 0 ? (
        <p className="text-sm text-neutral-500">Nenhuma solicitação pendente.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {pendentes.map((tarefa) => (
            <AprovarTarefaCard
              key={tarefa.id}
              tarefa={tarefa}
              equipamento={equipamentos.find((e) => e.id === tarefa.equipamentoId)}
              operador={operadores.find((o) => o.id === tarefa.operadorId)}
              perfilAtivo={demo.perfilAtivo}
            />
          ))}
        </div>
      )}
    </div>
  );
}
