"use client";

import { useEffect, useState } from "react";
import { ScanLine } from "lucide-react";

/** Simulação de câmera: viewfinder escuro com linha de escaneamento animada. */
export function ScanFakeCamera({ tagAlvo, onDetectado }: { tagAlvo: string; onDetectado: () => void }) {
  const [detectado, setDetectado] = useState(false);

  useEffect(() => {
    const tempo = setTimeout(() => setDetectado(true), 1600);
    return () => clearTimeout(tempo);
  }, []);

  useEffect(() => {
    if (!detectado) return;
    const tempo = setTimeout(onDetectado, 500);
    return () => clearTimeout(tempo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detectado]);

  return (
    <div className="relative flex aspect-[3/4] w-full flex-col items-center justify-center overflow-hidden rounded-card bg-neutral-900 text-white">
      <div className="absolute inset-8 rounded-control border-2 border-white/30">
        <div className="absolute left-0 top-0 h-6 w-6 border-l-4 border-t-4 border-white" />
        <div className="absolute right-0 top-0 h-6 w-6 border-r-4 border-t-4 border-white" />
        <div className="absolute bottom-0 left-0 h-6 w-6 border-b-4 border-l-4 border-white" />
        <div className="absolute bottom-0 right-0 h-6 w-6 border-b-4 border-r-4 border-white" />
        {!detectado && (
          <div className="absolute left-0 right-0 h-0.5 animate-[scan_1.6s_ease-in-out_infinite] bg-status-disponivel" />
        )}
      </div>
      <style>{`
        @keyframes scan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
      `}</style>
      <div className="absolute bottom-6 flex flex-col items-center gap-2 text-center">
        <ScanLine size={20} aria-hidden />
        <p className="text-sm">{detectado ? `QR de ${tagAlvo} reconhecido` : "Aponte a câmera para o QR do equipamento"}</p>
      </div>
    </div>
  );
}
