"use client";

import { AlertTriangle, BarChart3, LayoutDashboard } from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";

const ITENS_NAV = [
  { href: "/supervisor", label: "Painel", icone: LayoutDashboard },
  { href: "/supervisor/checklists-suspeitos", label: "Checklists em revisão", icone: AlertTriangle },
  { href: "/supervisor/relatorios", label: "Relatórios", icone: BarChart3 },
];

export default function SupervisorLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell titulo="Supervisor" itensNav={ITENS_NAV}>
      {children}
    </AdminShell>
  );
}
