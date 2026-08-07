"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { CheckCircle2, ClipboardList } from "lucide-react";
import { EquipmentIdentityCard } from "@/components/equipamento/EquipmentIdentityCard";
import { OperatorPageHeader } from "@/components/layout/OperatorPageHeader";
import { OperatorShell } from "@/components/layout/OperatorShell";
import { ScanFakeCamera } from "@/components/qr-entry/ScanFakeCamera";
import { Button } from "@/components/ui/Button";
import { TAXONOMIA_STATUS_EQUIPAMENTO } from "@/components/status/statusTaxonomy";
import { useEquipamentos, useOperadores, useRepositorio, useSessoes, useTarefas } from "@/lib/data/context";
import type { Id } from "@/lib/types";

/**
 * Tela de devolução do equipamento. A "sessão" existe só para registrar quem está com
 * o equipamento — nada aqui é cronometrado, então não há relógio nem duração: o operador
 * chega por esta tela quando termina e confirma a devolução.
 *
 * Devolver a máquina encerra a tarefa junto: para o operador é o mesmo gesto ("terminei"),
 * e cobrar um segundo toque para dizer que a demanda acabou só adiciona atrito. Se ela não
 * acabou, a saída é uma solicitação nova — não reabrir a que foi concluída.
 *
 * A devolução começa por uma nova leitura do QR: assim como a retirada, ela só vale
 * com o operador de volta ao lado da máquina. O scan é sempre exigido porque nem todo
 * caminho até aqui passou por uma leitura ("Devolver" no card da tarefa, por exemplo,
 * pode ser tocado de qualquer lugar do pátio).
 */
export default function DevolucaoPage(props: PageProps<"/equipamento/[tag]/sessao">) {
  const { tag } = use(props.params);
  const equipamentos = useEquipamentos();
  const operadores = useOperadores();
  const sessoes = useSessoes();
  const tarefas = useTarefas();
  const repo = useRepositorio();
  const router = useRouter();
  const [qrLido, setQrLido] = useState(false);
  const [devolvido, setDevolvido] = useState<{ tarefaId?: Id } | null>(null);

  const equipamento = equipamentos.find((e) => e.tag.toLowerCase() === tag.toLowerCase());
  if (!equipamento) notFound();

  const sessao = sessoes.find((s) => s.equipamentoId === equipamento.id && s.status === "em_andamento");
  const operador = sessao ? operadores.find((o) => o.id === sessao.operadorId) : undefined;
  const tarefaDaSessao = sessao
    ? tarefas.find(
        (t) => t.operadorId === sessao.operadorId && t.equipamentoId === sessao.equipamentoId && t.status === "aprovada",
      )
    : undefined;

  // Depois de devolver, a própria sessão deixa de aparecer como "em_andamento" (efeito
  // esperado da devolução) — só redireciona se isso acontecer por qualquer OUTRO motivo.
  useEffect(() => {
    if (!sessao && !devolvido) {
      router.replace(`/equipamento/${equipamento.tag}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessao, devolvido]);

  if (devolvido) {
    const tarefaEncerramento = devolvido.tarefaId ? tarefas.find((t) => t.id === devolvido.tarefaId) : undefined;

    return (
      <OperatorShell>
        <div className="flex flex-1 flex-col gap-4">
          {/* Mesma peça da tela anterior: o operador reconhece a máquina que acabou de
              devolver, e o veredito é o próprio status — "Disponível" (ou "Com apontamento",
              se sobrou chamado ativo) diz o que a prosa dizia antes. */}
          <EquipmentIdentityCard
            equipamento={equipamento}
            status={TAXONOMIA_STATUS_EQUIPAMENTO[equipamento.status]}
            preencherAltura
            acoes={
              <>
                <Button tamanho="touch" larguraTotal onClick={() => router.push("/operador")}>
                  Voltar ao início
                </Button>
                {/* A demanda pode não ter acabado com a devolução. Em vez de reagendar a tarefa
                    que acabou de ser concluída (reagendar() só age em tarefa aprovada, então
                    seria um no-op silencioso), abre uma solicitação nova para o mesmo
                    equipamento — o mesmo contrato ?nova=1&tag= usado pelo gate da ficha. */}
                <Button
                  variante="ghost"
                  tamanho="touch"
                  larguraTotal
                  iconeEsquerda={<ClipboardList size={18} aria-hidden />}
                  onClick={() => router.push(`/operador?nova=1&tag=${equipamento.tag}`)}
                >
                  Nova solicitação para {equipamento.tag}
                </Button>
              </>
            }
          >
            <div className="flex flex-col items-center gap-1">
              <p className="text-sm text-foreground">Devolvido e registrado no histórico do equipamento.</p>
              {tarefaEncerramento?.status === "concluida" && (
                <p className="inline-flex items-center gap-1.5 text-sm font-medium text-status-disponivel">
                  <CheckCircle2 size={16} aria-hidden /> Tarefa concluída.
                </p>
              )}
            </div>
          </EquipmentIdentityCard>
        </div>
      </OperatorShell>
    );
  }

  if (!sessao || !operador) {
    return null;
  }

  // Etapa 1: releitura do QR fixado no equipamento. Sem o cabeçalho do shell — é uma
  // tela de foco: só o título com o voltar, e o visor ocupando todo o resto da altura.
  if (!qrLido) {
    return (
      <OperatorShell>
        <div className="flex flex-1 flex-col gap-4">
          <OperatorPageHeader
            titulo={`Devolver ${equipamento.tag}`}
            descricao="Escaneie de novo o QR do equipamento para registrar a devolução no lugar onde ele ficou."
            aoVoltar={() => router.push("/operador")}
            rotuloVoltar="Voltar ao início"
          />
          <ScanFakeCamera tagAlvo={equipamento.tag} onDetectado={() => setQrLido(true)} preencherAltura />
          <Button variante="ghost" tamanho="touch" larguraTotal onClick={() => router.push("/operador")}>
            Ainda estou usando
          </Button>
        </div>
      </OperatorShell>
    );
  }

  function aoDevolver() {
    if (!sessao) return;
    // Nesta ordem: encerrar devolve o equipamento ao repouso (disponível, ou com
    // apontamento se sobrou chamado ativo), concluir fecha a demanda. Devolver a máquina e
    // encerrar a tarefa são o mesmo gesto para o operador — não vale um toque a mais.
    repo.sessoes.encerrar(sessao.id);
    if (tarefaDaSessao) {
      repo.tarefas.concluir(tarefaDaSessao.id);
    }
    setDevolvido({ tarefaId: tarefaDaSessao?.id });
  }

  return (
    <OperatorShell>
      <div className="flex flex-1 flex-col gap-4">
        <EquipmentIdentityCard
          equipamento={equipamento}
          status={TAXONOMIA_STATUS_EQUIPAMENTO.em_uso}
          preencherAltura
          acoes={
            <>
              <Button tamanho="touch" larguraTotal onClick={aoDevolver}>
                Confirmar devolução
              </Button>
              <Button variante="ghost" tamanho="touch" larguraTotal onClick={() => router.push("/operador")}>
                Ainda estou usando
              </Button>
            </>
          }
        >
          {/* Uma linha só. O QR acabou de ser lido, o operador está ao lado da máquina:
              repetir a tag, a demanda e o apontamento aqui só empilha texto sobre a única
              decisão da tela — devolver ou não. */}
          <p className="text-sm text-foreground">Este equipamento está com você, {operador.nome.split(" ")[0]}.</p>
        </EquipmentIdentityCard>
      </div>
    </OperatorShell>
  );
}
