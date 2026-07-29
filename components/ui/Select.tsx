import { forwardRef, useId } from "react";
import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  rotulo: string;
  dica?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { rotulo, dica, id, className = "", required, children, ...resto },
  ref,
) {
  const idGerado = useId();
  const selectId = id ?? idGerado;
  const dicaId = dica ? `${selectId}-dica` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm font-medium text-neutral-800">
        {rotulo} {required && <span aria-hidden="true">*</span>}
        {required && <span className="sr-only"> (obrigatório)</span>}
      </label>
      <select
        ref={ref}
        id={selectId}
        required={required}
        aria-describedby={dicaId}
        className={`h-11 rounded-control border border-neutral-300 px-3 text-base text-neutral-900 ${className}`}
        {...resto}
      >
        {children}
      </select>
      {dica && (
        <p id={dicaId} className="text-sm text-neutral-600">
          {dica}
        </p>
      )}
    </div>
  );
});
