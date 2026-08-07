"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { ROTULO_TIPO_EQUIPAMENTO, ROTULO_TIPO_OPERACAO } from "@/components/equipamento/rotulos";
import { agora, useRepositorio } from "@/lib/data/context";
import { criarId } from "@/lib/data/id";
import type {
  ItemChecklistDefinicao,
  ModeloChecklist,
  ModoTratamentoItem,
  SecaoChecklist,
  TipoEquipamento,
  TipoOperacao,
  TipoRespostaItem,
} from "@/lib/types";

const OPCOES_TIPO_ALVO: { valor: TipoEquipamento | "todos"; label: string }[] = [
  { valor: "todos", label: "Todos os equipamentos (EPI)" },
  { valor: "empilhadeira", label: ROTULO_TIPO_EQUIPAMENTO.empilhadeira },
  { valor: "reach_stacker", label: ROTULO_TIPO_EQUIPAMENTO.reach_stacker },
  { valor: "transpaleteira", label: ROTULO_TIPO_EQUIPAMENTO.transpaleteira },
];

const OPCOES_OPERACAO_ALVO: { valor: TipoOperacao | "todas"; label: string }[] = [
  { valor: "todas", label: "Todas as operações" },
  { valor: "carga_geral", label: ROTULO_TIPO_OPERACAO.carga_geral },
  { valor: "conteineres", label: ROTULO_TIPO_OPERACAO.conteineres },
  { valor: "graneis", label: ROTULO_TIPO_OPERACAO.graneis },
  { valor: "armazem", label: ROTULO_TIPO_OPERACAO.armazem },
];

const OPCOES_TIPO_RESPOSTA: { valor: TipoRespostaItem; label: string }[] = [
  { valor: "ok_nao_ok", label: "OK / Não OK" },
  { valor: "numerico", label: "Numérico" },
  { valor: "texto", label: "Texto" },
];

function novoItem(ordemPadrao: number): ItemChecklistDefinicao {
  return {
    id: criarId("item"),
    ordemPadrao,
    titulo: "",
    tipoResposta: "ok_nao_ok",
    modoTratamento: "alerta",
    exigeFotoAoReprovar: false,
    exigeObservacaoAoReprovar: false,
  };
}

function novaSecao(): SecaoChecklist {
  return { id: criarId("secao"), titulo: "", itens: [novoItem(1)] };
}

function modeloEmBranco(): ModeloChecklist {
  const agoraIso = agora().toISOString();
  return {
    id: criarId("modelo"),
    nome: "",
    tipoEquipamentoAlvo: "empilhadeira",
    tipoOperacaoAlvo: "todas",
    versao: 1,
    ativo: true,
    criadoEm: agoraIso,
    atualizadoEm: agoraIso,
    secoes: [novaSecao()],
  };
}

