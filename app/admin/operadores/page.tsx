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
            <Badge key={h.tipoEquipamento} texto={ROTULO_TIPO[h.tipoEquipamento]} classeCor="text-neutral-700 bg-neutral-100" tamanho="sm" />
          ))}
        </div>
      ),
    },
    { chave: "score", cabecalho: "Confiabilidade", renderizar: (o) => <ReliabilityScoreBadge score={o.scoreConfiabilidade} /> },
  ];

  return (
    <div>
      <PageHeader titulo="Operadores" subtitulo={`${operadores.length} operadores sincronizados do portal corporativo.`} />

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-card border border-neutral-100 bg-neutral-50 p-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-800">Sincronizado do portal corporativo</p>
          <p className="text-sm text-neutral-600">
            {sincronizando
              ? "Sincronizando…"
              : sincronizacao.ultimaSincronizacaoEm
                ? `Última sincronização: ${new Date(sincronizacao.ultimaSincronizacaoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}`
                : "Nunca sincronizado"}
          </p>
          {sincronizacao.ultimoResumo && !sincronizando && <p className="text-xs text-neutral-500">{sincronizacao.ultimoResumo}</p>}
        </div>
        <Button
          variante="secondary"
          iconeEsquerda={<RefreshCw size={14} className={sincronizando ? "animate-spin" : ""} aria-hidden />}
          onClick={aoSincronizar}
          disabled={sincronizando}
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
