import Link from "next/link";
import { ClipboardList, Truck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";

const CARDS: { href: string; titulo: string; descricao: string; icone: LucideIcon }[] = [
  {
    href: "/admin/equipamentos",
    titulo: "Equipamentos",
    descricao: "Lista, ficha individual, QR e histórico de cada equipamento.",
    icone: Truck,
  },
  {
    href: "/admin/checklists",
    titulo: "Modelos de checklist",
    descricao: "Construtor de seções e itens por tipo de operação.",
    icone: ClipboardList,
  },
  {
    href: "/admin/operadores",
    titulo: "Operadores",
    descricao: "Sincronizados do portal corporativo — habilitações e score.",
    icone: Users,
  },
];

export default function AdminHomePage() {
  return (
    <div>
      <PageHeader titulo="Cadastros e regras" subtitulo="Administração do sistema de checklist de pré-operação." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((card) => {
          const Icone = card.icone;
          return (
            <Link key={card.href} href={card.href} className="group">
              <Card densidade="densa" className="flex h-full items-start gap-4 transition-shadow group-hover:shadow-elevated">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-brand-50 text-brand-600">
                  <Icone size={20} aria-hidden />
                </div>
                <div>
                  <h2 className="mb-1 font-medium text-neutral-900">{card.titulo}</h2>
                  <p className="text-sm text-neutral-600">{card.descricao}</p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
