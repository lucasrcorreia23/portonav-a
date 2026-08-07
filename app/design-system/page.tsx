"use client";

import { useState } from "react";
import { CheckCircle2, Search, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Combobox } from "@/components/ui/Combobox";
import { DatePicker } from "@/components/ui/DatePicker";
import { Card } from "@/components/ui/Card";
import { KpiCard } from "@/components/ui/KpiCard";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Spinner";
import { Skeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Stepper } from "@/components/ui/Stepper";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Modal } from "@/components/ui/Modal";
import { Drawer } from "@/components/ui/Drawer";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Tooltip } from "@/components/ui/Tooltip";

const TOKENS_COR = [
  { classe: "bg-background border border-border", rotulo: "background" },
  { classe: "bg-surface border border-border", rotulo: "surface" },
  { classe: "bg-surface-2", rotulo: "surface-2" },
  { classe: "bg-surface-3", rotulo: "surface-3" },
  { classe: "bg-foreground", rotulo: "foreground" },
  { classe: "bg-primary", rotulo: "primary" },
  { classe: "bg-success", rotulo: "success" },
  { classe: "bg-error", rotulo: "error" },
  { classe: "bg-warning", rotulo: "warning" },
  { classe: "bg-info", rotulo: "info" },
];

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-b border-border pb-10">
      <h2 className="text-xl font-bold text-foreground">{titulo}</h2>
      {children}
    </section>
  );
}

/**
 * Página viva do design system — renderiza tokens e primitivos reais pra QA
 * visual durante o rollout (Fase E). Espelha design-system-page.tsx do DS.
 * Não faz parte da navegação do produto.
 */
