interface ProgressBarProps {
  valorAtual: number;
  valorMaximo: number;
  rotulo?: string;
}

export function ProgressBar({ valorAtual, valorMaximo, rotulo }: ProgressBarProps) {
  const percentual = valorMaximo > 0 ? Math.min(100, Math.max(0, (valorAtual / valorMaximo) * 100)) : 0;
  return (
    <div className="w-full">
      {rotulo && (
        <p className="mb-1.5 text-sm font-semibold text-foreground-muted" id="progress-label">
          {rotulo}
        </p>
      )}
      <div
        role="progressbar"
        aria-valuenow={valorAtual}
        aria-valuemin={0}
        aria-valuemax={valorMaximo}
        aria-labelledby={rotulo ? "progress-label" : undefined}
        className="h-2 w-full overflow-hidden rounded-pill bg-surface-3"
      >
        <div
          className="h-full rounded-pill bg-primary transition-[width] duration-300"
          style={{ width: `${percentual}%` }}
        />
      </div>
    </div>
  );
}
