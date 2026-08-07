"use client";

import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { agora } from "@/lib/data/context";
import type { FotoEvidencia } from "@/lib/types";

/** Miniatura com timestamp e remoção — usada acima do botão de IA no fluxo Não OK. */
export function PhotoThumbnail({
  valor,
  onRemover,
  sobreposicao,
  travada = false,
}: {
  valor: FotoEvidencia;
  onRemover: () => void;
  /** Camada sobre a foto — usada pelo loader de IA enquanto a descrição é gerada. */
  sobreposicao?: ReactNode;
  /** Esconde a remoção enquanto a foto está sendo analisada. */
  travada?: boolean;
}) {
  return (
    <div className="relative w-fit">
      {/* eslint-disable-next-line @next/next/no-img-element -- data URL local, sem otimização de imagem remota aplicável */}
      <img src={valor.dataUrl} alt="Evidência fotográfica anexada" className="h-32 w-44 rounded-card object-cover" />
      <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[11px] text-white">
        {new Date(valor.timestamp).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
      </span>
      {!travada && (
        <button
          type="button"
          onClick={onRemover}
          aria-label="Remover foto"
          className="absolute -right-2 -top-2 rounded-pill bg-neutral-900 p-1 text-white outline-none focus-visible:outline-none"
        >
          <X size={12} aria-hidden />
        </button>
      )}
      {sobreposicao}
    </div>
  );
}

/** Captura de evidência fotográfica via câmera/arquivo do dispositivo. */
export function PhotoCapture({
  onCapturar,
  desabilitado = false,
}: {
  onCapturar: (foto: FotoEvidencia) => void;
  desabilitado?: boolean;
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
        timestamp: agora().toISOString(),
        origemSimulada: false,
      });
      setCarregando(false);
    };
    leitor.readAsDataURL(arquivo);
    evento.target.value = "";
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={aoSelecionarArquivo}
        className="sr-only"
      />
      <Button
        variante="secondary"
        tamanho="md"
        larguraTotal
        iconeEsquerda={<Camera size={16} aria-hidden />}
        onClick={() => inputRef.current?.click()}
        carregando={carregando}
        disabled={desabilitado}
      >
        Tirar foto
      </Button>
    </div>
  );
}
