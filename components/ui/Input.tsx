import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  rotulo: string;
  erro?: string;
  dica?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { rotulo, erro, dica, id, className = "", required, ...resto },
  ref,
) {
  const idGerado = useId();
  const inputId = id ?? idGerado;
  const dicaId = dica ? `${inputId}-dica` : undefined;
  const erroId = erro ? `${inputId}-erro` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-neutral-800">
        {rotulo} {required && <span aria-hidden="true">*</span>}
        {required && <span className="sr-only"> (obrigatório)</span>}
      </label>
      <input
        ref={ref}
        id={inputId}
        required={required}
        aria-describedby={[dicaId, erroId].filter(Boolean).join(" ") || undefined}
        aria-invalid={erro ? true : undefined}
        className={`h-11 rounded-control border px-3 text-base text-neutral-900 placeholder:text-neutral-400 ${
          erro ? "border-status-avariado" : "border-neutral-300"
        } ${className}`}
        {...resto}
      />
      {dica && !erro && (
        <p id={dicaId} className="text-sm text-neutral-600">
          {dica}
        </p>
      )}
      {erro && (
        <p id={erroId} className="text-sm text-status-avariado">
          {erro}
        </p>
      )}
    </div>
  );
});
