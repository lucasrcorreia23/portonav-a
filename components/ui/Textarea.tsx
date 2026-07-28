import { forwardRef, useId } from "react";
import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  rotulo: string;
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
      <label htmlFor={inputId} className="text-sm font-medium text-neutral-800">
        {rotulo} {required && <span aria-hidden="true">*</span>}
        {required && <span className="sr-only"> (obrigatório)</span>}
      </label>
      <textarea
        ref={ref}
        id={inputId}
        required={required}
        rows={rows}
        aria-describedby={erroId}
        aria-invalid={erro ? true : undefined}
        className={`rounded-control border px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 ${
          erro ? "border-status-avariado" : "border-neutral-300"
        } ${className}`}
        {...resto}
      />
      {erro && (
        <p id={erroId} className="text-sm text-status-avariado">
          {erro}
        </p>
      )}
    </div>
  );
});
