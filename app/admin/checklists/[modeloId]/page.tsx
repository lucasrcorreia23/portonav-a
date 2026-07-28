"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { ChecklistModelBuilder } from "@/components/checklist/ChecklistModelBuilder";
import { useModelosChecklist } from "@/lib/data/context";

export default function EditarModeloChecklistPage(props: PageProps<"/admin/checklists/[modeloId]">) {
  const { modeloId } = use(props.params);
  const modelos = useModelosChecklist();
  const modelo = modelos.find((m) => m.id === modeloId);

  if (!modelo) {
    notFound();
  }

  return (
    <div>
      <PageHeader titulo={`Editar: ${modelo.nome}`} subtitulo={`Versão atual: v${modelo.versao}`} />
      <ChecklistModelBuilder modeloInicial={modelo} />
    </div>
  );
}
