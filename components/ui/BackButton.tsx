import { ArrowLeft } from "lucide-react";

/**
 * Botão circular de voltar — o padrão de navegação das pranchas: sempre o mesmo
 * círculo com borda no canto superior esquerdo, seja no cabeçalho de uma tela
 * (<OperatorPageHeader>) ou no de uma folha (<Drawer navegacao="voltar">).
 *
 * 44px é o tamanho do `Button/Mobile` nas pranchas — não os 48px de `--size-touch-min`,
 * que é piso para alvo livre e não mínimo universal (ver AGENTS.md).
 * Botão circular é exceção legítima ao raio de controle (UI-PRIMITIVES.md §1.1).
 */
export function BackButton({
  aoVoltar,
  rotulo = "Voltar",
  className = "",
}: {
  aoVoltar: () => void;
  /** Rótulo acessível — o ícone é sozinho, então precisa dizer para onde volta. */
  rotulo?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={aoVoltar}
      aria-label={rotulo}
      className={`inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-foreground outline-none transition-colors hover:bg-surface-2 focus-visible:ring-1 focus-visible:ring-foreground ${className}`}
    >
      <ArrowLeft size={20} aria-hidden />
    </button>
  );
}
