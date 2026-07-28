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

  return (
    <div className="flex min-h-full w-full">
      <aside className="hidden w-60 shrink-0 border-r border-neutral-100 bg-neutral-50 px-3 py-6 md:block">
        <p className="mb-4 px-3 text-sm font-medium text-neutral-500">{titulo}</p>
        <nav aria-label={titulo}>
          <ul className="flex flex-col gap-1">
            {itensNav.map((item) => {
              const ativo = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icone = item.icone;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={ativo ? "page" : undefined}
                    className={`flex items-center gap-2.5 rounded-control px-3 py-2 text-sm font-medium transition-colors ${
                      ativo ? "bg-brand-50 text-brand-700" : "text-neutral-700 hover:bg-neutral-100"
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
      <main className="min-w-0 flex-1 px-5 py-6 md:px-8">{children}</main>
    </div>
  );
}
