"use client";

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import type { Id, Perfil } from "@/lib/types";
import type { Repositorio } from "./repository";
import type { EstadoAplicacao } from "./store";
import { agora, getServerSnapshot, getStore, inscrever, mutar, resetar } from "./store";
import { criarRepositorioLocal } from "./local/create-local-repositorio";
import { criarSyncRepositorio } from "./local/sync";

const RepositorioContext = createContext<Repositorio | null>(null);

function inscreverSemMudanca() {
  return () => {};
}

/**
 * true só depois que o cliente termina a hidratação — usa o mesmo mecanismo de
 * getServerSnapshot/getSnapshot do React (não um efeito com setState) porque é
 * exatamente para isso que a API existe: um valor que precisa divergir entre
 * servidor e cliente sem virar um mismatch de hidratação.
 */
function useMontadoNoCliente(): boolean {
  return useSyncExternalStore(
    inscreverSemMudanca,
    () => true,
    () => false,
  );
}

export function ProvedorDados({ children }: { children: ReactNode }) {
  // Força a inscrição no store para que qualquer mutar() em qualquer lugar do app re-renderize.
  useSyncExternalStore(inscrever, getStore, getServerSnapshot);
  const repositorio = useMemo(() => criarRepositorioLocal(), []);

  // O snapshot puro do servidor (ancorado numa época fixa) e os dados reais do
  // localStorage podem divergir estruturalmente depois que o usuário já usou o app
  // (contagens diferentes de checklists/eventos, não só valores) — o que quebra a
  // hidratação do React em telas que derivam listas/gráficos desses dados. Só
  // renderiza o conteúdo real depois que o cliente termina de hidratar.
  const montado = useMontadoNoCliente();

  return (
    <RepositorioContext.Provider value={repositorio}>{montado ? children : null}</RepositorioContext.Provider>
  );
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

// --- Seletores de conveniência — todos dependem de useEstadoAplicacao() para reinscrever o
// componente em QUALQUER mutação (o motor clona o estado inteiro a cada mutar(), então não há
// como um seletor mais estreito evitar re-render; a vantagem aqui é só ergonomia de leitura). ---

export function useEquipamentos() {
  return useEstadoAplicacao().equipamentos;
}

export function useOperadores() {
  return useEstadoAplicacao().operadores;
}

export function useModelosChecklist() {
  return useEstadoAplicacao().modelosChecklist;
}

export function useChecklistsPreenchidos() {
  return useEstadoAplicacao().checklistsPreenchidos;
}

export function useApontamentos() {
  return useEstadoAplicacao().apontamentos;
}

export function useChamados() {
  return useEstadoAplicacao().chamados;
}

export function useSessoes() {
  return useEstadoAplicacao().sessoes;
}

export function useHistoricoCompleto() {
  return useEstadoAplicacao().historico;
}

export function useFilaSincronizacao() {
  return useEstadoAplicacao().filaSincronizacao;
}

export function useSincronizacaoPortal() {
  return useEstadoAplicacao().sincronizacaoPortal;
}

/** "Agora" simulado (tempo real + "avançar o tempo") — único jeito correto de carimbar escritas na UI. */
export { agora };

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
