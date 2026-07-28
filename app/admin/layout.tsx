"use client";

import { ClipboardList, Truck, Users } from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";

const ITENS_NAV = [
  { href: "/admin", label: "Visão geral", icone: ClipboardList },
  { href: "/admin/equipamentos", label: "Equipamentos", icone: Truck },
  { href: "/admin/checklists", label: "Modelos de checklist", icone: ClipboardList },
  { href: "/admin/operadores", label: "Operadores", icone: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell titulo="Admin" itensNav={ITENS_NAV}>
      {children}
    </AdminShell>
  );
}
