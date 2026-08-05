"use client";

import { useState } from "react";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ROTULO_TIPO_EQUIPAMENTO } from "@/components/equipamento/rotulos";
import { TAXONOMIA_STATUS_EQUIPAMENTO } from "@/components/status/statusTaxonomy";
import { useEquipamentos, useRepositorio, useTarefas } from "@/lib/data/context";
import type { Id } from "@/lib/types";

export function TarefaForm({
  operadorId,
  tagPreselecionada,
  onSucesso,
}: {
  operadorId: Id;
  tagPreselecionada?: string;
  onSucesso: () => void;
}) {
  const equipamentos = useEquipamentos();
  const tarefas = useTarefas();
  const repo = useRepositorio();

  // `criar()` recusa uma segunda solicitação ativa para o mesmo par operador+equipamento.
  // Filtrar aqui em vez de deixar o erro estourar depois: oferecer na lista um equipamento
  // que vai ser recusado só faz o operador preencher a demanda inteira para bater na parede.
  const temSolicitacaoAtiva = (equipamentoId: Id) =>
    tarefas.some(
      (t) =>
        t.operadorId === operadorId &&
        t.equipamentoId === equipamentoId &&
        (t.status === "pendente" || t.status === "aprovada"),
    );

  const selecionaveis = equipamentos.filter((e) => !temSolicitacaoAtiva(e.id));
  const equipamentoPreselecionado = tagPreselecionada
    ? selecionaveis.find((e) => e.tag.toLowerCase() === tagPreselecionada.toLowerCase())
    : undefined;

  const [equipamentoId, setEquipamentoId] = useState(equipamentoPreselecionado?.id ?? "");
  const [descricaoDemanda, setDescricaoDemanda] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const opcoes = selecionaveis.map((e) => ({
    valor: e.id,
    rotulo: `${e.tag} — ${ROTULO_TIPO_EQUIPAMENTO[e.tipo]} (${TAXONOMIA_STATUS_EQUIPAMENTO[e.status].label})`,
  }));

  function aoEnviar() {
    if (!equipamentoId || !descricaoDemanda.trim()) return;
    setEnviando(true);
    setErro(null);
    try {
      repo.tarefas.criar({ operadorId, equipamentoId, descricaoDemanda: descricaoDemanda.trim() });
      onSucesso();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível criar a solicitação.");
    } finally {
      setEnviando(false);
    }
  }

  const podeEnviar = Boolean(equipamentoId) && descricaoDemanda.trim().length > 0;

  if (selecionaveis.length === 0) {
    return (
      <EmptyState
        titulo="Nenhum equipamento disponível para solicitar"
        descricao="Você já tem uma solicitação pendente ou aprovada para todos os equipamentos. Conclua uma delas ao encerrar a operação para poder solicitar o mesmo equipamento de novo."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Select
        rotulo="Equipamento"
        opcoes={opcoes}
        valor={equipamentoId}
        aoAlterar={setEquipamentoId}
        placeholder="Selecionar equipamento…"
        dica={
          selecionaveis.length < equipamentos.length
            ? "Equipamentos com solicitação sua em aberto não aparecem na lista."
            : undefined
        }
      />
      <Textarea
        rotulo="O que o chefe pediu"
        required
        rows={4}
        value={descricaoDemanda}
        onChange={(e) => setDescricaoDemanda(e.target.value)}
        placeholder="Descreva a demanda recebida antes de escanear o equipamento."
      />
      {erro && (
        <p className="text-sm text-error" role="alert">
          {erro}
        </p>
      )}
      <Button tamanho="touch" larguraTotal disabled={!podeEnviar} carregando={enviando} onClick={aoEnviar}>
        Criar solicitação
      </Button>
    </div>
  );
}