export function ChecklistModelBuilder({ modeloInicial }: { modeloInicial?: ModeloChecklist }) {
  const repo = useRepositorio();
  const router = useRouter();
  const [modelo, setModelo] = useState<ModeloChecklist>(() => modeloInicial ?? modeloEmBranco());
  const ehEdicao = Boolean(modeloInicial);

  function atualizarSecao(secaoId: string, atualizacao: Partial<SecaoChecklist>) {
    setModelo((atual) => ({
      ...atual,
      secoes: atual.secoes.map((s) => (s.id === secaoId ? { ...s, ...atualizacao } : s)),
    }));
  }

  function atualizarItem(secaoId: string, itemId: string, atualizacao: Partial<ItemChecklistDefinicao>) {
    setModelo((atual) => ({
      ...atual,
      secoes: atual.secoes.map((s) =>
        s.id !== secaoId
          ? s
          : { ...s, itens: s.itens.map((i) => (i.id === itemId ? { ...i, ...atualizacao } : i)) },
      ),
    }));
  }

  function adicionarSecao() {
    setModelo((atual) => ({ ...atual, secoes: [...atual.secoes, novaSecao()] }));
  }

  function removerSecao(secaoId: string) {
    setModelo((atual) => ({ ...atual, secoes: atual.secoes.filter((s) => s.id !== secaoId) }));
  }

  function adicionarItem(secaoId: string) {
    setModelo((atual) => ({
      ...atual,
      secoes: atual.secoes.map((s) =>
        s.id !== secaoId ? s : { ...s, itens: [...s.itens, novoItem(s.itens.length + 1)] },
      ),
    }));
  }

  function removerItem(secaoId: string, itemId: string) {
    setModelo((atual) => ({
      ...atual,
      secoes: atual.secoes.map((s) => (s.id !== secaoId ? s : { ...s, itens: s.itens.filter((i) => i.id !== itemId) })),
    }));
  }

  function salvar() {
    repo.checklists.salvarModelo({
      ...modelo,
      versao: ehEdicao ? modelo.versao + 1 : 1,
      atualizadoEm: agora().toISOString(),
    });
    router.push("/admin/checklists");
  }

  const valido = modelo.nome.trim().length > 0 && modelo.secoes.every((s) => s.titulo.trim().length > 0 && s.itens.every((i) => i.titulo.trim().length > 0));

  return (
    <div className="flex flex-col gap-6">
      <Card densidade="densa" className="flex flex-col gap-4">
        <Input rotulo="Nome do modelo" value={modelo.nome} onChange={(e) => setModelo((m) => ({ ...m, nome: e.target.value }))} required />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            rotulo="Tipo de equipamento"
            opcoes={OPCOES_TIPO_ALVO.map((opcao) => ({ valor: opcao.valor, rotulo: opcao.label }))}
            valor={modelo.tipoEquipamentoAlvo}
            aoAlterar={(valor) => setModelo((m) => ({ ...m, tipoEquipamentoAlvo: valor as TipoEquipamento | "todos" }))}
          />
          <Select
            rotulo="Tipo de operação"
            dica="Restringe o modelo a uma operação específica desse tipo de equipamento."
            opcoes={OPCOES_OPERACAO_ALVO.map((opcao) => ({ valor: opcao.valor, rotulo: opcao.label }))}
            valor={modelo.tipoOperacaoAlvo}
            aoAlterar={(valor) => setModelo((m) => ({ ...m, tipoOperacaoAlvo: valor as TipoOperacao | "todas" }))}
          />
        </div>
      </Card>

      {modelo.secoes.map((secao) => (
        <Card key={secao.id} densidade="densa" className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Input
              rotulo="Título da seção"
              value={secao.titulo}
              onChange={(e) => atualizarSecao(secao.id, { titulo: e.target.value })}
              className="flex-1"
              required
            />
            <Button
              variante="ghost"
              tamanho="sm"
              larguraTotal={false}
              onClick={() => removerSecao(secao.id)}
              disabled={modelo.secoes.length === 1}
              aria-label="Remover seção"
            >
              <Trash2 size={16} aria-hidden />
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {secao.itens.map((item) => (
              <div key={item.id} className="rounded-card border border-border p-3">
                <div className="mb-3 flex items-center gap-2">
                  <Input
                    rotulo="Item"
                    value={item.titulo}
                    onChange={(e) => atualizarItem(secao.id, item.id, { titulo: e.target.value })}
                    className="flex-1"
                    required
                  />
                  <Button
                    variante="ghost"
                    tamanho="sm"
                    larguraTotal={false}
                    onClick={() => removerItem(secao.id, item.id)}
                    disabled={secao.itens.length === 1}
                    aria-label="Remover item"
                  >
                    <Trash2 size={16} aria-hidden />
                  </Button>
                </div>
                <div className="flex flex-wrap items-end gap-3">
                  <Select
                    rotulo="Tipo de resposta"
                    opcoes={OPCOES_TIPO_RESPOSTA.map((opcao) => ({ valor: opcao.valor, rotulo: opcao.label }))}
                    valor={item.tipoResposta}
                    aoAlterar={(valor) => atualizarItem(secao.id, item.id, { tipoResposta: valor as TipoRespostaItem })}
                    className="w-48"
                  />

                  <div className="flex flex-col gap-1 text-xs font-medium text-foreground-muted">
                    Modo de tratamento
                    <div className="flex overflow-hidden rounded-control border border-border-strong">
                      {(["bloqueia", "alerta"] as ModoTratamentoItem[]).map((modo) => (
                        <button
                          key={modo}
                          type="button"
                          onClick={() => atualizarItem(secao.id, item.id, { modoTratamento: modo })}
                          aria-pressed={item.modoTratamento === modo}
                          className={`px-3 py-1.5 text-sm font-medium ${
                            item.modoTratamento === modo
                              ? modo === "bloqueia"
                                ? "bg-status-avariado text-white"
                                : "bg-status-apontamento text-white"
                              : "bg-surface text-foreground-muted hover:bg-surface-2"
                          }`}
                        >
                          {modo === "bloqueia" ? "Bloqueia" : "Alerta"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center gap-1.5 text-xs font-medium text-foreground-muted">
                    <input
                      type="checkbox"
                      checked={item.exigeFotoAoReprovar}
                      onChange={(e) => atualizarItem(secao.id, item.id, { exigeFotoAoReprovar: e.target.checked })}
                      className="h-4 w-4"
                    />
                    Exige foto ao reprovar
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-foreground-muted">
                    <input
                      type="checkbox"
                      checked={item.exigeObservacaoAoReprovar}
                      onChange={(e) => atualizarItem(secao.id, item.id, { exigeObservacaoAoReprovar: e.target.checked })}
                      className="h-4 w-4"
                    />
                    Exige observação ao reprovar
                  </label>
                </div>
              </div>
            ))}
            <Button variante="secondary" tamanho="sm" iconeEsquerda={<Plus size={14} aria-hidden />} onClick={() => adicionarItem(secao.id)}>
              Adicionar item
            </Button>
          </div>
        </Card>
      ))}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button variante="secondary" iconeEsquerda={<Plus size={16} aria-hidden />} onClick={adicionarSecao}>
          Adicionar seção
        </Button>
        <Button onClick={salvar} disabled={!valido}>
          Salvar modelo
        </Button>
      </div>
    </div>
  );
}
