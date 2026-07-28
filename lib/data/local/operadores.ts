import type { Id, TipoEquipamento } from "@/lib/types";
import type { OperadoresRepositorio } from "../repository";
import { agora, getStore, mutar } from "../store";

export function criarOperadoresRepositorio(): OperadoresRepositorio {
  return {
    listar() {
      return getStore().operadores;
    },
    buscarPorId(id: Id) {
      return getStore().operadores.find((o) => o.id === id);
    },
    possuiHabilitacaoValida(operadorId: Id, tipo: TipoEquipamento) {
      const operador = getStore().operadores.find((o) => o.id === operadorId);
      if (!operador || !operador.ativo) return false;
      const habilitacao = operador.habilitacoes.find((h) => h.tipoEquipamento === tipo);
      if (!habilitacao) return false;
      if (!habilitacao.validoAte) return true;
      return new Date(habilitacao.validoAte).getTime() >= agora().getTime();
    },
    obterSincronizacaoPortal() {
      return getStore().sincronizacaoPortal;
    },
    sincronizarComPortal() {
      mutar((rascunho) => {
        rascunho.sincronizacaoPortal = {
          status: "sincronizado",
          ultimaSincronizacaoEm: agora().toISOString(),
          ultimoResumo: `${rascunho.operadores.length} operadores sincronizados do portal corporativo.`,
        };
      });
    },
  };
}
