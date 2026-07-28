import Link from "next/link";
import { ClipboardCheck, HardHat, ShieldCheck, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";

const JORNADAS: { href: string; titulo: string; descricao: string; icone: LucideIcon }[] = [
  {
    href: "/entrada",
    titulo: "Operador",
    descricao: "Ler o QR do equipamento, preencher o checklist de pré-operação e iniciar a operação.",
    icone: HardHat,
  },
  {
    href: "/supervisor",
    titulo: "Supervisor",
    descricao: "Painel da frota: bloqueios, apontamentos abertos e checklists em revisão.",
    icone: ShieldCheck,
  },
  {
    href: "/manutencao",
    titulo: "Manutenção",
    descricao: "Quadro de chamados, registro de reparo e liberação de equipamentos.",
    icone: Wrench,
  },
  {
    href: "/admin",
    titulo: "Admin",
    descricao: "Cadastro de equipamentos, modelos de checklist e operadores.",
    icone: ClipboardCheck,
  },
];

export default function Home() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-16">
      <div className="flex flex-col gap-3 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-brand-600">Portonave</p>
        <h1 className="text-display-lg text-neutral-900">Checklist de pré-operação de equipamentos</h1>
        <p className="mx-auto max-w-xl text-neutral-600">
          Protótipo de demonstração. Escolha uma jornada abaixo — use o painel &ldquo;Modo demonstração&rdquo; no
          canto da tela para trocar de perfil, simular modo offline ou avançar o tempo.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {JORNADAS.map((jornada) => {
          const Icone = jornada.icone;
          return (
            <Link key={jornada.href} href={jornada.href} className="group">
              <Card className="h-full transition-shadow group-hover:shadow-elevated">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-control bg-brand-50 text-brand-600">
                  <Icone size={20} aria-hidden />
                </div>
                <h2 className="mb-1 text-lg font-medium text-neutral-900">{jornada.titulo}</h2>
                <p className="text-sm text-neutral-600">{jornada.descricao}</p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
