/**
 * Véu de IA — o degradê da marca em baixa opacidade varrendo a superfície que
 * está sendo trabalhada. Substitui o loader com anel girando: o "em andamento"
 * é dito pelo botão (estado "Pensando…"), e o véu só marca *onde* a IA está
 * mexendo — a foto que ela lê e o campo onde o texto vai nascer.
 *
 * A animação vive em app/globals.css (.ia-veu / .ia-veu-foto).
 */

/** Camada sobre a evidência fotográfica enquanto a IA a analisa. */
export function IaVeuFoto() {
  return <div className="ia-veu ia-veu-foto absolute inset-0 rounded-card" aria-hidden />;
}
