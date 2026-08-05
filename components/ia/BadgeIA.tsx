import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Tooltip } from "@/components/ui/Tooltip";

/** Marcador visual compartilhado para conteúdo gerado pelo simulador de IA deste
 * protótipo (nenhuma chamada real a modelo de linguagem — ver lib/data/ia-simulada.ts). */
export function BadgeIA() {
  return (
    <Tooltip rotulo="Texto gerado por um simulador de IA deste protótipo — não é uma chamada real a um modelo de linguagem.">
      <Badge texto="Gerado por IA" icone={<Sparkles size={12} aria-hidden />} classeCor="text-aqua-ink bg-aqua" tamanho="sm" />
    </Tooltip>
  );
}
