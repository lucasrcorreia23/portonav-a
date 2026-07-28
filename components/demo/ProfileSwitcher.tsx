"use client";

import { useRouter } from "next/navigation";
import { ClipboardCheck, HardHat, ShieldCheck, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Perfil } from "@/lib/types";
import { alternarPerfil, useEstadoDemo, useRepositorio } from "@/lib/data/context";

const PERFIS: { valor: Perfil; label: string; icone: LucideIcon; rota: string }[] = [
  { valor: "operador", label: "Operador", icone: HardHat, rota: "/operador" },
  { valor: "supervisor", label: "Supervisor", icone: ShieldCheck, rota: "/supervisor" },
  { valor: "manutencao", label: "Manutenção", icone: Wrench, rota: "/manutencao" },
  { valor: "admin", label: "Admin", icone: ClipboardCheck, rota: "/admin" },
];

export function ProfileSwitcher() {
  const demo = useEstadoDemo();
  const repositorio = useRepositorio();
  const router = useRouter();
  const operadores = repositorio.operadores.listar();

  function aoEscolherPerfil(perfil: Perfil, rota: string) {
    alternarPerfil(perfil, perfil === "operador" ? (demo.operadorAtivoId ?? operadores[0]?.id ?? null) : null);
    router.push(rota);
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">Perfil ativo</span>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Trocar perfil">
        {PERFIS.map((perfil) => {
          const Icone = perfil.icone;
          const ativo = demo.perfilAtivo === perfil.valor;
          return (
            <button
              key={perfil.valor}
              type="button"
              onClick={() => aoEscolherPerfil(perfil.valor, perfil.rota)}
              aria-pressed={ativo}
              className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-sm font-medium transition-colors ${
                ativo ? "bg-brand-500 text-white" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              <Icone size={14} aria-hidden />
              {perfil.label}
            </button>
          );
        })}
      </div>
      {demo.perfilAtivo === "operador" && (
        <label className="flex flex-col gap-1 text-xs text-neutral-600">
          Simulando como
          <select
            value={demo.operadorAtivoId ?? ""}
            onChange={(evento) => alternarPerfil("operador", evento.target.value || null)}
            className="rounded-control border border-neutral-300 px-2 py-1.5 text-sm text-neutral-900"
          >
            {operadores.map((operador) => (
              <option key={operador.id} value={operador.id}>
                {operador.nome}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
