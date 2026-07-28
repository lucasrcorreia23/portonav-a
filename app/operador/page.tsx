"use client";

import Link from "next/link";
import { QrCode } from "lucide-react";
import { OperatorShell } from "@/components/layout/OperatorShell";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TAXONOMIA_RESULTADO_CHECKLIST } from "@/components/status/statusTaxonomy";
import { useChecklistsPreenchidos, useEquipamentos, useEstadoDemo } from "@/lib/data/context";

export default function OperadorHomePage() {
  const demo = useEstadoDemo();
  const checklists = useChecklistsPreenchidos();
  const equipamentos = useEquipamentos();

  const recentes = checklists
    .filter((c) => c.operadorId === demo.operadorAtivoId)
    .sort((a, b) => b.concluidoEm.localeCompare(a.concluidoEm))
    .slice(0, 5);

  return (
    <OperatorShell>
      <div>
        <h1 className="text-display-sm text-neutral-900">Olá!</h1>
        <p className="mt-1 text-sm text-neutral-600">Escaneie o QR do equipamento para iniciar a verificação de pré-operação.</p>
      </div>

      <Link
        href="/entrada"
        className="flex items-center justify-center gap-2 rounded-card-hero bg-brand-500 px-6 py-8 text-lg font-medium text-white shadow-elevated hover:bg-brand-600"
      >
        <QrCode size={24} aria-hidden />
        Ler QR do equipamento
      </Link>

      {recentes.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-medium text-neutral-700">Suas últimas verificações</h2>
          <ul className="flex flex-col gap-2">
            {recentes.map((c) => {
              const eq = equipamentos.find((e) => e.id === c.equipamentoId);
              return (
                <li key={c.id} className="flex items-center justify-between rounded-card border border-neutral-100 bg-white p-3 text-sm shadow-card">
                  <div>
                    <p className="font-medium text-neutral-800">{eq?.tag ?? "—"}</p>
                    <p className="text-xs text-neutral-500">
                      {new Date(c.concluidoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                    </p>
                  </div>
                  <StatusBadge entrada={TAXONOMIA_RESULTADO_CHECKLIST[c.resultado]} tamanho="sm" />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </OperatorShell>
  );
}
