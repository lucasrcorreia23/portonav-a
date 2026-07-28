"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Keyboard, MapPin } from "lucide-react";
import { OperatorShell } from "@/components/layout/OperatorShell";
import { ScanFakeCamera } from "@/components/qr-entry/ScanFakeCamera";
import { NearbyEquipmentList } from "@/components/qr-entry/NearbyEquipmentList";
import { ManualTagEntry } from "@/components/qr-entry/ManualTagEntry";
import { useEquipamentos, useRepositorio } from "@/lib/data/context";

type Aba = "camera" | "proximos" | "digitar";

const ABAS: { valor: Aba; label: string; icone: typeof Camera }[] = [
  { valor: "camera", label: "Câmera", icone: Camera },
  { valor: "proximos", label: "Próximos", icone: MapPin },
  { valor: "digitar", label: "Digitar tag", icone: Keyboard },
];

export default function EntradaPage() {
  const [aba, setAba] = useState<Aba>("camera");
  const [erro, setErro] = useState<string | null>(null);
  const equipamentos = useEquipamentos();
  const repo = useRepositorio();
  const router = useRouter();

  const equipamentoAlvoCamera = equipamentos.find((eq) => eq.status === "disponivel") ?? equipamentos[0];

  function irParaTag(tag: string) {
    const equipamento = repo.equipamentos.buscarPorTag(tag);
    if (!equipamento) {
      setErro(`Nenhum equipamento encontrado com a tag "${tag}".`);
      return;
    }
    setErro(null);
    router.push(`/equipamento/${equipamento.tag}`);
  }

  return (
    <OperatorShell>
      <div>
        <h1 className="text-display-sm text-neutral-900">Entrada por QR</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Simule a leitura do QR fixado no equipamento — na operação real, basta escanear.
        </p>
      </div>

      <div className="flex rounded-control border border-neutral-200 p-1" role="tablist">
        {ABAS.map((item) => {
          const Icone = item.icone;
          const ativo = aba === item.valor;
          return (
            <button
              key={item.valor}
              type="button"
              role="tab"
              aria-selected={ativo}
              onClick={() => setAba(item.valor)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-control py-2.5 text-sm font-medium transition-colors ${
                ativo ? "bg-brand-500 text-white" : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              <Icone size={15} aria-hidden />
              {item.label}
            </button>
          );
        })}
      </div>

      {aba === "camera" && equipamentoAlvoCamera && (
        <ScanFakeCamera
          key={equipamentoAlvoCamera.id}
          tagAlvo={equipamentoAlvoCamera.tag}
          onDetectado={() => router.push(`/equipamento/${equipamentoAlvoCamera.tag}`)}
        />
      )}

      {aba === "proximos" && (
        <NearbyEquipmentList
          equipamentos={equipamentos}
          onEscolher={(equipamento) => router.push(`/equipamento/${equipamento.tag}`)}
        />
      )}

      {aba === "digitar" && (
        <div className="flex flex-col gap-2">
          <ManualTagEntry onConfirmar={irParaTag} />
          {erro && <p className="text-sm text-status-avariado">{erro}</p>}
        </div>
      )}
    </OperatorShell>
  );
}
