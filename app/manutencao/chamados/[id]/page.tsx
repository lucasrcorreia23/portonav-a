"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TAXONOMIA_STATUS_CHAMADO } from "@/components/status/statusTaxonomy";
import { RegistrarReparoForm } from "@/components/chamados/RegistrarReparoForm";
import { BadgeIA } from "@/components/ia/BadgeIA";
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
          <h2 className="mb-3 font-medium text-foreground">Apontamentos</h2>
          <ul className="flex flex-col gap-3">
            {apontamentosDoChamado.map((ap) => (
              <li key={ap.id} className="flex flex-col gap-1 border-b border-border pb-3 last:border-0 last:pb-0">
                <p className="text-sm font-medium text-foreground">
                  {ap.origem.itemTitulo} ({ap.criticidade === "critica" ? "crítico" : "não crítico"})
                </p>
                <p className="inline-flex items-center gap-1.5 text-sm text-foreground-muted">
                  {ap.descricao}
                  {ap.descricaoOrigemIA && <BadgeIA />}
                </p>
                {ap.fotoEvidencia && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ap.fotoEvidencia.dataUrl} alt={ap.origem.itemTitulo} className="mt-1 h-28 w-40 rounded-card object-cover" />
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {chamado.analiseAdmin && (
        <Card densidade="densa">
          <div className="mb-2 flex items-center gap-2">
            <h2 className="font-medium text-foreground">Análise do administrador</h2>
            {chamado.analiseAdmin.geradoPorIA && <BadgeIA />}
          </div>
          <p className="whitespace-pre-line text-sm text-foreground-muted">{chamado.analiseAdmin.texto}</p>
          <p className="mt-2 text-xs text-foreground-subtle">
            {chamado.analiseAdmin.analisadoPor.nome} em{" "}
            {new Date(chamado.analiseAdmin.analisadoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
          </p>
        </Card>
      )}

      {chamado.registroReparo && (
        <Card densidade="densa">
          <h2 className="mb-2 font-medium text-foreground">Reparo registrado</h2>
          <p className="text-sm text-foreground-muted">{chamado.registroReparo.descricao}</p>
          {chamado.registroReparo.pecasTrocadas.length > 0 && (
            <p className="mt-1 text-sm text-foreground-subtle">Peças: {chamado.registroReparo.pecasTrocadas.join(", ")}</p>
          )}
        </Card>
      )}

      {(chamado.status === "aberto" || chamado.status === "em_atendimento") && !chamado.registroReparo && (
        <Card densidade="densa">
          <h2 className="mb-3 font-medium text-foreground">Registrar reparo</h2>
          <RegistrarReparoForm chamadoId={chamado.id} perfilAtivo={demo.perfilAtivo} />
        </Card>
      )}

      {chamado.status === "aguardando_liberacao" && (
        <Card densidade="densa">
          <h2 className="mb-2 font-medium text-foreground">Aguardando aprovação do supervisor</h2>
          <p className="text-sm text-foreground-muted">
            Reparo registrado — a liberação do equipamento exige aprovação de supervisor (ou admin) em{" "}
            <Link href="/supervisor/liberacoes" className="font-medium text-brand-600 hover:underline">
              Supervisor → Liberações
            </Link>
            .
          </p>
        </Card>
      )}

      {chamado.status === "concluido" && chamado.liberacao && (
        <p className="text-sm text-foreground-muted">
          Liberado por {chamado.liberacao.liberadoPor.nome} em{" "}
          {new Date(chamado.liberacao.liberadoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}.
        </p>
      )}
    </div>
  );
}
