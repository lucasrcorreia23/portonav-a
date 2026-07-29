"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TAXONOMIA_STATUS_CHAMADO } from "@/components/status/statusTaxonomy";
import { RegistrarReparoForm } from "@/components/chamados/RegistrarReparoForm";
import { useApontamentos, useChamados, useEquipamentos, useEstadoDemo } from "@/lib/data/context";

export default function ChamadoDetailPage(props: PageProps<"/manutencao/chamados/[id]">) {
  const { id } = use(props.params);
  const chamados = useChamados();
  const equipamentos = useEquipamentos();
  const apontamentos = useApontamentos();
  const demo = useEstadoDemo();

  const chamado = chamados.find((c) => c.id === id);
  if (!chamado) notFound();

  const equipamento = equipamentos.find((e) => e.id === chamado.equipamentoId);
  const apontamentosDoChamado = apontamentos.filter((a) => chamado.apontamentoIds.includes(a.id));

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader
        titulo={`Chamado — ${equipamento?.tag ?? "—"}`}
        subtitulo={chamado.origemAutomatica ? "Gerado automaticamente a partir de um checklist" : "Aberto manualmente"}
        acoes={<StatusBadge entrada={TAXONOMIA_STATUS_CHAMADO[chamado.status]} />}
      />

      {equipamento && (
        <Link href={`/equipamento/${equipamento.tag}`} className="text-sm text-brand-600 hover:underline">
          Ver ficha do equipamento →
        </Link>
      )}

      {apontamentosDoChamado.length > 0 && (
        <Card densidade="densa">
          <h2 className="mb-3 font-medium text-neutral-900">Apontamentos</h2>
          <ul className="flex flex-col gap-3">
            {apontamentosDoChamado.map((ap) => (
              <li key={ap.id} className="flex flex-col gap-1 border-b border-neutral-100 pb-3 last:border-0 last:pb-0">
                <p className="text-sm font-medium text-neutral-800">
                  {ap.origem.itemTitulo} ({ap.criticidade === "critica" ? "crítico" : "não crítico"})
                </p>
                <p className="text-sm text-neutral-600">{ap.descricao}</p>
                {ap.fotoEvidencia && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ap.fotoEvidencia.dataUrl} alt={ap.origem.itemTitulo} className="mt-1 h-28 w-40 rounded-control object-cover" />
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {chamado.registroReparo && (
        <Card densidade="densa">
          <h2 className="mb-2 font-medium text-neutral-900">Reparo registrado</h2>
          <p className="text-sm text-neutral-700">{chamado.registroReparo.descricao}</p>
          {chamado.registroReparo.pecasTrocadas.length > 0 && (
            <p className="mt-1 text-sm text-neutral-500">Peças: {chamado.registroReparo.pecasTrocadas.join(", ")}</p>
          )}
        </Card>
      )}

      {(chamado.status === "aberto" || chamado.status === "em_atendimento") && !chamado.registroReparo && (
        <Card densidade="densa">
          <h2 className="mb-3 font-medium text-neutral-900">Registrar reparo</h2>
          <RegistrarReparoForm chamadoId={chamado.id} perfilAtivo={demo.perfilAtivo} />
        </Card>
      )}

      {chamado.status === "aguardando_liberacao" && (
        <Card densidade="densa">
          <h2 className="mb-2 font-medium text-neutral-900">Aguardando aprovação do supervisor</h2>
          <p className="text-sm text-neutral-600">
            Reparo registrado — a liberação do equipamento exige aprovação de supervisor (ou admin) em{" "}
            <Link href="/supervisor/liberacoes" className="font-medium text-brand-600 hover:underline">
              Supervisor → Liberações
            </Link>
            .
          </p>
        </Card>
      )}

      {chamado.status === "concluido" && chamado.liberacao && (
        <p className="text-sm text-neutral-600">
          Liberado por {chamado.liberacao.liberadoPor.nome} em{" "}
          {new Date(chamado.liberacao.liberadoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}.
        </p>
      )}
    </div>
  );
}
