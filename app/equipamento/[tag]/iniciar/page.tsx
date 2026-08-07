"use client";

import { use, useEffect } from "react";
import { notFound, useRouter } from "next/navigation";
import { OperatorPageHeader } from "@/components/layout/OperatorPageHeader";
import { OperatorShell } from "@/components/layout/OperatorShell";
import { ScanFakeCamera } from "@/components/qr-entry/ScanFakeCamera";
import { Button } from "@/components/ui/Button";
import { useEquipamentos, useEstadoDemo, useOperadores, useRepositorio } from "@/lib/data/context";

/**
 * Leitura do QR na retirada — o par da tela de devolução, e pelo mesmo motivo: o operador
 * só está de fato ao lado da máquina quando lê a etiqueta dela. "Iniciar" no card da tarefa
 * pode ser tocado de qualquer lugar do pátio, então é aqui que a jornada encosta no
 * equipamento físico antes da verificação de pré-operação.
 *
 * Quem chega por /entrada já escaneou e vai direto para a ficha — esta tela não entra no
 * caminho dele.
 */
export default function IniciarPage(props: PageProps<"/equipamento/[tag]/iniciar">) {
  const { tag } = use(props.params);
  const equipamentos = useEquipamentos();
  const operadores = useOperadores();
  const demo = useEstadoDemo();
  const repo = useRepositorio();
  const router = useRouter();

  const equipamento = equipamentos.find((e) => e.tag.toLowerCase() === tag.toLowerCase());
  if (!equipamento) notFound();

  // Mesmo fallback da ficha e do layout do checklist: sem operador ativo, usa o primeiro.
  const operador = operadores.find((o) => o.id === demo.operadorAtivoId) ?? operadores[0];

  // Só encena o scan quando existe de fato uma tarefa aprovada para retirar. Num link
  // direto sem tarefa, a ficha já explica a pendência — fazer o operador escanear antes
  // seria trabalho jogado fora. O status do equipamento, ao contrário, NÃO é verificado
  // aqui: descobrir que a máquina está avariada só depois de escanear é o que acontece no
  // pátio, e é o que /entrada já faz.
  const temTarefaAprovada = Boolean(operador && repo.tarefas.buscarAprovadaAtiva(operador.id, equipamento.id));

  useEffect(() => {
    if (!temTarefaAprovada) {
      router.replace(`/equipamento/${equipamento.tag}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [temTarefaAprovada, equipamento.tag]);

  if (!temTarefaAprovada) {
    return null;
  }

  return (
    <OperatorShell>
      <div className="flex flex-1 flex-col gap-4">
        <OperatorPageHeader
          titulo={`Iniciar ${equipamento.tag}`}
          descricao="Escaneie o QR fixado no equipamento para conferir a disponibilidade antes da verificação."
          aoVoltar={() => router.push("/operador")}
          rotuloVoltar="Voltar ao início"
        />
        {/* replace, não push: com push o voltar da ficha cairia de novo no leitor e
            reiniciaria o scan em looping. */}
        <ScanFakeCamera
          tagAlvo={equipamento.tag}
          onDetectado={() => router.replace(`/equipamento/${equipamento.tag}`)}
          preencherAltura
        />
        <Button variante="ghost" tamanho="touch" larguraTotal onClick={() => router.push("/operador")}>
          Agora não
        </Button>
      </div>
    </OperatorShell>
  );
}
