"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface QRDisplayProps {
  tag: string;
  tamanho?: number;
}

/** QR real e vetorial (SVG) — codifica a URL absoluta da ficha, imprimível na hora. */
export function QRDisplay({ tag, tamanho = 220 }: QRDisplayProps) {
  // window.location só existe no cliente — lido uma única vez via inicializador preguiçoso,
  // nunca direto no corpo do componente (Date.now()-like: seria impuro durante o render).
  const [origem] = useState(() => (typeof window !== "undefined" ? window.location.origin : ""));
  const destino = `${origem}/equipamento/${encodeURIComponent(tag)}`;
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    QRCode.toString(destino, { type: "svg", margin: 1, width: tamanho }).then((resultado) => {
      if (!cancelado) setSvg(resultado);
    });
    return () => {
      cancelado = true;
    };
  }, [destino, tamanho]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="flex items-center justify-center rounded-card border border-neutral-100 bg-white p-4"
        style={{ width: tamanho + 32, height: tamanho + 32 }}
        dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
      >
        {!svg && <span className="text-sm text-neutral-400">Gerando QR…</span>}
      </div>
      <p className="max-w-[240px] break-all text-center text-xs text-neutral-500">{destino}</p>
      <Button variante="secondary" tamanho="sm" iconeEsquerda={<Printer size={14} aria-hidden />} onClick={() => window.print()}>
        Baixar / imprimir ficha
      </Button>
    </div>
  );
}
