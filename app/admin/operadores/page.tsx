"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type ColunaDataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ReliabilityScoreBadge } from "@/components/operador/ReliabilityScoreBadge";
import { useOperadores, useRepositorio, useSincronizacaoPortal } from "@/lib/data/context";
import type { Operador, TipoEquipamento } from "@/lib/types";

const ROTULO_TIPO: Record<TipoEquipamento, string> = {
  empilhadeira: "Empilhadeira",
  reach_stacker: "Reach stacker",
  transpaleteira: "Transpaleteira",
};

export default function AdminOperadoresPage() {
  const operadores = useOperadores();
  const sincronizacao = useSincronizacaoPortal();
  const repo = useRepositorio();
  const router = useRouter();
  const [sincronizando, setSincronizando] = useState(false);

  function aoSincronizar() {
    setSincronizando(true);
    setTimeout(() => {
      repo.operadores.sincronizarComPortal();
      setSincronizando(false);
    }, 1400);
  }

  const colunas: ColunaDataTable<Operador>[] = [
    { chave: "nome", cabecalho: "Nome", renderizar: (o) => <span className="font-medium">{o.nome}</span> },
    { chave: "matricula", cabecalho: "Matrícula", renderizar: (o) => o.matricula },
    { chave: "turno", cabecalho: "Turno", renderizar: (o) => o.turnoPadrao[0].toUpperCase() + o.turnoPadrao.slice(1) },
    {
      chave: "habilitacoes",
      cabecalho: "Habilitações",
      renderizar: (o) => (
        <div className="flex flex-wrap gap-1">
          {o.habilitacoes.map((h) => (
            <Badge key={h.tipoEquipamento} texto={ROTULO_TIPO[h.tipoEquipamento]} classeCor="text-foreground-muted bg-surface-3" tamanho="sm" />
          ))}
        </div>
      ),
    },
    { chave: "score", cabecalho: "Confiabilidade", renderizar: (o) => <ReliabilityScoreBadge score={o.scoreConfiabilidade} /> },
  ];

  return (
    <div>
      <PageHeader titulo="Operadores" subtitulo={`${operadores.length} operadores sincronizados do portal corporativo via SSO/API.`} />

      <div className="mb-4 flex flex-col gap-3 rounded-card border border-border bg-surface-2 p-4 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">Sincronizado do portal corporativo via SSO/API</p>
          <p className="text-sm text-foreground-muted">
            {sincronizando
              ? "Sincronizando…"
              : sincronizacao.ultimaSincronizacaoEm
                ? `Última sincronização: ${new Date(sincronizacao.ultimaSincronizacaoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}`
                : "Nunca sincronizado"}
          </p>
          {sincronizacao.ultimoResumo && !sincronizando && <p className="text-xs text-foreground-subtle">{sincronizacao.ultimoResumo}</p>}
          <p className="mt-1 text-xs text-foreground-subtle">
            Status: {sincronizando ? "sincronizando" : sincronizacao.status.replace(/_/g, " ")}. Pessoas e habilitações são somente
            leitura aqui — o cadastro vive no portal corporativo.
          </p>
        </div>
        <Button
          variante="secondary"
          iconeEsquerda={<RefreshCw size={14} className={sincronizando ? "animate-spin" : ""} aria-hidden />}
          onClick={aoSincronizar}
          disabled={sincronizando}
          className="sm:w-auto sm:shrink-0"
        >
          {sincronizando ? "Sincronizando…" : "Sincronizar com o portal"}
        </Button>
      </div>

      <DataTable
        colunas={colunas}
        linhas={operadores}
        chaveLinha={(o) => o.id}
        aoClicarLinha={(o) => router.push(`/admin/operadores/${o.id}`)}
      />
    </div>
  );
}
