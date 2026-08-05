import { RefreshCw, Wifi } from "lucide-react";
import { useEstadoDemo } from "@/lib/data/context";
import type { HistoricoEvento } from "@/lib/types";

/**
 * Verbaliza o ramo "aplicativo com conexão?" do fluxo A2 no momento em que o operador
 * consulta o status do equipamento — online sempre lê ao vivo (não há backend real
 * aqui, mas a origem precisa ficar explícita); offline mostra que o status é o último
 * conhecido, com o horário do evento mais recente, e que a sincronização é automática.
 */
export function OrigemStatusNota({ ultimoEvento }: { ultimoEvento: HistoricoEvento | undefined }) {
  const demo = useEstadoDemo();

  if (!demo.offline) {
    return (
      <p className="inline-flex items-center gap-1.5 text-xs text-foreground-subtle">
        <Wifi size={12} aria-hidden /> Status verificado agora.
      </p>
    );
  }

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
