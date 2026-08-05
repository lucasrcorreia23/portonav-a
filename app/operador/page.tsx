"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, QrCode } from "lucide-react";
import { OperatorShell } from "@/components/layout/OperatorShell";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TarefaCard } from "@/components/tarefas/TarefaCard";
import { TAXONOMIA_RESULTADO_CHECKLIST } from "@/components/status/statusTaxonomy";
import {
  alternarPerfil,
  useChecklistsPreenchidos,
  useEquipamentos,
  useEstadoDemo,
  useOperadores,
  useTarefas,
} from "@/lib/data/context";

export default function OperadorHomePage() {
  const router = useRouter();
  const demo = useEstadoDemo();
  const checklists = useChecklistsPreenchidos();
  const equipamentos = useEquipamentos();
  const operadores = useOperadores();
  const tarefas = useTarefas();
  const operadorAtivoId = demo.operadorAtivoId ?? operadores[0]?.id ?? null;

  useEffect(() => {
    if (demo.perfilAtivo !== "operador" || demo.operadorAtivoId !== operadorAtivoId) {
      alternarPerfil("operador", operadorAtivoId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo.perfilAtivo, demo.operadorAtivoId, operadorAtivoId]);

  const recentes = checklists
    .filter((c) => c.operadorId === operadorAtivoId)
    .sort((a, b) => b.concluidoEm.localeCompare(a.concluidoEm))
    .slice(0, 5);

  const minhasTarefas = tarefas
    .filter((t) => t.operadorId === operadorAtivoId && (t.status === "pendente" || t.status === "aprovada"))
    .sort((a, b) => b.criadaEm.localeCompare(a.criadaEm))
    .slice(0, 3);

  return (
    <OperatorShell>
      <div>
        <h1 className="text-display-sm text-foreground">Olá!</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Registre a solicitação recebida do seu chefe antes de escanear o equipamento.
        </p>
      </div>

      <Button
        tamanho="touch"
        larguraTotal
        iconeEsquerda={<ClipboardList size={22} aria-hidden />}
        onClick={() => router.push("/operador/tarefas?nova=1")}
      >
        Nova solicitação
      </Button>

      <Button
        variante="secondary"
        tamanho="touch"
        larguraTotal
        iconeEsquerda={<QrCode size={20} aria-hidden />}
        onClick={() => router.push("/entrada")}
      >
        Ler QR do equipamento
      </Button>

      {minhasTarefas.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground-muted">Minhas tarefas</h2>
            <button
              type="button"
              onClick={() => router.push("/operador/tarefas")}
              className="text-sm text-foreground-muted hover:underline"
            >
              Ver todas
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {minhasTarefas.map((tarefa) => (
              <TarefaCard
                key={tarefa.id}
                tarefa={tarefa}
                equipamento={equipamentos.find((e) => e.id === tarefa.equipamentoId)}
              />
            ))}
          </div>
        </div>
      )}

      {recentes.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-medium text-foreground-muted">Suas últimas verificações</h2>
          <ul className="flex flex-col gap-2">
            {recentes.map((c) => {
              const eq = equipamentos.find((e) => e.id === c.equipamentoId);
              return (
                <li key={c.id} className="flex items-center justify-between rounded-card border border-border bg-surface p-3 text-sm shadow-card">
                  <div>
                    <p className="font-medium text-foreground">{eq?.tag ?? "—"}</p>
                    <p className="text-xs text-foreground-subtle">
                      {new Date(c.concluidoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                    </p>
                  </div>
                  <StatusBadge entrada={TAXONOMIA_RESULTADO_CHECKLIST[c.resultado]} tamanho="sm" />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </OperatorShell>
  );
}
