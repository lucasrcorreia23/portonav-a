import { forwardRef, useId } from "react";
import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  rotulo?: string;
  erro?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { rotulo, erro, id, className = "", required, rows = 3, ...resto },
  ref,
) {
  const idGerado = useId();
  const inputId = id ?? idGerado;
  const erroId = erro ? `${inputId}-erro` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {rotulo && (
        <label htmlFor={inputId} className="text-xs font-semibold text-foreground-muted">
          {rotulo} {required && <span aria-hidden="true">*</span>}
          {required && <span className="sr-only"> (obrigatório)</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        required={required}
        rows={rows}
        aria-describedby={erroId}
        aria-invalid={erro ? true : undefined}
        className={`w-full rounded-xl border bg-background px-3 py-2 text-sm text-foreground transition-colors placeholder:text-foreground-subtle hover:bg-surface-2 focus:bg-background focus:border-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
          erro ? "border-error" : "border-border"
        } ${className}`}
        {...resto}
      />
      {erro && (
        <p id={erroId} className="text-xs text-error" role="alert">
          {erro}
        </p>
      )}
    </div>
  );
});
