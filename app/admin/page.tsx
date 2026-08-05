import Link from "next/link";
import { ClipboardList, ShieldCheck, Truck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";

const CARDS: { href: string; titulo: string; descricao: string; icone: LucideIcon }[] = [
  {
    href: "/admin/equipamentos",
    titulo: "Equipamentos",
    descricao: "Cadastro com tag e QR, lista, ficha individual e histórico de cada equipamento.",
    icone: Truck,
  },
  {
    href: "/admin/checklists",
    titulo: "Modelos de checklist",
    descricao: "Construtor de seções e itens por tipo de equipamento e tipo de operação.",
    icone: ClipboardList,
  },
  {
    href: "/admin/operadores",
    titulo: "Operadores",
    descricao: "Sincronizados do portal corporativo via SSO/API — habilitações (somente leitura) e score.",
    icone: Users,
  },
  {
    href: "/admin/regras",
    titulo: "Regras",
    descricao: "Modos de tratamento de checklist e quem pode liberar um equipamento após reparo.",
    icone: ShieldCheck,
  },
];

export default function AdminHomePage() {
  return (
    <div>
      <PageHeader titulo="Portal Portonav" subtitulo="Cadastros e regras do checklist de pré-operação." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((card) => {
          const Icone = card.icone;
          return (
            <Link key={card.href} href={card.href} className="group">
              <Card densidade="densa" className="flex h-full items-start gap-4 transition-shadow group-hover:shadow-elevated">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-card bg-surface-3 text-foreground-muted">
                  <Icone size={20} aria-hidden />
                </div>
                <div>
                  <h2 className="mb-1 font-semibold text-foreground">{card.titulo}</h2>
                  <p className="text-sm text-foreground-muted">{card.descricao}</p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
