import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  ClipboardCheck,
  PlusCircle,
  RefreshCw,
  ShieldCheck,
  Square,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { HistoricoEvento, TipoEventoHistorico } from "@/lib/types";

const ICONE_POR_TIPO: Record<TipoEventoHistorico, LucideIcon> = {
  equipamento_cadastrado: PlusCircle,
  checklist_preenchido: ClipboardCheck,
  equipamento_liberado_uso: CheckCircle2,
  equipamento_bloqueado: Ban,
  apontamento_criado: AlertTriangle,
  chamado_aberto: Wrench,
  chamado_status_alterado: Wrench,
  chamado_concluido_liberacao: ShieldCheck,
  sessao_operacao_encerrada: Square,
  sincronizacao_offline: RefreshCw,
};

export function EquipmentHistoryTimeline({ eventos }: { eventos: HistoricoEvento[] }) {
  if (eventos.length === 0) {
    return <p className="text-sm text-neutral-500">Nenhum evento registrado ainda.</p>;
  }

  return (
    <ol className="flex flex-col gap-4">
      {eventos.map((evento) => {
        const Icone = ICONE_POR_TIPO[evento.tipo];
        return (
          <li key={evento.id} className="flex gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-pill bg-neutral-100 text-neutral-600">
              <Icone size={14} aria-hidden />
            </div>
            <div>
              <p className="text-sm text-neutral-800">{evento.resumo}</p>
              <p className="text-xs text-neutral-500">
                {new Date(evento.em).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
