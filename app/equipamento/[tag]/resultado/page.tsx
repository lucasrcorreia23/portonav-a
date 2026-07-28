"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { OperatorShell } from "@/components/layout/OperatorShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TAXONOMIA_RESULTADO_CHECKLIST } from "@/components/status/statusTaxonomy";
import {
  useApontamentos,
  useChamados,
  useChecklistsPreenchidos,
  useEquipamentos,
  useModelosChecklist,
  useSessoes,
} from "@/lib/data/context";

export default function ResultadoChecklistPage(props: PageProps<"/equipamento/[tag]/resultado">) {
  const { tag } = use(props.params);
  const router = useRouter();
  const equipamentos = useEquipamentos();
  const checklists = useChecklistsPreenchidos();
  const apontamentos = useApontamentos();
  const chamados = useChamados();
  const sessoes = useSessoes();
  const modelos = useModelosChecklist();

  const equipamento = equipamentos.find((e) => e.tag.toLowerCase() === tag.toLowerCase());
  if (!equipamento) notFound();

  const checklist = [...checklists]
    .filter((c) => c.equipamentoId === equipamento.id)
    .sort((a, b) => b.concluidoEm.localeCompare(a.concluidoEm))[0];

  if (!checklist) notFound();

  const modelo = modelos.find((m) => m.id === checklist.modeloChecklistId);
  const totalItens = checklist.respostas.length;
  const totalOk = checklist.respostas.filter((r) => !r.reprovado).length;
  const itensReprovados = checklist.respostas
    .filter((r) => r.reprovado)
    .map((r) => ({
      resposta: r,
      item: modelo?.secoes.flatMap((s) => s.itens).find((i) => i.id === r.itemId),
    }));

  const apontamentosGerados = apontamentos.filter((a) => a.origem.checklistPreenchidoId === checklist.id);
  const chamadoGerado = chamados.find((c) => c.apontamentoIds.some((id) => apontamentosGerados.some((a) => a.id === id)));
  const sessao = sessoes.find((s) => s.checklistPreenchidoId === checklist.id);

  const taxonomia = TAXONOMIA_RESULTADO_CHECKLIST[checklist.resultado];

  return (
    <OperatorShell>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-3 rounded-card-hero border border-neutral-100 bg-white p-8 text-center shadow-elevated">
          <StatusBadge entrada={taxonomia} tamanho="lg" />
          <h1 className="text-display-sm text-neutral-900">
            {checklist.resultado === "bloqueado"
              ? "Uso bloqueado"
              : checklist.resultado === "liberado_com_apontamento"
                ? "Liberado com apontamento"
                : "Equipamento liberado"}
          </h1>
          <p className="text-sm text-neutral-600">
            {totalOk}/{totalItens} itens verificados · {equipamento.tag}
          </p>
          {checklist.preenchidoOffline && (
            <p className="text-xs text-status-apontamento">Calculado com base no último status conhecido (offline).</p>
          )}
        </div>

        {itensReprovados.length > 0 && (
          <Card densidade="densa">
            <h2 className="mb-3 font-medium text-neutral-900">Itens reprovados</h2>
            <ul className="flex flex-col gap-3">
              {itensReprovados.map(({ resposta, item }) => (
                <li key={resposta.itemId} className="flex flex-col gap-1 border-b border-neutral-100 pb-3 last:border-0 last:pb-0">
                  <p className="text-sm font-medium text-neutral-800">{item?.titulo ?? "Item"}</p>
                  {resposta.observacao && <p className="text-sm text-neutral-600">{resposta.observacao}</p>}
                  {resposta.fotoEvidencia && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resposta.fotoEvidencia.dataUrl}
                      alt={`Evidência: ${item?.titulo ?? "item"}`}
                      className="mt-1 h-28 w-40 rounded-control object-cover"
                    />
                  )}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {chamadoGerado && (
          <p className="text-center text-sm text-neutral-600">
            {checklist.resultado === "bloqueado" ? "Chamado de manutenção aberto automaticamente" : "Manutenção notificada"} — chamado{" "}
            <span className="font-medium">#{chamadoGerado.id.slice(-6).toUpperCase()}</span>
          </p>
        )}

        <div className="flex flex-col gap-2">
          {checklist.resultado !== "bloqueado" && sessao ? (
            <Button tamanho="lg" larguraTotal onClick={() => router.push(`/equipamento/${equipamento.tag}/sessao`)}>
              Iniciar operação
            </Button>
          ) : (
            <Button tamanho="lg" larguraTotal onClick={() => router.push("/operador")}>
              Voltar ao início
            </Button>
          )}
        </div>
      </div>
    </OperatorShell>
  );
}
