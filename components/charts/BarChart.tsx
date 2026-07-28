interface BarChartProps {
  dados: { rotulo: string; valor: number }[];
  formatarValor?: (valor: number) => string;
}

/** Barras horizontais, hue único (magnitude, não identidade) — rótulo do eixo já nomeia a série. */
export function BarChart({ dados, formatarValor = (v) => String(v) }: BarChartProps) {
  const maximo = Math.max(1, ...dados.map((d) => d.valor));

  return (
    <div className="flex flex-col gap-3" role="img" aria-label="Gráfico de barras">
      {dados.map((item) => (
        <div key={item.rotulo} className="flex items-center gap-3">
          <span className="w-36 shrink-0 truncate text-sm text-neutral-700">{item.rotulo}</span>
          <div className="h-3 flex-1 overflow-hidden rounded-pill bg-neutral-100">
            <div
              className="h-full rounded-pill bg-status-em-uso"
              style={{ width: `${(item.valor / maximo) * 100}%` }}
            />
          </div>
          <span className="w-10 shrink-0 text-right text-sm font-medium text-neutral-800">{formatarValor(item.valor)}</span>
        </div>
      ))}
    </div>
  );
}
