"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { agora, useRepositorio, useEstadoDemo } from "@/lib/data/context";
import { mulberry32, embaralhar } from "@/lib/data/seed/rng";
import type {
  Equipamento,
  FotoEvidencia,
  ModeloChecklist,
  Operador,
  RespostaItemChecklist,
} from "@/lib/types";

export interface RespostaRascunho {
  valor: RespostaItemChecklist["valor"];
  reprovado: boolean;
  observacao?: string;
  fotoEvidencia?: FotoEvidencia;
}

interface EstadoRascunho {
  itensPorSecao: Record<string, string[]>;
  respostas: Record<string, RespostaRascunho>;
  duracaoPorSecaoSegundos: Record<string, number>;
  iniciadoEm: string;
  seedEmbaralhamento: number;
}

interface DraftContextValue {
  equipamento: Equipamento;
  operador: Operador;
  modelo: ModeloChecklist;
  itensPorSecao: Record<string, string[]>;
  respostas: Record<string, RespostaRascunho>;
  responder: (itemId: string, resposta: RespostaRascunho) => void;
  confirmarSecao: (secaoOrdem: number, secaoId: string, duracaoSegundos: number) => void;
}

const DraftContext = createContext<DraftContextValue | null>(null);

function criarEstadoInicial(modelo: ModeloChecklist): EstadoRascunho {
  // Date.now() aqui é seguro: só roda uma vez, no inicializador preguiçoso do useState.
  const seed = Date.now() % 1_000_000;
  const rng = mulberry32(seed);
  const itensPorSecao: Record<string, string[]> = {};
  for (const secao of modelo.secoes) {
    itensPorSecao[secao.id] = embaralhar(
      rng,
      secao.itens.map((i) => i.id),
    );
  }
  return {
    itensPorSecao,
    respostas: {},
    duracaoPorSecaoSegundos: {},
    iniciadoEm: agora().toISOString(),
    seedEmbaralhamento: seed,
  };
}

export function DraftChecklistProvider({
  equipamento,
  operador,
  modelo,
  children,
}: {
  equipamento: Equipamento;
  operador: Operador;
  modelo: ModeloChecklist;
  children: ReactNode;
}) {
  const [rascunho, setRascunho] = useState(() => criarEstadoInicial(modelo));
  const repo = useRepositorio();
  const demo = useEstadoDemo();
  const router = useRouter();

  function responder(itemId: string, resposta: RespostaRascunho) {
    setRascunho((atual) => ({ ...atual, respostas: { ...atual.respostas, [itemId]: resposta } }));
  }

  function confirmarSecao(secaoOrdem: number, secaoId: string, duracaoSegundos: number) {
    const novaDuracao = { ...rascunho.duracaoPorSecaoSegundos, [secaoId]: duracaoSegundos };

    if (secaoOrdem < modelo.secoes.length) {
      setRascunho((atual) => ({ ...atual, duracaoPorSecaoSegundos: novaDuracao }));
      router.push(`/equipamento/${equipamento.tag}/checklist/${secaoOrdem + 1}`);
      return;
    }

    // Última seção: monta o preenchimento completo e registra.
    const concluidoEm = agora().toISOString();
    const ordemItensEmbaralhada = modelo.secoes.flatMap((s) => rascunho.itensPorSecao[s.id]);
    const respostas: RespostaItemChecklist[] = ordemItensEmbaralhada.map((itemId) => {
      const r = rascunho.respostas[itemId];
      return {
        itemId,
        valor: r?.valor ?? "ok",
        reprovado: r?.reprovado ?? false,
        observacao: r?.observacao,
        fotoEvidencia: r?.fotoEvidencia,
        respondidoEm: concluidoEm,
      };
    });
    const duracaoTotalSegundos = Object.values(novaDuracao).reduce((total, s) => total + s, 0);

    repo.checklists.registrarPreenchimento({
      modeloChecklistId: modelo.id,
      equipamentoId: equipamento.id,
      operadorId: operador.id,
      ordemItensEmbaralhada,
      seedEmbaralhamento: rascunho.seedEmbaralhamento,
      respostas,
      iniciadoEm: rascunho.iniciadoEm,
      concluidoEm,
      duracaoTotalSegundos,
      duracaoPorSecaoSegundos: novaDuracao,
      preenchidoOffline: demo.offline,
    });

    router.push(`/equipamento/${equipamento.tag}/resultado`);
  }

  const valor = useMemo<DraftContextValue>(
    () => ({
      equipamento,
      operador,
      modelo,
      itensPorSecao: rascunho.itensPorSecao,
      respostas: rascunho.respostas,
      responder,
      confirmarSecao,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [equipamento, operador, modelo, rascunho],
  );

  return <DraftContext.Provider value={valor}>{children}</DraftContext.Provider>;
}

export function useDraftChecklist(): DraftContextValue {
  const contexto = useContext(DraftContext);
  if (!contexto) {
    throw new Error("useDraftChecklist precisa ser usado dentro de <DraftChecklistProvider>");
  }
  return contexto;
}
