"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
  descricaoGeradaPorIA?: boolean;
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

/**
 * O rascunho vive fora do React porque um F5 no meio do checklist perdia todas as
 * respostas E re-embaralhava os itens — gerando uma nova seed de auditoria para o
 * mesmo preenchimento. `sessionStorage` (não `localStorage`): o rascunho pertence a
 * esta sessão de preenchimento e não deve reaparecer numa aba nova.
 */
function chaveRascunho(equipamentoId: string, modeloId: string) {
  return `portonave-demo:rascunho:${equipamentoId}:${modeloId}`;
}

function lerRascunhoSalvo(chave: string, modelo: ModeloChecklist): EstadoRascunho | null {
  if (typeof window === "undefined") return null;
  try {
    const bruto = window.sessionStorage.getItem(chave);
    if (!bruto) return null;
    const salvo = JSON.parse(bruto) as EstadoRascunho;
    // Se o modelo mudou desde que o rascunho foi salvo, a ordem não bate mais — descarta.
    const cobreTodasAsSecoes = modelo.secoes.every(
      (s) => salvo.itensPorSecao?.[s.id]?.length === s.itens.length,
    );
    return cobreTodasAsSecoes ? salvo : null;
  } catch {
    return null;
  }
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

  const chave = chaveRascunho(equipamento.id, modelo.id);
  // Só persiste depois de tentar restaurar — senão o estado recém-criado sobrescreveria
  // o rascunho salvo. A restauração é client-only para não divergir da hidratação.
  const [restaurado, setRestaurado] = useState(false);
  // Guarda só o modelo inicial: ele não muda no meio de um preenchimento (trocar de
  // modelo remonta o layout do checklist), e assim o efeito não depende da identidade dele.
  const modeloRef = useRef(modelo);

  useEffect(() => {
    const salvo = lerRascunhoSalvo(chave, modeloRef.current);
    if (salvo) setRascunho(salvo);
    setRestaurado(true);
  }, [chave]);

  useEffect(() => {
    if (!restaurado) return;
    try {
      window.sessionStorage.setItem(chave, JSON.stringify(rascunho));
    } catch {
      // Cota cheia (fotos em data URL são grandes) — segue sem persistir, nunca quebra o fluxo.
    }
  }, [restaurado, chave, rascunho]);

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
        descricaoGeradaPorIA: r?.descricaoGeradaPorIA,
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

    // O rascunho virou registro — manter em sessionStorage faria a próxima verificação
    // deste equipamento nascer com as respostas antigas.
    try {
      window.sessionStorage.removeItem(chave);
    } catch {
      // sessionStorage indisponível — nada a limpar.
    }

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
