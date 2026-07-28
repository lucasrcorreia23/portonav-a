"use client";

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import type { Id, Perfil } from "@/lib/types";
import type { Repositorio } from "./repository";
import type { EstadoAplicacao } from "./store";
import { getServerSnapshot, getStore, inscrever, mutar, resetar } from "./store";
import { criarRepositorioLocal } from "./local/create-local-repositorio";
import { criarSyncRepositorio } from "./local/sync";

const RepositorioContext = createContext<Repositorio | null>(null);

export function ProvedorDados({ children }: { children: ReactNode }) {
  // Força a inscrição no store para que qualquer mutar() em qualquer lugar do app re-renderize.
  useSyncExternalStore(inscrever, getStore, getServerSnapshot);
  const repositorio = useMemo(() => criarRepositorioLocal(), []);
  return <RepositorioContext.Provider value={repositorio}>{children}</RepositorioContext.Provider>;
}

export function useRepositorio(): Repositorio {
  const repositorio = useContext(RepositorioContext);
  if (!repositorio) {
    throw new Error("useRepositorio precisa ser usado dentro de <ProvedorDados>");
  }
  return repositorio;
}

/** Estado reativo completo — qualquer mutar() em qualquer lugar do app dispara um re-render aqui. */
export function useEstadoAplicacao(): EstadoAplicacao {
  return useSyncExternalStore(inscrever, getStore, getServerSnapshot);
}

export function useEstadoDemo() {
  return useEstadoAplicacao().demo;
}

// --- Ações dos controles de demo — não fazem parte de Repositorio (não são dados de domínio) ---

export function alternarPerfil(perfil: Perfil, operadorAtivoId: Id | null = null): void {
  mutar((rascunho) => {
    rascunho.demo.perfilAtivo = perfil;
    rascunho.demo.operadorAtivoId = perfil === "operador" ? operadorAtivoId : null;
  });
}

export function definirOperadorAtivo(operadorAtivoId: Id | null): void {
  mutar((rascunho) => {
    rascunho.demo.operadorAtivoId = operadorAtivoId;
  });
}

export function alternarOffline(): void {
  const estavaOffline = getStore().demo.offline;
  mutar((rascunho) => {
    rascunho.demo.offline = !rascunho.demo.offline;
  });
  if (estavaOffline) {
    // Estava offline e acabou de voltar a ficar online: sincroniza automaticamente.
    criarSyncRepositorio().sincronizar();
  }
}

export function avancarTempo(incrementoMs: number): void {
  mutar((rascunho) => {
    rascunho.demo.deslocamentoTempoMs += incrementoMs;
  });
}

export function resetarDemo(): void {
  resetar();
}
