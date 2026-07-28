"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { Square } from "lucide-react";
import { OperatorShell } from "@/components/layout/OperatorShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useEquipamentos, useOperadores, useRepositorio, useSessoes } from "@/lib/data/context";

function formatarDuracao(ms: number): string {
  const totalSegundos = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSegundos / 3600);
  const m = Math.floor((totalSegundos % 3600) / 60);
  const s = totalSegundos % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export default function SessaoAbertaPage(props: PageProps<"/equipamento/[tag]/sessao">) {
  const { tag } = use(props.params);
  const equipamentos = useEquipamentos();
  const operadores = useOperadores();
  const sessoes = useSessoes();
  const repo = useRepositorio();
  const router = useRouter();
  const [encerrada, setEncerrada] = useState<{ duracaoMs: number } | null>(null);
  const [agoraMs, setAgoraMs] = useState(() => Date.now());

  const equipamento = equipamentos.find((e) => e.tag.toLowerCase() === tag.toLowerCase());
  if (!equipamento) notFound();

  const sessao = sessoes.find((s) => s.equipamentoId === equipamento.id && s.status === "em_andamento");
  const operador = sessao ? operadores.find((o) => o.id === sessao.operadorId) : undefined;

  useEffect(() => {
    if (!sessao || encerrada) return;
    const intervalo = setInterval(() => setAgoraMs(Date.now()), 1000);
    return () => clearInterval(intervalo);
  }, [sessao, encerrada]);

  // Depois de encerrar, a própria sessão deixa de aparecer como "em_andamento" (efeito
  // esperado do encerramento) — só redireciona se isso acontecer por qualquer OUTRO motivo.
  useEffect(() => {
    if (!sessao && !encerrada) {
      router.replace(`/equipamento/${equipamento.tag}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessao, encerrada]);

  if (encerrada) {
    return (
      <OperatorShell>
        <Card densidade="densa" className="flex flex-col items-center gap-3 py-10 text-center">
          <h1 className="text-lg font-medium text-neutral-900">Operação encerrada</h1>
          <p className="text-sm text-neutral-600">
            Duração: {formatarDuracao(encerrada.duracaoMs)} · registrado no histórico do equipamento.
          </p>
          <Button tamanho="lg" onClick={() => router.push("/operador")}>
            Voltar ao início
          </Button>
        </Card>
      </OperatorShell>
    );
  }

  if (!sessao || !operador) {
    return null;
  }

  const duracaoAtualMs = agoraMs - new Date(sessao.iniciadoEm).getTime();

  function aoEncerrar() {
    if (!sessao) return;
    const duracaoMs = Date.now() - new Date(sessao.iniciadoEm).getTime();
    repo.sessoes.encerrar(sessao.id);
    setEncerrada({ duracaoMs });
  }

  return (
    <OperatorShell>
      <div className="flex flex-col items-center gap-4 rounded-card-hero border border-neutral-100 bg-white p-8 text-center shadow-elevated">
        <p className="text-sm text-neutral-500">Operação em andamento</p>
        <h1 className="text-display-md text-neutral-900">{equipamento.tag}</h1>
        <p className="text-sm text-neutral-600">
          {operador.nome} · turno {operador.turnoPadrao}
        </p>
        <p className="font-mono text-4xl font-medium tabular-nums text-neutral-900">{formatarDuracao(duracaoAtualMs)}</p>
        {equipamento.chamadoAtivoId && (
          <Badge texto="Apontamento pendente" classeCor="text-status-apontamento bg-status-apontamento-surface" />
        )}
      </div>
      <Button variante="danger" tamanho="lg" larguraTotal iconeEsquerda={<Square size={16} aria-hidden />} onClick={aoEncerrar}>
        Encerrar operação
      </Button>
    </OperatorShell>
  );
}
