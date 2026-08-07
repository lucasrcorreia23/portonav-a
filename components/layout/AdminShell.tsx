"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export interface ItemNavAdmin {
  href: string;
  label: string;
  icone: LucideIcon;
}

interface AdminShellProps {
  titulo: string;
  itensNav: ItemNavAdmin[];
  children: ReactNode;
}

/** Shell denso e desktop para admin/supervisor/manutenção: barra lateral + conteúdo. */
export function AdminShell({ titulo, itensNav, children }: AdminShellProps) {
  const pathname = usePathname();

  // Só o item mais específico fica ativo. Sem isso, o item índice da seção
  // (href "/admin") casaria com todas as rotas filhas e ficaria aceso junto
  // com o item realmente navegado.
  const hrefAtivo = itensNav
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .reduce<string | null>(
      (maisEspecifico, item) =>
        maisEspecifico === null || item.href.length > maisEspecifico.length ? item.href : maisEspecifico,
      null,
    );

  return (
    <div className="flex h-full w-full">
      <aside className="hidden h-full w-72 shrink-0 overflow-y-auto border-r border-sidebar-border bg-sidebar-bg px-3 py-6 md:block">
        <p className="mb-4 px-3 text-sm font-semibold text-foreground-subtle">{titulo}</p>
        <nav aria-label={titulo}>
          <ul className="flex flex-col gap-1">
            {itensNav.map((item) => {
              const ativo = item.href === hrefAtivo;
              const Icone = item.icone;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={ativo ? "page" : undefined}
                    className={`flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm font-medium transition-colors ${
                      ativo
                        ? "bg-sidebar-item-active-bg text-sidebar-item-active-text"
                        : "text-sidebar-item hover:bg-sidebar-item-hover-bg hover:text-sidebar-item-hover-text"
                    }`}
                  >
                    <Icone size={18} aria-hidden />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
      {/* pb-24 evita que botões no canto inferior direito fiquem embaixo da pílula fixa "Modo demonstração". */}
      <main className="h-full min-w-0 flex-1 overflow-y-auto px-5 py-6 pb-24 md:px-8">{children}</main>
    </div>
  );
}
