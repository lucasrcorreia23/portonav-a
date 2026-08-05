"use client";

import { useState } from "react";
import type { ReactNode } from "react";

interface AvatarProps {
  nome: string;
  tamanho?: "sm" | "md" | "lg" | "xl" | "2xl";
  /** Quando informado, renderiza o ícone no lugar das iniciais (fundo claro + ícone forte). */
  icone?: ReactNode;
  /** Sobrescreve a cor auto-gerada. */
  cor?: string;
  /** URL de imagem — quando informada, renderiza a foto no lugar de iniciais/ícone. */
  src?: string | null;
  className?: string;
}

const CLASSES_TAMANHO: Record<NonNullable<AvatarProps["tamanho"]>, string> = {
  sm: "h-7 w-7",
  md: "h-9 w-9",
  lg: "h-12 w-12",
  xl: "h-14 w-14",
  "2xl": "h-18 w-18",
};

const CLASSES_TEXTO: Record<NonNullable<AvatarProps["tamanho"]>, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-xl",
  "2xl": "text-2xl",
};

// Paleta sólida — a cor é escolhida de forma determinística pelo nome (mesmo
// nome → mesma cor), então parece "aleatória" mas é estável entre renders.
const CORES_AVATAR = [
  "#0a8ad6",
  "#2846f6",
  "#8536ac",
  "#b92a90",
  "#e85d2f",
  "#16a34a",
  "#0891b2",
  "#d98a00",
  "#dc2626",
  "#7c3aed",
  "#0ea5e9",
  "#db2777",
  "#ca8a04",
  "#059669",
  "#475569",
];

function iniciaisDe(nome: string): string {
  return nome
    .split(" ")
    .slice(0, 2)
    .map((palavra) => palavra[0])
    .join("")
    .toUpperCase();
}

export function corParaNome(nome: string): string {
  let hash = 0;
  for (let i = 0; i < nome.length; i++) hash = (hash << 5) - hash + nome.charCodeAt(i);
  return CORES_AVATAR[Math.abs(hash) % CORES_AVATAR.length];
}

/** Gera versão clara de uma cor hex (mix com branco) — fundo claro + texto na cor forte. */
function clarear(hex: string, pct: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * (1 - pct / 100));
  return `#${[mix(r), mix(g), mix(b)].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

/** Iniciais com fundo claro + texto cor forte (nunca fundo sólido escuro + texto branco). */
export function Avatar({ nome, tamanho = "md", icone, cor, src, className = "" }: AvatarProps) {
  const [erroImagem, setErroImagem] = useState(false);
  const base = cor || corParaNome(nome);
  const fundo = clarear(base, 15);

  if (src && !erroImagem) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        title={nome}
        className={`aspect-square shrink-0 rounded-full object-cover ${CLASSES_TAMANHO[tamanho]} ${className}`}
        onError={() => setErroImagem(true)}
      />
    );
  }

  return (
    <div
      className={`inline-flex aspect-square shrink-0 items-center justify-center rounded-full font-semibold ${CLASSES_TAMANHO[tamanho]} ${icone ? "" : CLASSES_TEXTO[tamanho]} ${className}`}
      style={{ backgroundColor: fundo, color: base }}
      aria-label={nome}
      title={nome}
    >
      {icone ?? iniciaisDe(nome)}
    </div>
  );
}
