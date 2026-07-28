import type { OperacaoFila } from "@/lib/types";
import type { SyncRepositorio } from "../repository";
import type { EstadoAplicacao } from "../store";
import { agora, getStore, mutar } from "../store";
import { criarId } from "../id";
import { adicionarEventoHistorico } from "./historico";

/**
 * Helper interno: chamado a partir de operações compostas (registrar checklist, encerrar
 * sessão) enquanto o modo offline estiver ativo. A escrita já foi aplicada otimisticamente
 * ao `rascunho` pelo chamador — aqui só registramos que ela ainda precisa ser sincronizada.
 */
export function enfileirarSeOffline(rascunho: EstadoAplicacao, operacao: OperacaoFila): void {
  if (!rascunho.demo.offline) return;
  rascunho.filaSincronizacao.push({
    id: criarId("sync"),
    criadoEm: new Date(Date.now() + rascunho.demo.deslocamentoTempoMs).toISOString(),
    status: "pendente",
    operacao,
  });
}

export function criarSyncRepositorio(): SyncRepositorio {
  return {
    listarFila() {
      return getStore().filaSincronizacao;
    },
    contarPendentes() {
      return getStore().filaSincronizacao.filter((item) => item.status === "pendente").length;
    },
    sincronizar() {
      mutar((rascunho) => {
        const pendentes = rascunho.filaSincronizacao.filter((item) => item.status === "pendente");
        if (pendentes.length === 0) return;
        const sincronizadoEm = agora().toISOString();
        for (const item of pendentes) {
          item.status = "sincronizado";
          item.sincronizadoEm = sincronizadoEm;
        }
        adicionarEventoHistorico(rascunho, {
          tipo: "sincronizacao_offline",
          em: sincronizadoEm,
          refs: {},
          resumo: `${pendentes.length} registro(s) sincronizado(s) às ${new Date(sincronizadoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}.`,
        });
      });
    },
  };
}
