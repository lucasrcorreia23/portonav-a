import Link from "next/link";
import { Activity, BarChart3, ClipboardList, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";

const RELATORIOS: { href: string; titulo: string; descricao: string; icone: LucideIcon }[] = [
  {
    href: "/supervisor/relatorios/falhas-recorrentes",
    titulo: "Falhas mais recorrentes",
    descricao: "Itens de checklist reprovados com mais frequência, por tipo de equipamento.",
    icone: BarChart3,
  },
  {
    href: "/supervisor/relatorios/disponibilidade",
    titulo: "Disponibilidade da frota",
    descricao: "Percentual de equipamentos disponíveis ao longo dos últimos 45 dias.",
    icone: Activity,
  },
  {
    href: "/supervisor/relatorios/aderencia-checklist",
    titulo: "Aderência ao checklist por turno",
    descricao: "Proporção de preenchimentos não suspeitos em cada turno.",
    icone: ClipboardList,
  },
  {
    href: "/supervisor/relatorios/confiabilidade-operadores",
    titulo: "Ranking de confiabilidade",
    descricao: "Operadores ordenados pelo score de confiabilidade de preenchimento.",
    icone: Users,
  },
];

export default function RelatoriosHubPage() {
  return (
    <div>
      <PageHeader titulo="Relatórios" subtitulo="Indicadores calculados a partir do histórico sintético de 45 dias." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {RELATORIOS.map((r) => {
          const Icone = r.icone;
          return (
            <Link key={r.href} href={r.href} className="group">
              <Card densidade="densa" className="h-full transition-shadow group-hover:shadow-elevated">
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-control bg-brand-50 text-brand-600">
                  <Icone size={18} aria-hidden />
                </div>
                <h2 className="mb-1 font-medium text-neutral-900">{r.titulo}</h2>
                <p className="text-sm text-neutral-600">{r.descricao}</p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
