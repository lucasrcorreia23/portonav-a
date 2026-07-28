import { Badge } from "@/components/ui/Badge";

function faixa(score: number): { label: string; classeCor: string } {
  if (score >= 80) return { label: `${score} · Alto`, classeCor: "text-status-disponivel bg-status-disponivel-surface" };
  if (score >= 60) return { label: `${score} · Médio`, classeCor: "text-status-apontamento bg-status-apontamento-surface" };
  return { label: `${score} · Baixo`, classeCor: "text-status-avariado bg-status-avariado-surface" };
}

export function ReliabilityScoreBadge({ score }: { score: number }) {
  const { label, classeCor } = faixa(score);
  return <Badge texto={label} classeCor={classeCor} tamanho="sm" />;
}
