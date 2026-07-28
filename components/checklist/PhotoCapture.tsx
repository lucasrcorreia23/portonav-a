"use client";

import { useRef, useState } from "react";
import { Camera, ImageDown, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { FotoEvidencia } from "@/lib/types";

const EXEMPLOS_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect width="320" height="240" fill="%23dd1337"/><text x="160" y="128" font-size="20" fill="white" text-anchor="middle" font-family="sans-serif">Farol quebrado (exemplo)</text></svg>',
  '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect width="320" height="240" fill="%236d28d9"/><text x="160" y="128" font-size="20" fill="white" text-anchor="middle" font-family="sans-serif">Vazamento visível (exemplo)</text></svg>',
  '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect width="320" height="240" fill="%2392400e"/><text x="160" y="128" font-size="20" fill="white" text-anchor="middle" font-family="sans-serif">Desgaste visível (exemplo)</text></svg>',
];

function fotoDeExemplo(): FotoEvidencia {
  const svg = EXEMPLOS_SVG[Math.floor(Math.random() * EXEMPLOS_SVG.length)];
  return {
    dataUrl: `data:image/svg+xml,${svg}`,
    timestamp: new Date().toISOString(),
    origemSimulada: true,
  };
}

export function PhotoCapture({
  valor,
  onCapturar,
  onRemover,
}: {
  valor?: FotoEvidencia;
  onCapturar: (foto: FotoEvidencia) => void;
  onRemover: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [carregando, setCarregando] = useState(false);

  function aoSelecionarArquivo(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;
    setCarregando(true);
    const leitor = new FileReader();
    leitor.onload = () => {
      onCapturar({
        dataUrl: String(leitor.result),
        timestamp: new Date().toISOString(),
        origemSimulada: false,
      });
      setCarregando(false);
    };
    leitor.readAsDataURL(arquivo);
  }

  if (valor) {
    return (
      <div className="relative w-fit">
        {/* eslint-disable-next-line @next/next/no-img-element -- data URL local, sem otimização de imagem remota aplicável */}
        <img src={valor.dataUrl} alt="Evidência fotográfica anexada" className="h-32 w-44 rounded-control object-cover" />
        <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[11px] text-white">
          {new Date(valor.timestamp).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
        </span>
        <button
          type="button"
          onClick={onRemover}
          aria-label="Remover foto"
          className="absolute -right-2 -top-2 rounded-pill bg-neutral-900 p-1 text-white"
        >
          <X size={12} aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={aoSelecionarArquivo}
        className="sr-only"
        id="photo-capture-input"
      />
      <Button
        variante="secondary"
        tamanho="sm"
        iconeEsquerda={<Camera size={14} aria-hidden />}
        onClick={() => inputRef.current?.click()}
        disabled={carregando}
      >
        {carregando ? "Carregando…" : "Tirar foto"}
      </Button>
      <Button
        variante="ghost"
        tamanho="sm"
        iconeEsquerda={<ImageDown size={14} aria-hidden />}
        onClick={() => onCapturar(fotoDeExemplo())}
      >
        Usar foto de exemplo
      </Button>
    </div>
  );
}
