import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  rotulo?: string;
  erro?: string;
  dica?: string;
  iconeEsquerda?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { rotulo, erro, dica, iconeEsquerda, id, className = "", required, ...resto },
  ref,
) {
  const idGerado = useId();
  const inputId = id ?? idGerado;
  const dicaId = dica ? `${inputId}-dica` : undefined;
  const erroId = erro ? `${inputId}-erro` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {rotulo && (
        <label htmlFor={inputId} className="text-xs font-semibold text-foreground-muted">
          {rotulo} {required && <span aria-hidden="true">*</span>}
          {required && <span className="sr-only"> (obrigatório)</span>}
        </label>
      )}
      <div className="relative">
        {iconeEsquerda && (
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-foreground-subtle">
            {iconeEsquerda}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-describedby={[dicaId, erroId].filter(Boolean).join(" ") || undefined}
          aria-invalid={erro ? true : undefined}
          className={`h-10 w-full rounded-[10px] border bg-background text-sm text-foreground transition-colors placeholder:text-foreground-subtle hover:bg-surface-2 focus:bg-background focus:border-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${iconeEsquerda ? "pl-9 pr-3" : "px-3"} ${
            erro ? "border-error" : "border-border"
          } ${className}`}
          {...resto}
        />
      </div>
      {dica && !erro && (
        <p id={dicaId} className="text-xs text-foreground-muted">
          {dica}
        </p>
      )}
      {erro && (
        <p id={erroId} className="text-xs text-error" role="alert">
          {erro}
        </p>
      )}
    </div>
  );
});
