import type { Id } from "@/lib/types";
import type { SessoesRepositorio } from "../repository";
import { agora, getStore, mutar } from "../store";
import { adicionarEventoHistorico } from "./historico";
import { enfileirarSeOffline } from "./sync";

export function criarSessoesRepositorio(): SessoesRepositorio {
  return {
    listarAbertas() {
      return getStore().sessoes.filter((s) => s.status === "em_andamento");
    },
    buscarPorId(id: Id) {
      return getStore().sessoes.find((s) => s.id === id);
    },
    buscarAbertaPorEquipamento(equipamentoId: Id) {
      return getStore().sessoes.find(
        (s) => s.equipamentoId === equipamentoId && s.status === "em_andamento",
      );
    },
    encerrar(id: Id) {
      mutar((rascunho) => {
        const sessao = rascunho.sessoes.find((s) => s.id === id);
        if (!sessao || sessao.status === "encerrada") return;
        const encerradoEm = agora().toISOString();
        sessao.status = "encerrada";
        sessao.encerradoEm = encerradoEm;

        const equipamento = rascunho.equipamentos.find((e) => e.id === sessao.equipamentoId);
        if (equipamento && equipamento.status === "em_uso") {
          // Se ainda existe um chamado ativo (apontamento não crítico não resolvido),
          // o equipamento volta a ficar em repouso como "com apontamento", não "disponível".
          equipamento.status = equipamento.chamadoAtivoId ? "com_apontamento" : "disponivel";
        }

        adicionarEventoHistorico(rascunho, {
          tipo: "sessao_operacao_encerrada",
          em: encerradoEm,
          equipamentoId: sessao.equipamentoId,
          operadorId: sessao.operadorId,
          refs: { sessaoOperacaoId: sessao.id },
          resumo: "Equipamento devolvido pelo operador e liberado.",
        });

        enfileirarSeOffline(rascunho, {
          tipo: "sessao_encerrada",
          payload: { sessaoOperacaoId: sessao.id, encerradoEm },
        });
      });
    },
  };
}
