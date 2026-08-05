interface ProgressBarProps {
  valorAtual: number;
  valorMaximo: number;
  rotulo?: string;
  /** Nome acessível para quando o texto do progresso já vive em outro lugar da tela
   * e repetir um rótulo visível aqui só somaria ruído. Ignorado se `rotulo` for passado. */
  rotuloAcessivel?: string;
}

export function ProgressBar({ valorAtual, valorMaximo, rotulo, rotuloAcessivel }: ProgressBarProps) {
  const percentual = valorMaximo > 0 ? Math.min(100, Math.max(0, (valorAtual / valorMaximo) * 100)) : 0;
  return (
    <div className="w-full">
      {/* aria-hidden: o mesmo texto vira o nome acessível da barra logo abaixo — sem isso
          o leitor de tela anunciaria o rótulo duas vezes. */}
      {rotulo && (
        <p aria-hidden className="mb-1.5 text-sm font-semibold text-foreground-muted">
          {rotulo}
        </p>
      )}
      <div
        role="progressbar"
        aria-valuenow={valorAtual}
        aria-valuemin={0}
        aria-valuemax={valorMaximo}
        aria-label={rotulo ?? rotuloAcessivel}
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
