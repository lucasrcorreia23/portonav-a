"use client";

import { useEffect } from "react";
import { ClipboardList, Truck, Users } from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";
import { alternarPerfil, useEstadoDemo } from "@/lib/data/context";

const ITENS_NAV = [
  { href: "/admin", label: "Visão geral", icone: ClipboardList },
  { href: "/admin/equipamentos", label: "Equipamentos", icone: Truck },
  { href: "/admin/checklists", label: "Modelos de checklist", icone: ClipboardList },
  { href: "/admin/operadores", label: "Operadores", icone: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const demo = useEstadoDemo();

  // Garante que o perfil ativo acompanhe a seção visitada — importante porque
  // /equipamento/[tag] (a "porta única") ramifica seu conteúdo pelo perfil ativo,
  // não pela URL atual. Sem isso, chegar aqui por URL direta ou refresh poderia
  // deixar o perfil dessincronizado da seção sendo navegada.
  useEffect(() => {
    if (demo.perfilAtivo !== "admin") {
      alternarPerfil("admin");
    }
  }, [demo.perfilAtivo]);

  return (
    <AdminShell titulo="Admin" itensNav={ITENS_NAV}>
      {children}
    </AdminShell>
  );
}
