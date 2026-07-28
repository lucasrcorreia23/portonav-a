import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { MotivoSuspeita } from "@/lib/types";

function rotular(motivo: MotivoSuspeita): string {
  switch (motivo.tipo) {
    case "tempo_minimo_nao_atingido":
      return `Seção em ${motivo.duracaoSegundos}s (mínimo ${motivo.minimoEsperadoSegundos}s)`;
    case "preenchimento_recorde":
      return `Checklist inteiro em ${motivo.duracaoTotalSegundos}s (mínimo ${motivo.minimoEsperadoSegundos}s)`;
    case "padrao_identico_historico_recente":
      return "Padrão de respostas idêntico a um preenchimento anterior";
    default:
      return "Motivo não especificado";
  }
}

export function SuspicionReasonChips({ motivos }: { motivos: MotivoSuspeita[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {motivos.map((motivo, indice) => (
        <Badge
          key={indice}
          texto={rotular(motivo)}
          icone={<AlertTriangle size={11} aria-hidden />}
          classeCor="text-status-avariado bg-status-avariado-surface"
          tamanho="sm"
        />
      ))}
    </div>
  );
}
