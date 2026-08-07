// lg = 40px, a altura da marca no frame de boas-vindas (Figma "Whitelabel").
const CLASSES_TAMANHO = {
  sm: "h-5",
  md: "h-7",
  lg: "h-10",
} as const;

/**
 * Wordmark TiL — puramente geométrico (retângulos + o ponto do "i"), redesenhado
 * em SVG a partir da prancha `Operador Flow.pdf`. Herda a cor do texto ao redor.
 */
export function LogoTil({
  tamanho = "md",
  className = "",
}: {
  tamanho?: keyof typeof CLASSES_TAMANHO;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 856 669"
      role="img"
      aria-label="TiL"
      fill="currentColor"
      className={`w-auto ${CLASSES_TAMANHO[tamanho]} ${className}`}
    >
      {/* T — barra e haste */}
      <rect x="0" y="0" width="656" height="128" />
      <rect x="152" y="128" width="128" height="541" />
      {/* i — ponto e haste */}
      <circle cx="403" cy="244" r="64" />
      <rect x="339" y="356" width="128" height="313" />
      {/* L — haste e pé */}
      <rect x="528" y="184" width="128" height="485" />
      <rect x="656" y="541" width="200" height="128" />
    </svg>
  );
}
