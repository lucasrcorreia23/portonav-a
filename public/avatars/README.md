# Retratos dos operadores (demo)

Rostos **sintéticos**, gerados por GAN via [thispersondoesnotexist.com](https://thispersondoesnotexist.com).
**Nenhuma pessoa real aparece aqui** — nenhum desses rostos existe.

Isso é deliberado: as fichas de operador do protótipo são fabricadas (matrícula,
turno, score de confiabilidade). Anexar o rosto de uma pessoa real e identificável
a um dossiê de funcionário inventado é um problema que dá pra evitar de graça —
então evitamos. Se um dia entrarem fotos reais, elas precisam vir do RH com
consentimento, e este README deve ser atualizado.

## Convenção

Um arquivo por operador do seed, nomeado pela **matrícula** em minúsculas:

```
public/avatars/pn-4521.jpg   → Carlos Eduardo Silva
public/avatars/pn-4522.jpg   → Marcos Vinícius Souza
...
```

`lib/data/seed/seed-operadores.ts` deriva o caminho da matrícula, sem tabela de
mapeamento. Para adicionar um operador ao roster, basta soltar
`pn-XXXX.jpg` aqui. Sem arquivo, o `Avatar` cai nas iniciais sozinho
(`onError` → fallback), então nada quebra.

Formato: JPEG 256×256, qualidade 82 (~10–14 KB cada). O `Avatar` maior em uso é
`2xl` (72px), então 256px cobre telas retina com folga.
