interface SkeletonProps {
  className?: string;
}

/** Skeleton loaders fiéis à UI real. Ao mudar um layout, atualize o skeleton correspondente. */
export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`animate-pulse rounded-md bg-surface-3 ${className}`} aria-hidden="true" />;
}

/** Skeleton com faixa clara varrendo — usar quando um valor específico está sendo buscado. */
export function Shimmer({ className = "" }: SkeletonProps) {
  return <div className={`skeleton-shimmer rounded-md ${className}`} aria-hidden="true" />;
}

/** Esqueleto de tabela: cabeçalho + N linhas com M colunas. */
export function TableSkeleton({ linhas = 8, colunas = 5 }: { linhas?: number; colunas?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border" aria-hidden="true">
      <div className="flex gap-4 bg-surface-2 px-3 py-2.5">
        {Array.from({ length: colunas }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      <div>
        {Array.from({ length: linhas }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 border-b border-border px-3 py-2.5 last:border-0">
            {Array.from({ length: colunas }).map((_, c) => (
              <Skeleton key={c} className={`h-3.5 flex-1 ${c === 0 ? "max-w-[40%]" : ""}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Esqueleto de uma grade de KPI cards. */
export function KpiSkeleton({ quantidade = 4 }: { quantidade?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-hidden="true">
      {Array.from({ length: quantidade }).map((_, i) => (
        <div key={i} className="flex min-h-[104px] flex-col justify-between gap-3 rounded-card border border-border bg-surface p-4">
          <Skeleton className="h-9 w-9" />
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Esqueleto de um card genérico com título e linhas. */
export function CardSkeleton({ linhas = 4 }: { linhas?: number }) {
  return (
    <div className="rounded-card border border-border bg-surface p-3" aria-hidden="true">
      <Skeleton className="h-3.5 w-24" />
      <div className="mt-4 space-y-2.5">
        {Array.from({ length: linhas }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-full" />
        ))}
      </div>
    </div>
  );
}