export default function DesignSystemPage() {
  const [modalAberto, setModalAberto] = useState(false);
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [drawerVoltarAberto, setDrawerVoltarAberto] = useState(false);
  const [confirmAberto, setConfirmAberto] = useState(false);
  const [selecao, setSelecao] = useState("empilhadeira");
  const [combo, setCombo] = useState("");
  const [data, setData] = useState("");

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Design system</h1>
        <p className="mt-1 text-foreground-muted">
          Tokens e primitivos do Atomsix Design System aplicados ao Portonave — ver docs/design-system/.
        </p>
      </header>

      <Secao titulo="Cor">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {TOKENS_COR.map((t) => (
            <div key={t.rotulo} className="flex flex-col gap-1.5">
              <div className={`h-14 rounded-card ${t.classe}`} />
              <span className="text-xs text-foreground-muted">{t.rotulo}</span>
            </div>
          ))}
        </div>
      </Secao>

      <Secao titulo="Tipografia">
        <div className="flex flex-col gap-2">
          <p className="text-3xl font-bold tracking-tight text-foreground">Título grande — text-3xl font-bold</p>
          <p className="text-2xl font-bold tracking-tight text-foreground">Título de página — text-2xl font-bold</p>
          <p className="text-base text-foreground">Corpo — text-base text-foreground</p>
          <p className="text-sm text-foreground-muted">Texto secundário — text-sm text-foreground-muted</p>
          <p className="text-xs text-foreground-subtle">Legenda / placeholder — text-xs text-foreground-subtle</p>
        </div>
      </Secao>

      <Secao titulo="Botões">
        <div className="flex flex-wrap items-center gap-3">
          <Button variante="primary" larguraTotal={false}>
            Novo equipamento
          </Button>
          <Button variante="secondary" larguraTotal={false}>
            Cancelar
          </Button>
          <Button variante="danger" larguraTotal={false} iconeEsquerda={<Trash2 size={14} aria-hidden />}>
            Excluir
          </Button>
          <Button variante="ghost" larguraTotal={false}>
            Ghost
          </Button>
          <Button variante="primary" larguraTotal={false} carregando>
            Salvando
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button tamanho="sm" larguraTotal={false}>
            Small (32px)
          </Button>
          <Button tamanho="md" larguraTotal={false}>
            Medium (40px)
          </Button>
          <Button tamanho="lg" larguraTotal={false}>
            Large (44px)
          </Button>
          <Button tamanho="touch" larguraTotal={false}>
            Touch (56px — operador)
          </Button>
        </div>
      </Secao>

      <Secao titulo="Campos de formulário">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input rotulo="Tag" placeholder="Ex.: EMP-05" iconeEsquerda={<Search size={16} aria-hidden />} />
          <Input rotulo="Com erro" erro="Campo obrigatório." defaultValue="" />
          <Select
            rotulo="Tipo de equipamento"
            opcoes={[
              { valor: "empilhadeira", rotulo: "Empilhadeira" },
              { valor: "reach_stacker", rotulo: "Reach stacker" },
              { valor: "transpaleteira", rotulo: "Transpaleteira" },
            ]}
            valor={selecao}
            aoAlterar={setSelecao}
          />
          <Combobox
            rotulo="Combobox pesquisável"
            placeholder="Buscar operador..."
            opcoes={[
              { valor: "1", rotulo: "Juliana Aparecida Costa" },
              { valor: "2", rotulo: "Patrícia Almeida Rocha" },
              { valor: "3", rotulo: "Roberto Carlos Oliveira" },
            ]}
            valor={combo}
            aoAlterar={setCombo}
          />
          <DatePicker rotulo="Data" valor={data} aoAlterar={setData} />
          <Textarea rotulo="Observação" placeholder="Descreva o problema encontrado." />
        </div>
      </Secao>

      <Secao titulo="Badges e status">
        <div className="flex flex-wrap items-center gap-2">
          <Badge texto="Disponível" classeCor="text-status-disponivel bg-status-disponivel-surface" />
          <Badge texto="Com apontamento" classeCor="text-status-apontamento bg-status-apontamento-surface" />
          <Badge texto="Avariado" classeCor="text-status-avariado bg-status-avariado-surface" />
          <Badge texto="Em manutenção" classeCor="text-status-manutencao bg-status-manutencao-surface" />
        </div>
      </Secao>

      <Secao titulo="Cards e KPIs">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <KpiCard rotulo="Equipamentos disponíveis" valor={12} icone={<CheckCircle2 size={20} aria-hidden />} atual={12} anterior={9} />
          <KpiCard rotulo="Chamados abertos" valor={3} atual={3} anterior={5} />
          <Card densidade="densa">
            <p className="text-sm font-semibold text-foreground">Card denso</p>
            <p className="mt-1 text-sm text-foreground-muted">Conteúdo compacto.</p>
          </Card>
          <Card elevado>
            <p className="text-sm font-semibold text-foreground">Card elevado</p>
            <p className="mt-1 text-sm text-foreground-muted">Com sombra.</p>
          </Card>
        </div>
      </Secao>

      <Secao titulo="Progresso e loading">
        <Stepper etapas={["Identificação", "Itens", "Revisão"]} etapaAtualIndice={1} />
        <ProgressBar valorAtual={3} valorMaximo={5} rotulo="Itens respondidos" />
        <div className="flex items-center gap-4">
          <Spinner tamanho="sm" />
          <Spinner tamanho="md" />
          <Spinner tamanho="lg" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>
        <TableSkeleton linhas={3} colunas={4} />
      </Secao>

      <Secao titulo="Avatares">
        <div className="flex items-center gap-3">
          <Avatar nome="Juliana Aparecida Costa" tamanho="sm" />
          <Avatar nome="Patrícia Almeida Rocha" tamanho="md" />
          <Avatar nome="Roberto Carlos Oliveira" tamanho="lg" />
        </div>
      </Secao>

      <Secao titulo="Estado vazio">
        <EmptyState titulo="Nenhum registro encontrado" descricao="Ajuste os filtros ou cadastre um novo item." acao={<Button>Cadastrar</Button>} />
      </Secao>

      <Secao titulo="Overlays">
        <div className="flex flex-wrap items-center gap-3">
          <Button variante="secondary" larguraTotal={false} onClick={() => setModalAberto(true)}>
            Abrir Modal
          </Button>
          <Button variante="secondary" larguraTotal={false} onClick={() => setDrawerAberto(true)}>
            Abrir Drawer
          </Button>
          <Button variante="secondary" larguraTotal={false} onClick={() => setDrawerVoltarAberto(true)}>
            Abrir Drawer (voltar)
          </Button>
          <Button variante="danger" larguraTotal={false} onClick={() => setConfirmAberto(true)}>
            Abrir ConfirmDialog
          </Button>
          <Tooltip rotulo="Tooltip custom">
            <Button variante="ghost" larguraTotal={false} iconeEsquerda={<Sparkles size={14} aria-hidden />}>
              Hover pra ver tooltip
            </Button>
          </Tooltip>
        </div>

        <Modal aberto={modalAberto} titulo="Diálogo pequeno" onFechar={() => setModalAberto(false)}>
          <p className="text-sm text-foreground-muted">Modal é só para diálogos pequenos e pontuais — nunca para criar entidade.</p>
        </Modal>

        <Drawer aberto={drawerAberto} onFechar={() => setDrawerAberto(false)} titulo="Criar/editar registro">
          <p className="text-sm text-foreground-muted">Drawer lateral — padrão para criação/edição de entidade.</p>
        </Drawer>

        <Drawer
          aberto={drawerVoltarAberto}
          onFechar={() => setDrawerVoltarAberto(false)}
          titulo="Nova solicitação"
          navegacao="voltar"
        >
          <p className="text-sm text-foreground-muted">
            Variante da jornada de operador: o &quot;×&quot; dá lugar ao botão circular de voltar à esquerda do título,
            porque no celular a folha ocupa a tela toda e se comporta como uma tela a mais.
          </p>
        </Drawer>

        <ConfirmDialog
          aberto={confirmAberto}
          titulo="Excluir registro?"
          descricao="Esta ação não pode ser desfeita."
          onCancelar={() => setConfirmAberto(false)}
          onConfirmar={() => setConfirmAberto(false)}
        />
      </Secao>
    </div>
  );
}
