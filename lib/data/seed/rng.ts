export type RNG = () => number;

/** PRNG determinístico (mulberry32) — mesma seed produz sempre a mesma sequência. */
export function mulberry32(seed: number): RNG {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function embaralhar<T>(rng: RNG, itens: readonly T[]): T[] {
  const copia = [...itens];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export function escolherUm<T>(rng: RNG, itens: readonly T[]): T {
  return itens[Math.floor(rng() * itens.length)];
}

export function escolherVarios<T>(rng: RNG, itens: readonly T[], quantidade: number): T[] {
  return embaralhar(rng, itens).slice(0, quantidade);
}

export function inteiroEntre(rng: RNG, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function chance(rng: RNG, probabilidade: number): boolean {
  return rng() < probabilidade;
}

/**
 * Id determinístico derivado do RNG seedado — usado exclusivamente dentro da geração de
 * seed (nunca em ações reais do usuário, que devem usar criarId() de lib/data/id.ts).
 * Essencial para que gerarSeed() seja puro: o mesmo SEED_MESTRE precisa produzir os
 * mesmos ids sempre, ou o servidor (SSR) e o cliente (primeira carga) geram entidades
 * com os mesmos dados mas ids diferentes — o que quebra a hidratação do React.
 */
export function criarIdSeed(rng: RNG, prefixo: string): string {
  const parte = Array.from({ length: 4 }, () => Math.floor(rng() * 36 ** 6).toString(36).padStart(6, "0")).join("");
  return `${prefixo}_${parte}`;
}
