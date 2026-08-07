"use client";

import { Bell } from "lucide-react";
import { LogoTil } from "@/components/brand/LogoTil";
import { Avatar } from "@/components/ui/Avatar";

/**
 * Cabeçalho da jornada do operador: avatar, marca e notificações numa pílula.
 * Botão circular é exceção legítima ao raio de controle (UI-PRIMITIVES.md §1.1).
 */
export function OperatorHeader({
  nomeOperador,
  fotoOperador,
  quantidadeNotificacoes = 0,
  onAbrirNotificacoes,
}: {
  nomeOperador: string;
  /** Retrato do operador; sem ele o Avatar cai nas iniciais. */
  fotoOperador?: string | null;
  quantidadeNotificacoes?: number;
  onAbrirNotificacoes?: () => void;
}) {
  const rotuloSino =
    quantidadeNotificacoes > 0
      ? `Notificações (${quantidadeNotificacoes} não lidas)`
      : "Notificações (nenhuma não lida)";

  return (
    // Pílula de borda sobre o fundo branco, não superfície cinza — Figma node 4144:2821.
    <header className="flex items-center justify-between gap-3 rounded-pill border border-border bg-background px-3 py-3">
      <Avatar nome={nomeOperador} src={fotoOperador} tamanho="lg" />

      <LogoTil tamanho="lg" className="text-foreground" />

      <button
        type="button"
        onClick={onAbrirNotificacoes}
        aria-label={rotuloSino}
        className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[0.8px] border-border bg-background text-foreground outline-none transition-colors hover:bg-surface-3 focus-visible:ring-1 focus-visible:ring-foreground"
      >
        <Bell size={20} aria-hidden />
        {quantidadeNotificacoes > 0 && (
          <span
            className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-status-avariado ring-2 ring-background"
            aria-hidden
          />
        )}
      </button>
    </header>
  );
}
