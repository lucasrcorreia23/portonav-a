"use client";

import { useEffect } from "react";
import { AlertTriangle, BarChart3, LayoutDashboard, ShieldCheck } from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";
import { alternarPerfil, useEstadoDemo } from "@/lib/data/context";

const ITENS_NAV = [
  { href: "/supervisor", label: "Painel", icone: LayoutDashboard },
  { href: "/supervisor/checklists-suspeitos", label: "Checklists em revisão", icone: AlertTriangle },
  { href: "/supervisor/liberacoes", label: "Liberações", icone: ShieldCheck },
  { href: "/supervisor/relatorios", label: "Relatórios", icone: BarChart3 },
];

export default function SupervisorLayout({ children }: { children: React.ReactNode }) {
  const demo = useEstadoDemo();

  useEffect(() => {
    if (demo.perfilAtivo !== "supervisor") {
      alternarPerfil("supervisor");
    }
  }, [demo.perfilAtivo]);

  return (
    <AdminShell titulo="Supervisor" itensNav={ITENS_NAV}>
      {children}
    </AdminShell>
  );
}
