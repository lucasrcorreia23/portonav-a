"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { AprovarLiberacaoCard } from "@/components/chamados/AprovarLiberacaoCard";
import { useChamados, useEquipamentos, useEstadoDemo } from "@/lib/data/context";

export default function LiberacoesPage() {
  const chamados = useChamados();
  const equipamentos = useEquipamentos();
  const demo = useEstadoDemo();

  const aguardandoLiberacao = chamados
    .filter((c) => c.status === "aguardando_liberacao")
    .sort((a, b) => (a.registroReparo?.registradoEm ?? a.abertoEm).localeCompare(b.registroReparo?.registradoEm ?? b.abertoEm));

  return (
    <div>
      <PageHeader
        titulo="Liberações"
        subtitulo="Reparos registrados pela manutenção, aguardando aprovação para liberar o equipamento."
      />
      {aguardandoLiberacao.length === 0 ? (
        <p className="text-sm text-foreground-subtle">Nenhum reparo aguardando liberação.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {aguardandoLiberacao.map((chamado) => (
            <AprovarLiberacaoCard
              key={chamado.id}
              chamado={chamado}
              equipamento={equipamentos.find((e) => e.id === chamado.equipamentoId)}
              perfilAtivo={demo.perfilAtivo}
            />
          ))}
        </div>
      )}
    </div>
  );
}
