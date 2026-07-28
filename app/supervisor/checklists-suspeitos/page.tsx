"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { SuspiciousChecklistTable } from "@/components/supervisor/SuspiciousChecklistTable";
import { useChecklistsPreenchidos } from "@/lib/data/context";

export default function ChecklistsSuspeitosPage() {
  const checklists = useChecklistsPreenchidos();
  const suspeitos = checklists.filter((c) => c.suspeito).sort((a, b) => b.concluidoEm.localeCompare(a.concluidoEm));

  return (
    <div>
      <PageHeader
        titulo="Checklists em revisão"
        subtitulo={`${suspeitos.length} preenchimentos marcados como suspeitos pelo sistema antifraude.`}
      />
      <SuspiciousChecklistTable checklists={suspeitos} />
    </div>
  );
}
