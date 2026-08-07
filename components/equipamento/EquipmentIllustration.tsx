import Image from "next/image";
import type { TipoEquipamento } from "@/lib/types";

/**
 * Altura comum a todas as ilustrações — render ou silhueta — pra manter o mesmo ritmo
 * no bloco. 152px é o tamanho natural do render da empilhadeira (149×152 no Figma),
 * então ele aparece sem reamostragem.
 */
const ALTURA = "h-38 w-auto";

/**
 * Renders reais por tipo de equipamento. Tipo sem arte cai na silhueta SVG abaixo;
 * pra adicionar um novo, basta soltar o PNG em `public/` e registrar aqui.
 */
const RENDERS: Partial<Record<TipoEquipamento, { src: string; largura: number; altura: number }>> = {
  empilhadeira: { src: "/empilhadeira.png", largura: 149, altura: 152 },
};

/**
 * Ilustração do equipamento, usada no card de identidade (confirmação e resultado).
 * Decorativa: a tag e o tipo já aparecem em texto ao lado dela.
 */
export function EquipmentIllustration({ tipo, className = "" }: { tipo: TipoEquipamento; className?: string }) {
  const render = RENDERS[tipo];

  if (render) {
    return (
      <Image
        src={render.src}
        width={render.largura}
        height={render.altura}
        alt=""
        aria-hidden
        priority
        className={`${ALTURA} object-contain ${className}`}
      />
    );
  }

  return (
    <svg viewBox="0 0 200 160" role="presentation" aria-hidden className={`${ALTURA} ${className}`}>
      <defs>
        <linearGradient id="ilus-corpo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-surface-2)" />
          <stop offset="100%" stopColor="var(--color-surface-3)" />
        </linearGradient>
      </defs>

      {/* Sombra de apoio — comum a todos os tipos. */}
      <ellipse cx="100" cy="146" rx="66" ry="7" fill="var(--color-surface-3)" opacity="0.7" />

      {DESENHOS[tipo]}
    </svg>
  );
}

const TRACO = {
  fill: "url(#ilus-corpo)",
  stroke: "var(--color-border)",
  strokeWidth: 2,
  strokeLinejoin: "round" as const,
};

const RODA = { fill: "var(--color-foreground-subtle)", opacity: 0.55 };

const DESENHOS: Record<TipoEquipamento, React.ReactNode> = {
  empilhadeira: (
    <>
      {/* Mastro e garfos */}
      <rect x="38" y="22" width="10" height="98" rx="2" {...TRACO} />
      <rect x="54" y="34" width="7" height="86" rx="2" {...TRACO} />
      <path d="M32 120h34v7H32z" {...TRACO} />
      <path d="M28 127h44v5H28z" {...TRACO} />
      {/* Corpo e cabine */}
      <path d="M76 74h62a8 8 0 0 1 8 8v40H76z" {...TRACO} />
      <path d="M84 30h56v44H84z" {...TRACO} />
      <path d="M90 20h44v10H90z" {...TRACO} />
      <circle cx="94" cy="132" r="14" {...RODA} />
      <circle cx="140" cy="132" r="11" {...RODA} />
    </>
  ),
  reach_stacker: (
    <>
      {/* Lança telescópica */}
      <path d="M46 96 148 30l12 18L58 114z" {...TRACO} />
      <path d="M148 30h26v20h-26z" {...TRACO} />
      {/* Chassi e cabine */}
      <path d="M30 96h124a10 10 0 0 1 10 10v22H30z" {...TRACO} />
      <path d="M36 62h34v34H36z" {...TRACO} />
      <circle cx="58" cy="136" r="16" {...RODA} />
      <circle cx="132" cy="136" r="16" {...RODA} />
    </>
  ),
  transpaleteira: (
    <>
      {/* Timão */}
      <path d="M148 34h9v70h-9z" {...TRACO} />
      <path d="M138 24h30v12h-30z" {...TRACO} />
      {/* Corpo e garfos */}
      <path d="M118 104h44a8 8 0 0 1 8 8v18h-52z" {...TRACO} />
      <path d="M34 116h84v8H34z" {...TRACO} />
      <path d="M34 124h84v6H34z" {...TRACO} />
      <circle cx="44" cy="134" r="8" {...RODA} />
      <circle cx="146" cy="136" r="12" {...RODA} />
    </>
  ),
};
