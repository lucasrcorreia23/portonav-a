"use client";

import { useEffect } from "react";
import { Wrench } from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";
import { alternarPerfil, useEstadoDemo } from "@/lib/data/context";

const ITENS_NAV = [{ href: "/manutencao", label: "Chamados", icone: Wrench }];

export default function ManutencaoLayout({ children }: { children: React.ReactNode }) {
  const demo = useEstadoDemo();

  useEffect(() => {
    if (demo.perfilAtivo !== "manutencao") {
      alternarPerfil("manutencao");
    }
  }, [demo.perfilAtivo]);

  return (
    <AdminShell titulo="Manutenção" itensNav={ITENS_NAV}>
      {children}
    </AdminShell>
  );
}
