"use client";

import { useRouter } from "next/navigation";
import { LogoTil } from "@/components/brand/LogoTil";
import { OperatorShell } from "@/components/layout/OperatorShell";
import { Button } from "@/components/ui/Button";

/**
 * Porta de entrada da jornada do operador — sem cabeçalho, a marca é o próprio conteúdo.
 * Segue o frame "Whitelabel" do Figma: texto ancorado no topo, ação no rodapé e a
 * ambiência de areia atravessando a tela por trás dos dois.
 */
export default function BemVindoPage() {
  const router = useRouter();

  return (
    <OperatorShell>
      <div className="relative isolate flex flex-1 flex-col justify-between">
        {/* Ambiência puramente decorativa: dois círculos de areia desfocados. Sangram até
            a borda real da tela — as insets negativas cancelam o padding do shell — e são
            recortados ali, como o frame recorta no Figma. */}
        <div
          className="pointer-events-none absolute -inset-x-4 -inset-y-6 -z-10 overflow-hidden sm:-inset-x-6"
          aria-hidden
        >
          <div className="absolute -left-[177px] top-[44%] h-[353px] w-[353px] rounded-full bg-brand-sand/50 blur-[120px]" />
          <div className="absolute -right-[133px] top-[35%] h-[182px] w-[182px] rounded-full bg-brand-sand/50 blur-[120px]" />
        </div>

        {/* O texto tem 16px de recuo a mais que o botão — é o container interno do frame. */}
        <div className="p-4">
          <LogoTil tamanho="lg" className="text-foreground" />

          <h1 className="mt-8 text-display-md text-foreground">Bem-vindo</h1>
          <p className="mt-5 text-sm text-foreground-muted">
            Gerencie, rastreie e crie suas tarefas diárias para uma operação portuária tranquila
          </p>
        </div>

        <Button tamanho="touch" larguraTotal onClick={() => router.push("/operador")}>
          Vamos começar
        </Button>
      </div>
    </OperatorShell>
  );
}
