"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { ChamadoBoard } from "@/components/chamados/ChamadoBoard";
import { useChamados, useEquipamentos } from "@/lib/data/context";

export default function QuadroChamadosPage() {
  const chamados = useChamados();
  const equipamentos = useEquipamentos();

  return (
    <div>
      <PageHeader titulo="Chamados de manutenção" subtitulo={`${chamados.length} chamados no total.`} />
      <ChamadoBoard chamados={chamados} equipamentos={equipamentos} />
    </div>
  );
}
