"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { EquipmentIdentityCard } from "@/components/equipamento/EquipmentIdentityCard";
import { OperatorShell } from "@/components/layout/OperatorShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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
  // A sessão de uso já foi aberta pela conclusão do checklist — não existe passo de
  // "iniciar operação", e nada é cronometrado. Aqui a tela só comunica a liberação; o
  // equipamento aparece como "em uso" na home do operador até ele devolver.
  const liberadoParaUso = checklist.resultado !== "bloqueado" && Boolean(sessao);
  // Sem reprovações nem chamado, o card é a tela inteira: estica até o rodapé como na
  // confirmação, em vez de flutuar com espaço branco embaixo. Havendo conteúdo depois
  // dele, volta à altura natural para não empurrar o resto para fora da dobra.
  const cardOcupaTela = itensReprovados.length === 0 && !chamadoGerado;

  return (
    <OperatorShell>
      <div className={`flex flex-col gap-5 ${cardOcupaTela ? "flex-1" : ""}`}>
        {/* Mesma peça da tela de confirmação — o operador reconhece o equipamento
            que acabou de verificar; o que muda é o status e a ação. */}
        <EquipmentIdentityCard
          equipamento={equipamento}
          status={taxonomia}
          preencherAltura={cardOcupaTela}
          tom={checklist.resultado === "bloqueado" ? "negativo" : "neutro"}
          acoes={
            <Button tamanho="touch" larguraTotal onClick={() => router.push("/operador")}>
              {liberadoParaUso ? "Ótimo" : "Voltar ao início"}
            </Button>
          }
        >
          <div className="flex flex-col gap-1">
            {liberadoParaUso && (
              <p className="text-sm text-foreground">
                Você está liberado para iniciar suas tarefas com este equipamento.
              </p>
            )}
            <p className="text-sm text-foreground-muted">
              {totalOk}/{totalItens} itens verificados
            </p>
            {checklist.preenchidoOffline && (
              <p className="text-xs text-status-apontamento">
                Calculado com base no último status conhecido (offline).
              </p>
            )}
          </div>
        </EquipmentIdentityCard>

        {itensReprovados.length > 0 && (
          <Card densidade="densa">
            <h2 className="mb-3 font-medium text-foreground">Itens reprovados</h2>
            <ul className="flex flex-col gap-3">
              {itensReprovados.map(({ resposta, item }) => (
                <li key={resposta.itemId} className="flex flex-col gap-1 border-b border-border pb-3 last:border-0 last:pb-0">
                  <p className="text-sm font-medium text-foreground">{item?.titulo ?? "Item"}</p>
                  {resposta.observacao && <p className="text-sm text-foreground-muted">{resposta.observacao}</p>}
                  {resposta.fotoEvidencia && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resposta.fotoEvidencia.dataUrl}
                      alt={`Evidência: ${item?.titulo ?? "item"}`}
                      className="mt-1 h-28 w-40 rounded-card object-cover"
                    />
                  )}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {chamadoGerado && (
          <p className="text-center text-sm text-foreground-muted">
            {checklist.resultado === "bloqueado" ? "Chamado de manutenção aberto automaticamente" : "Manutenção notificada"} — chamado{" "}
            <span className="font-medium">#{chamadoGerado.id.slice(-6).toUpperCase()}</span>
          </p>
        )}

      </div>
    </OperatorShell>
  );
}
