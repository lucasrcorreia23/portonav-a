import type { ReactNode } from "react";
import { EquipmentIllustration } from "@/components/equipamento/EquipmentIllustration";
import { ROTULO_TIPO_EQUIPAMENTO } from "@/components/equipamento/rotulos";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { EntradaTaxonomia } from "@/components/status/statusTaxonomy";
import type { Equipamento } from "@/lib/types";

/**
 * Card de identidade do equipamento — a mesma peça na confirmação (antes da
 * verificação), no resultado (depois) e no uso negado. O que muda entre as telas é
 * só o status exibido e a ação; por isso o `status` é recebido em vez de lido do
 * equipamento, e o rodapé é um slot.
 */
export function EquipmentIdentityCard({
  equipamento,
  status,
  titulo,
  acoes,
  preencherAltura = false,
  tom = "neutro",
  children,
}: {
  equipamento: Equipamento;
  status: EntradaTaxonomia;
  /** Sobrescreve a tag como título — usado quando o resultado precisa de um veredito textual. */
  titulo?: string;
  acoes?: ReactNode;
  /**
   * Estica o bloco até o fim da área visível: o produto fica centrado na sobra e a
   * ação ancora no rodapé, em vez de deixar espaço vazio embaixo. Só faz sentido
   * quando o bloco é o conteúdo principal da tela.
   */
  preencherAltura?: boolean;
  /**
   * "negativo" = equipamento que o operador não pode usar agora. A ilustração
   * esmaece para o card ler como "fora de operação" já de longe; a semântica em si
   * continua no <StatusBadge> e na nota (ícone + texto + cor), nunca só na opacidade.
   */
  tom?: "neutro" | "negativo";
  /** Conteúdo extra entre o local e as ações (ex.: itens reprovados, motivo do bloqueio). */
  children?: ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-6 ${preencherAltura ? "flex-1" : ""}`}>
      {/* Sem moldura: identidade, ilustração, status e local ficam centrados direto no
          branco da tela — a separação vem do espaço, não de borda ou superfície. */}
      <div
        className={`flex flex-col items-center justify-center gap-4 py-6 text-center ${
          preencherAltura ? "flex-1" : ""
        }`}
      >
        <div>
          <p className="text-sm text-foreground-subtle">{ROTULO_TIPO_EQUIPAMENTO[equipamento.tipo]}</p>
          <h1 className="text-display-md text-foreground">{titulo ?? equipamento.tag}</h1>
        </div>

        <EquipmentIllustration tipo={equipamento.tipo} className={tom === "negativo" ? "opacity-60" : ""} />

        <StatusBadge entrada={status} tamanho="lg" />

        <p className="text-sm text-foreground-muted">
          <span className="font-semibold">Local:</span> {equipamento.localizacaoAtual}
        </p>

        {children}
      </div>

      {acoes && <div className="flex w-full flex-col gap-2">{acoes}</div>}
    </div>
  );
}
