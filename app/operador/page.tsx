"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ClipboardList, QrCode } from "lucide-react";
import { OperatorShell } from "@/components/layout/OperatorShell";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TarefaCard } from "@/components/tarefas/TarefaCard";
import { TarefaForm } from "@/components/tarefas/TarefaForm";
import { TAXONOMIA_RESULTADO_CHECKLIST } from "@/components/status/statusTaxonomy";
import {
  alternarPerfil,
  useChecklistsPreenchidos,
  useEquipamentos,
  useEstadoDemo,
  useOperadores,
  useSessoes,
  useTarefas,
} from "@/lib/data/context";

/**
 * Home do operador. É também o único lugar onde as solicitações vivem — não existe tela
 * separada de "minhas solicitações": a lista e a folha de criação ficam aqui, e os links
 * de fora chegam por `?nova=1&tag=`.
 */
function ConteudoHome() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const demo = useEstadoDemo();
  const checklists = useChecklistsPreenchidos();
  const equipamentos = useEquipamentos();
  const operadores = useOperadores();
  const tarefas = useTarefas();
  const sessoes = useSessoes();
  const operadorAtivoId = demo.operadorAtivoId ?? operadores[0]?.id ?? null;
  const operadorAtivo = operadores.find((o) => o.id === operadorAtivoId);

  const [drawerAberto, setDrawerAberto] = useState(() => searchParams.get("nova") === "1");
  const [tagParaNovaTarefa, setTagParaNovaTarefa] = useState<string | undefined>(searchParams.get("tag") ?? undefined);

  function abrirNova(tag?: string) {
    setTagParaNovaTarefa(tag);
    setDrawerAberto(true);
  }

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

  // Equipamentos que estão fisicamente com o operador agora (sessão aberta). Não há
  // cronômetro: a sessão só registra a posse até a devolução.
  const equipamentosEmUso = new Set(
    sessoes.filter((s) => s.operadorId === operadorAtivoId && s.status === "em_andamento").map((s) => s.equipamentoId),
  );

  // Sem tela de "ver todas", a home mostra a lista inteira de solicitações em aberto —
  // rejeitadas incluídas, porque é no card delas que mora o "Nova solicitação" para
  // tentar de novo. Concluídas saem: viram histórico, não pendência.
  const minhasTarefas = tarefas
    .filter(
      (t) =>
        t.operadorId === operadorAtivoId &&
        (t.status === "pendente" || t.status === "aprovada" || t.status === "rejeitada"),
    )
    // O que está com o operador vem primeiro — devolver é a ação mais urgente da lista.
    .sort((a, b) => {
      const emUsoA = equipamentosEmUso.has(a.equipamentoId) ? 1 : 0;
      const emUsoB = equipamentosEmUso.has(b.equipamentoId) ? 1 : 0;
      if (emUsoA !== emUsoB) return emUsoB - emUsoA;
      return b.criadaEm.localeCompare(a.criadaEm);
    });

  const primeiroNome = operadorAtivo?.nome.split(" ")[0];

  return (
    <OperatorShell
      cabecalho={{
        nomeOperador: operadorAtivo?.nome ?? "Operador",
        fotoOperador: operadorAtivo?.fotoUrl,
        quantidadeNotificacoes: minhasTarefas.filter((t) => t.status === "pendente").length,
      }}
    >
      {/* A saudação e as duas ações de partida formam um bloco só, fechado por um fio —
          o que vem abaixo é acompanhamento, não partida (Figma node 4127:473). O fio existe
          mesmo sem tarefas: é ele que separa "começar" de "acompanhar". */}
      {/* mt-2 completa os 32px entre o cabeçalho e a saudação (o shell já dá 24). */}
      <div className="mt-2 flex flex-col gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-display-sm text-foreground">{primeiroNome ? `Olá ${primeiroNome}.` : "Olá!"}</h1>
          <p className="mt-1 text-sm text-foreground-muted">Faça uma nova solicitação ou inicie uma tarefa.</p>
        </div>

        <Button
          tamanho="touch"
          larguraTotal
          iconeEsquerda={<ClipboardList size={22} aria-hidden />}
          onClick={() => abrirNova(undefined)}
        >
          Nova Solicitação
        </Button>

        <Button
          variante="secondary"
          tamanho="touch"
          larguraTotal
          iconeEsquerda={<QrCode size={20} aria-hidden />}
          onClick={() => router.push("/entrada")}
        >
          Ler QR Code
        </Button>
      </div>

      {minhasTarefas.length > 0 && (
        <div>
          <SectionHeading>Minhas tarefas</SectionHeading>
          <div className="mt-2 flex flex-col gap-2">
            {minhasTarefas.map((tarefa) => (
              <TarefaCard
                key={tarefa.id}
                tarefa={tarefa}
                equipamento={equipamentos.find((e) => e.id === tarefa.equipamentoId)}
                emUso={tarefa.status === "aprovada" && equipamentosEmUso.has(tarefa.equipamentoId)}
                onCriarNovaPara={abrirNova}
              />
            ))}
          </div>
        </div>
      )}

      {recentes.length > 0 && (
        <div>
          <SectionHeading>Suas últimas verificações</SectionHeading>
          <ul className="mt-3 flex flex-col gap-2">
            {recentes.map((c) => {
              const eq = equipamentos.find((e) => e.id === c.equipamentoId);
              return (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-card border-[0.8px] border-border bg-surface p-3 text-sm shadow-card-operador"
                >
                  <div className="min-w-0">
                    <p className="text-foreground">{eq?.tag ?? "—"}</p>
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

      <Drawer
        aberto={drawerAberto}
        onFechar={() => setDrawerAberto(false)}
        titulo="Nova solicitação"
        navegacao="voltar"
      >
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

// useSearchParams precisa de fronteira de Suspense para a home não virar render dinâmico
// inteiro — o conteúdo real é o ConteudoHome acima.
export default function OperadorHomePage() {
  return (
    <Suspense>
      <ConteudoHome />
    </Suspense>
  );
}
