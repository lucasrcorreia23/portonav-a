"use client";

import { Wrench } from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";

const ITENS_NAV = [{ href: "/manutencao", label: "Chamados", icone: Wrench }];

export default function ManutencaoLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell titulo="Manutenção" itensNav={ITENS_NAV}>
      {children}
    </AdminShell>
  );
}
