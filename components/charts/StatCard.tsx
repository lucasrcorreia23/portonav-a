import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface StatCardProps {
  titulo: string;
  valor: string | number;
  icone: LucideIcon;
  href?: string;
  tom?: "neutro" | "avariado" | "apontamento" | "disponivel";
}

const CLASSES_TOM: Record<NonNullable<StatCardProps["tom"]>, string> = {
  neutro: "bg-surface-3 text-foreground-muted",
  avariado: "bg-status-avariado-surface text-status-avariado",
  apontamento: "bg-status-apontamento-surface text-status-apontamento",
  disponivel: "bg-status-disponivel-surface text-status-disponivel",
};

export function StatCard({ titulo, valor, icone: Icone, href, tom = "neutro" }: StatCardProps) {
  const conteudo = (
    <Card densidade="densa" className="flex h-full flex-col gap-3 transition-shadow hover:shadow-elevated">
      <div className={`inline-flex h-9 w-9 items-center justify-center rounded-control ${CLASSES_TOM[tom]}`}>
        <Icone size={18} aria-hidden />
      </div>
      <div>
        <p className="text-2xl font-medium text-foreground">{valor}</p>
        <p className="text-sm text-foreground-muted">{titulo}</p>
      </div>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {conteudo}
      </Link>
    );
  }
  return conteudo;
}
