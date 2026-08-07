/**
 * Ocupa o lugar do <Textarea> enquanto a IA simulada escreve. Em vez das barras
 * de skeleton (que prometem uma silhueta de texto que a IA ainda não tem), o
 * campo fica vazio e o véu da marca varre por cima — mesma varredura do
 * skeleton, no pigmento da IA. Ver .ia-veu em app/globals.css.
 *
 * Espelha as classes de rótulo e de caixa do primitivo, e reserva a altura de
 * `linhas` linhas de `text-sm` (1.25rem cada, como no <Textarea>), pra troca
 * pelo campo real não deslocar o layout.
 */
export function CampoGerandoIA({
  rotulo,
  linhas = 3,
  etapa,
}: {
  rotulo: string;
  linhas?: number;
  /** Etapa do roteiro — só para leitor de tela; na tela quem fala é o botão. */
  etapa?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-foreground-muted">{rotulo}</span>
      <div className="ia-veu w-full rounded-xl border border-border bg-background px-3 py-2">
        <div style={{ height: `calc(${linhas} * 1.25rem)` }} aria-hidden />
      </div>
      {etapa && (
        <span className="sr-only" role="status" aria-live="polite">
          {etapa}
        </span>
      )}
    </div>
  );
}
