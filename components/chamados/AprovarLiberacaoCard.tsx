"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { agora, useRepositorio } from "@/lib/data/context";
import type { ChamadoManutencao, Equipamento, Perfil } from "@/lib/types";

/** Rótulo estável — este protótipo não tem login/identidade individual por perfil. */
const NOME_SUPERVISOR = "Supervisor";

export function AprovarLiberacaoCard({
  chamado,
  equipamento,
  perfilAtivo,
}: {
  chamado: ChamadoManutencao;
  equipamento: Equipamento | undefined;
  perfilAtivo: Perfil;
}) {
  const repo = useRepositorio();
  const [observacao, setObservacao] = useState("");

  function aoAprovar() {
    repo.manutencao.liberarChamado(chamado.id, {
      liberadoPor: { perfil: perfilAtivo, nome: NOME_SUPERVISOR },
      liberadoEm: agora().toISOString(),
      observacao: observacao.trim() || undefined,
    });
  }

  return (
    <Card densidade="densa" className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-foreground">{equipamento?.tag ?? "—"}</p>
          {chamado.registroReparo && <p className="text-sm text-foreground-muted">{chamado.registroReparo.descricao}</p>}
        </div>
        {equipamento && (
          <Link href={`/equipamento/${equipamento.tag}`} className="shrink-0 text-sm text-brand-600 hover:underline">
            Ver ficha →
          </Link>
        )}
      </div>
      <Textarea
        rotulo="Observação (opcional)"
        value={observacao}
        onChange={(e) => setObservacao(e.target.value)}
        rows={2}
      />
      <Button onClick={aoAprovar}>Aprovar e liberar</Button>
    </Card>
  );
}
