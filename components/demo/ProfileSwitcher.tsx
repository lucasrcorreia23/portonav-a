"use client";

import { useRouter } from "next/navigation";
import { ClipboardCheck, HardHat, ShieldCheck, Wrench } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { OpcaoSegmento } from "@/components/ui/SegmentedControl";
import type { Perfil } from "@/lib/types";
import { alternarPerfil, useEstadoDemo, useRepositorio } from "@/lib/data/context";

const PERFIS: (OpcaoSegmento<Perfil> & { rota: string })[] = [
  { valor: "operador", rotulo: "Operador", icone: HardHat, rota: "/operador" },
  { valor: "supervisor", rotulo: "Supervisor", icone: ShieldCheck, rota: "/supervisor" },
  { valor: "manutencao", rotulo: "Manutenção", icone: Wrench, rota: "/manutencao" },
  { valor: "admin", rotulo: "Admin", icone: ClipboardCheck, rota: "/admin" },
];

export function ProfileSwitcher() {
  const demo = useEstadoDemo();
  const repositorio = useRepositorio();
  const router = useRouter();
  const operadores = repositorio.operadores.listar();

  function aoEscolherPerfil(perfil: Perfil) {
    const rota = PERFIS.find((p) => p.valor === perfil)?.rota ?? "/";
    alternarPerfil(perfil, perfil === "operador" ? (demo.operadorAtivoId ?? operadores[0]?.id ?? null) : null);
    router.push(rota);
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-foreground-subtle">Perfil ativo</span>
      <SegmentedControl
        opcoes={PERFIS}
        valor={demo.perfilAtivo}
        aoAlterar={aoEscolherPerfil}
        tamanho="sm"
        aria-label="Trocar perfil"
      />
      {demo.perfilAtivo === "operador" && (
        <Select
          rotulo="Simulando como"
          valor={demo.operadorAtivoId ?? undefined}
          aoAlterar={(valor) => alternarPerfil("operador", valor || null)}
          opcoes={operadores.map((operador) => ({ valor: operador.id, rotulo: operador.nome }))}
        />
      )}
    </div>
  );
}
