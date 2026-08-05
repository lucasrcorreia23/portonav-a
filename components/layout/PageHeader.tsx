import type { ReactNode } from "react";

interface PageHeaderProps {
  titulo: string;
  subtitulo?: string;
  acoes?: ReactNode;
}

export function PageHeader({ titulo, subtitulo, acoes }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-display-md text-foreground">{titulo}</h1>
        {subtitulo && <p className="mt-1 text-foreground-muted">{subtitulo}</p>}
      </div>
      {acoes && <div className="flex items-center gap-2">{acoes}</div>}
    </div>
  );
}
