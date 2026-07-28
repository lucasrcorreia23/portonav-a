"use client";

import { alternarOffline, useEstadoDemo } from "@/lib/data/context";

export function OfflineToggle() {
  const demo = useEstadoDemo();

  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-sm font-medium text-neutral-800">Modo offline</span>
      <button
        type="button"
        role="switch"
        aria-checked={demo.offline}
        onClick={() => alternarOffline()}
        className={`relative h-6 w-11 shrink-0 rounded-pill transition-colors ${
          demo.offline ? "bg-status-apontamento" : "bg-neutral-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            demo.offline ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}
