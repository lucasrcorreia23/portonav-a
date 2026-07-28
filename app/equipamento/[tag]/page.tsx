"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { FichaAdmin } from "@/components/equipamento/FichaAdmin";
import { FichaGestao } from "@/components/equipamento/FichaGestao";
import { FluxoOperador } from "@/components/equipamento/FluxoOperador";
import { OperatorShell } from "@/components/layout/OperatorShell";
import {
  useChamados,
  useEquipamentos,
  useEstadoDemo,
  useHistoricoCompleto,
  useModelosChecklist,
  useOperadores,
} from "@/lib/data/context";

export default function FichaEquipamentoPage(props: PageProps<"/equipamento/[tag]">) {
  const { tag } = use(props.params);
  const equipamentos = useEquipamentos();
  const demo = useEstadoDemo();
  const operadores = useOperadores();
  const historicoCompleto = useHistoricoCompleto();
  const chamados = useChamados();
  const modelos = useModelosChecklist();
  // Real, capturado uma única vez — somado ao deslocamento do "avançar o tempo" para
  // decidir se uma previsão de manutenção está atrasada, sem chamar Date.now() no render.
  const [agoraRealMs] = useState(() => Date.now());

  const equipamento = equipamentos.find((e) => e.tag.toLowerCase() === tag.toLowerCase());
  if (!equipamento) {
    notFound();
  }

  const historico = historicoCompleto
    .filter((h) => h.equipamentoId === equipamento.id)
    .sort((a, b) => b.em.localeCompare(a.em));

  if (demo.perfilAtivo === "admin") {
    const modeloChecklist = modelos.find((m) => m.id === equipamento.modeloChecklistIdPadrao);
    const previsaoAtrasada = Boolean(
      equipamento.previsaoManutencao &&
        agoraRealMs + demo.deslocamentoTempoMs > new Date(equipamento.previsaoManutencao.previsaoConclusaoEm).getTime(),
    );
    return (
      <FichaAdmin
        equipamento={equipamento}
        historico={historico}
        modeloChecklist={modeloChecklist}
        previsaoAtrasada={previsaoAtrasada}
      />
    );
  }

  if (demo.perfilAtivo === "supervisor" || demo.perfilAtivo === "manutencao") {
    const chamadoAtivo = equipamento.chamadoAtivoId ? chamados.find((c) => c.id === equipamento.chamadoAtivoId) : undefined;
    return <FichaGestao equipamento={equipamento} historico={historico} chamadoAtivo={chamadoAtivo} />;
  }

  // perfil "operador"
  const operador = operadores.find((o) => o.id === demo.operadorAtivoId) ?? operadores[0];
  if (!operador) {
    notFound();
  }

  return (
    <OperatorShell>
      <FluxoOperador equipamento={equipamento} operador={operador} />
    </OperatorShell>
  );
}
