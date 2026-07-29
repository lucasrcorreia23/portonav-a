"use client";

import { use, useEffect } from "react";
import { notFound, useRouter } from "next/navigation";
import { OperatorShell } from "@/components/layout/OperatorShell";
import { DraftChecklistProvider } from "./draft-context";
import { useEquipamentos, useEstadoDemo, useModelosChecklist, useOperadores, useRepositorio } from "@/lib/data/context";

export default function ChecklistLayout({ children, params }: LayoutProps<"/equipamento/[tag]/checklist">) {
  const { tag } = use(params);
  const equipamentos = useEquipamentos();
  const operadores = useOperadores();
  const modelos = useModelosChecklist();
  const demo = useEstadoDemo();
  const repo = useRepositorio();
  const router = useRouter();

  const equipamento = equipamentos.find((e) => e.tag.toLowerCase() === tag.toLowerCase());
  if (!equipamento) {
    notFound();
  }

  // Mesmo fallback da ficha do equipamento: sem operador ativo no demo, usa o primeiro.
  const operador = operadores.find((o) => o.id === demo.operadorAtivoId) ?? operadores[0];
  const modelo = modelos.find((m) => m.id === equipamento.modeloChecklistIdPadrao);

  const podeIniciar = Boolean(
    operador &&
      modelo &&
      equipamento.status !== "bloqueado" &&
      equipamento.status !== "em_manutencao" &&
      repo.operadores.possuiHabilitacaoValida(operador.id, equipamento.tipo),
  );

  useEffect(() => {
    if (!podeIniciar) {
      router.replace(`/equipamento/${equipamento.tag}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [podeIniciar, equipamento.tag]);

  if (!podeIniciar || !operador || !modelo) {
    return null;
  }

  return (
    <OperatorShell>
      <DraftChecklistProvider equipamento={equipamento} operador={operador} modelo={modelo}>
        {children}
      </DraftChecklistProvider>
    </OperatorShell>
  );
}
