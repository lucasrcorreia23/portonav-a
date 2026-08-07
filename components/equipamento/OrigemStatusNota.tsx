import { RefreshCw } from "lucide-react";
import { useEstadoDemo } from "@/lib/data/context";
import type { HistoricoEvento } from "@/lib/types";

/**
 * Verbaliza o ramo "aplicativo com conexão?" do fluxo A2 no momento em que o operador
 * consulta o status do equipamento. Só aparece OFFLINE, para avisar que o status é o
 * último conhecido: online o dado é o corrente e a nota era só ruído na tela.
 */
export function OrigemStatusNota({ ultimoEvento }: { ultimoEvento: HistoricoEvento | undefined }) {
  const demo = useEstadoDemo();

  if (!demo.offline) return null;

  return (
    <p className="inline-flex items-center gap-1.5 text-xs text-status-apontamento">
      <RefreshCw size={12} aria-hidden />
      Último status conhecido
      {ultimoEvento &&
        ` (${new Date(ultimoEvento.em).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })})`}{" "}
      — sincroniza automaticamente ao reconectar.
    </p>
  );
}
