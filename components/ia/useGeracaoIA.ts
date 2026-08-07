"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DURACAO_IA_SIMULADA_MS } from "@/lib/data/ia-simulada";

/** Duração da animação de revelação do texto (casa com .ia-revelar em globals.css). */
const DURACAO_REVELACAO_MS = 900;

/**
 * Encena o "processamento" da IA simulada: mantém o estado de carregamento,
 * roda o roteiro de etapas e só então aplica o texto gerado.
 *
 * O texto em si continua vindo de funções síncronas e puras de lib/data/ia-simulada.ts —
 * este hook só controla o tempo e o que a UI mostra enquanto isso.
 */
export function useGeracaoIA(etapas: readonly string[], duracaoMs: number = DURACAO_IA_SIMULADA_MS) {
  const [gerando, setGerando] = useState(false);
  const [revelando, setRevelando] = useState(false);
  const [etapaAtual, setEtapaAtual] = useState(0);

  // Timers pendentes — limpos no unmount (o operador pode trocar de seção no meio).
  // O array é sempre mutado no lugar, nunca reatribuído: o cleanup abaixo guarda
  // esta mesma referência desde a montagem e precisa enxergar os timers atuais.
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pendentes = timers.current;
    return () => {
      pendentes.forEach(clearTimeout);
      pendentes.length = 0;
    };
  }, []);

  const gerar = useCallback(
    (produzir: () => string, aplicar: (texto: string) => void) => {
      if (gerando) return;

      timers.current.forEach(clearTimeout);
      timers.current.length = 0;

      setRevelando(false);
      setEtapaAtual(0);
      setGerando(true);

      const passo = duracaoMs / etapas.length;
      etapas.slice(1).forEach((_, indice) => {
        timers.current.push(setTimeout(() => setEtapaAtual(indice + 1), passo * (indice + 1)));
      });

      timers.current.push(
        setTimeout(() => {
          aplicar(produzir());
          setGerando(false);
          setRevelando(true);
          timers.current.push(setTimeout(() => setRevelando(false), DURACAO_REVELACAO_MS));
        }, duracaoMs),
      );
    },
    [gerando, duracaoMs, etapas],
  );

  return { gerando, revelando, etapaAtual, gerar };
}
