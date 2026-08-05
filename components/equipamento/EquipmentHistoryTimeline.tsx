import {
  AlertTriangle,
  Ban,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  PlusCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Square,
  Wrench,
  XCircle,
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
  chamado_analise_admin_registrada: Sparkles,
  sessao_operacao_encerrada: Square,
  sincronizacao_offline: RefreshCw,
  tarefa_criada: ClipboardList,
  tarefa_aprovada: ClipboardCheck,
  tarefa_rejeitada: XCircle,
  tarefa_concluida: CheckCircle2,
  tarefa_reagendada: CalendarClock,
};

export function EquipmentHistoryTimeline({ eventos }: { eventos: HistoricoEvento[] }) {
  if (eventos.length === 0) {
    return <p className="text-sm text-foreground-subtle">Nenhum evento registrado ainda.</p>;
  }

  return (
    <ol className="flex flex-col gap-4">
      {eventos.map((evento) => {
        const Icone = ICONE_POR_TIPO[evento.tipo];
        return (
          <li key={evento.id} className="flex gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-pill bg-surface-3 text-foreground-muted">
              <Icone size={14} aria-hidden />
            </div>
            <div>
              <p className="text-sm text-foreground">{evento.resumo}</p>
              <p className="text-xs text-foreground-subtle">
                {new Date(evento.em).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
