interface LineChartProps {
  pontos: { rotulo: string; valor: number }[];
  sufixo?: string;
  altura?: number;
}

/** Série temporal única, hue único, com marcador de "hoje" no último ponto. */
export function LineChart({ pontos, sufixo = "", altura = 160 }: LineChartProps) {
  if (pontos.length === 0) return null;
  const largura = 600;
  const margem = 24;
  const maximo = Math.max(...pontos.map((p) => p.valor), 1);
  const minimo = Math.min(...pontos.map((p) => p.valor), 0);
  const faixa = maximo - minimo || 1;

  const coordenadas = pontos.map((p, i) => {
    const x = margem + (i / Math.max(1, pontos.length - 1)) * (largura - margem * 2);
    const y = altura - margem - ((p.valor - minimo) / faixa) * (altura - margem * 2);
    return { ...p, x, y };
  });

  const caminho = coordenadas.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const ultimo = coordenadas[coordenadas.length - 1];

  return (
    <svg viewBox={`0 0 ${largura} ${altura}`} className="w-full" role="img" aria-label="Gráfico de linha temporal">
      <line x1={margem} y1={altura - margem} x2={largura - margem} y2={altura - margem} stroke="var(--color-neutral-200)" strokeWidth={1} />
      <path d={caminho} fill="none" stroke="var(--color-status-em-uso)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {coordenadas.map((c) => (
        <circle key={c.rotulo} cx={c.x} cy={c.y} r={2.5} fill="var(--color-status-em-uso)">
          <title>
            {c.rotulo}: {c.valor}
            {sufixo}
          </title>
        </circle>
      ))}
      <circle cx={ultimo.x} cy={ultimo.y} r={5} fill="var(--color-status-em-uso)" stroke="white" strokeWidth={2} />
      <text x={ultimo.x} y={margem - 8} textAnchor="end" className="fill-neutral-500 text-[10px]">
        hoje
      </text>
    </svg>
  );
}
