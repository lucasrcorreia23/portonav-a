"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { OperatorShell } from "@/components/layout/OperatorShell";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { EmptyState } from "@/components/ui/EmptyState";
import { TarefaCard } from "@/components/tarefas/TarefaCard";
import { TarefaForm } from "@/components/tarefas/TarefaForm";
import { alternarPerfil, useEquipamentos, useEstadoDemo, useOperadores, useTarefas } from "@/lib/data/context";

export default function MinhasTarefasPage() {
  const searchParams = useSearchParams();
  const demo = useEstadoDemo();
  const tarefas = useTarefas();
  const equipamentos = useEquipamentos();
  const operadores = useOperadores();
  const operadorAtivoId = demo.operadorAtivoId ?? operadores[0]?.id ?? null;

  const [drawerAberto, setDrawerAberto] = useState(() => searchParams.get("nova") === "1");
  const [tagParaNovaTarefa, setTagParaNovaTarefa] = useState<string | undefined>(searchParams.get("tag") ?? undefined);

  useEffect(() => {
    if (demo.perfilAtivo !== "operador" || demo.operadorAtivoId !== operadorAtivoId) {
      alternarPerfil("operador", operadorAtivoId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo.perfilAtivo, demo.operadorAtivoId, operadorAtivoId]);

  const minhasTarefas = tarefas
    .filter((t) => t.operadorId === operadorAtivoId)
    .sort((a, b) => b.criadaEm.localeCompare(a.criadaEm));

  function abrirNova(tag?: string) {
    setTagParaNovaTarefa(tag);
    setDrawerAberto(true);
  }

  return (
    <OperatorShell>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-display-sm text-foreground">Minhas solicitações</h1>
          <p className="mt-1 text-sm text-foreground-muted">Registre a demanda recebida do chefe antes de escanear o equipamento.</p>
        </div>
      </div>

      <Button tamanho="touch" larguraTotal iconeEsquerda={<ClipboardList size={20} aria-hidden />} onClick={() => abrirNova(undefined)}>
        Nova solicitação
      </Button>

      {minhasTarefas.length === 0 ? (
        <EmptyState
          titulo="Nenhuma solicitação ainda"
          descricao="Crie uma solicitação para registrar a demanda do chefe antes de escanear um equipamento."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {minhasTarefas.map((tarefa) => (
            <TarefaCard
              key={tarefa.id}
              tarefa={tarefa}
              equipamento={equipamentos.find((e) => e.id === tarefa.equipamentoId)}
              onCriarNovaPara={abrirNova}
            />
          ))}
        </div>
      )}

      <Drawer aberto={drawerAberto} onFechar={() => setDrawerAberto(false)} titulo="Nova solicitação">
        {operadorAtivoId && (
          <TarefaForm
            operadorId={operadorAtivoId}
            tagPreselecionada={tagParaNovaTarefa}
            onSucesso={() => setDrawerAberto(false)}
          />
        )}
      </Drawer>
    </OperatorShell>
  );
}
