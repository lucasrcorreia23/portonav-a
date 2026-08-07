"use client";

import { useEffect, useState } from "react";
import { ScanLine } from "lucide-react";

/**
 * Simulação de câmera: viewfinder com a etiqueta QR real e linha de escaneamento animada.
 *
 * O visor é só a moldura de cantos — sem retângulo contínuo em volta, conforme a prancha.
 * As marcas finas que cercam o QR quando ele é reconhecido já vêm queimadas na foto
 * (é a mira do leitor no próprio asset), por isso não são desenhadas aqui.
 */
export function ScanFakeCamera({
  tagAlvo,
  onDetectado,
  preencherAltura = false,
}: {
  tagAlvo: string;
  onDetectado: () => void;
  /**
   * Estica o visor até o fim da área visível, em vez da proporção 3/4. Use quando a
   * leitura é a tela inteira (devolução); mantenha desligado quando o visor divide
   * espaço com outros blocos (/entrada, onde ele é uma aba entre outras).
   */
  preencherAltura?: boolean;
}) {
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
    <div
      className={`relative w-full overflow-hidden rounded-card bg-neutral-900 text-white ${
        preencherAltura ? "min-h-0 flex-1" : "aspect-[3/4]"
      }`}
    >
      {/* Foto de um QR fixado em equipamento — a leitura é encenada, não há câmera real. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- asset local estático, sem otimização remota aplicável */}
      <img
        src="/demo/qr-empilhadeira.jpg"
        alt="Visor da câmera apontado para a etiqueta QR fixada no equipamento"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-8">
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
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[scan_1\\.6s_ease-in-out_infinite\\] { animation: none; top: 50%; }
        }
      `}</style>

      {/* Sem pílula: o texto assenta direto sobre a foto, com o ícone acima. */}
      <div
        role="status"
        aria-live="polite"
        className="absolute inset-x-8 bottom-8 flex flex-col items-center gap-2 text-center"
      >
        <ScanLine size={20} aria-hidden />
        <p className="text-sm">
          {detectado ? `QR-Code de ${tagAlvo} reconhecido` : "Aponte a câmera para o QR do equipamento"}
        </p>
      </div>
    </div>
  );
}
