"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type ColunaDataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useModelosChecklist } from "@/lib/data/context";
import type { ModeloChecklist } from "@/lib/types";

const ROTULO_TIPO: Record<string, string> = {
  empilhadeira: "Empilhadeira",
  reach_stacker: "Reach stacker",
  transpaleteira: "Transpaleteira",
  todos: "Todos (EPI)",
};

export default function AdminChecklistsPage() {
  const modelos = useModelosChecklist();
  const router = useRouter();

  const colunas: ColunaDataTable<ModeloChecklist>[] = [
    { chave: "nome", cabecalho: "Nome", renderizar: (m) => <span className="font-medium">{m.nome}</span> },
    { chave: "tipo", cabecalho: "Aplicável a", renderizar: (m) => ROTULO_TIPO[m.tipoEquipamentoAlvo] },
    { chave: "secoes", cabecalho: "Seções", renderizar: (m) => m.secoes.length },
    { chave: "itens", cabecalho: "Itens", renderizar: (m) => m.secoes.reduce((total, s) => total + s.itens.length, 0) },
    { chave: "versao", cabecalho: "Versão", renderizar: (m) => `v${m.versao}` },
    {
      chave: "status",
      cabecalho: "Status",
      renderizar: (m) => (
        <Badge
          texto={m.ativo ? "Ativo" : "Inativo"}
          classeCor={m.ativo ? "text-status-disponivel bg-status-disponivel-surface" : "text-foreground-subtle bg-surface-3"}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        titulo="Modelos de checklist"
        subtitulo={`${modelos.length} modelos cadastrados.`}
        acoes={
          <Button iconeEsquerda={<Plus size={16} aria-hidden />} onClick={() => router.push("/admin/checklists/novo")}>
            Novo modelo
          </Button>
        }
      />
      <DataTable
        colunas={colunas}
        linhas={modelos}
        chaveLinha={(m) => m.id}
        aoClicarLinha={(m) => router.push(`/admin/checklists/${m.id}`)}
      />
    </div>
  );
}
