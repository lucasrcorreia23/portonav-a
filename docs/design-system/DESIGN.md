# Direção Visual Atomsix

> **O que é isto:** o DNA visual dos produtos Atomsix — cores, tipografia, densidade, primitivos e regras de acabamento. Sem nada específico de nenhum produto (sem leads, pipeline, oportunidades, etc.) — só a direção visual, pra ser aplicada em qualquer produto novo.
>
> **Identidade:** marca **Atomsix** (gradiente-assinatura + Averta). Referência de acabamento: **Attio, Clay, Apollo** — ferramentas de trabalho densas e clean.
>
> **Como usar:** copie `src/styles/tokens.css` e `src/styles/globals.css` deste repo pro seu projeto, configure as fontes (Averta + Inter — já estão em `public/fonts/`), e siga as regras de componente abaixo. Em conflito, **tokens.css + este doc prevalecem** sobre o que a feature inventar. Ver também [UI-PRIMITIVES.md](./UI-PRIMITIVES.md) pro inventário de componentes.

---

## 1. Essência (a regra de ouro)

Clean, **denso e apertado** — nunca espaçoso/genérico. O visual transmite "ferramenta séria de trabalho", não landing page.

- **Bordas finas de 1px** em tudo (cards, sidebar, tabelas, inputs). Sem sombra pesada.
- **Controles interativos são pill-shaped** (`border-radius: 9999px`): botões, inputs, selects, filtros, pickers.
- **Sidebar neutra** (cinza/branco), nunca colorida.
- **Cor usada com disciplina** — um azul de ação só, o resto neutro.
- A **marca vem do logo + tipografia**, não de cor espalhada pela UI.
- O **gradiente-assinatura fica reservado** ao logo, branding e raros destaques de IA. O produto em si é **sólido/neutro**.
- **Botão primário = alto contraste sólido**: fundo `--color-foreground` (preto no light / branco no dark), texto `--color-background`. Sem gradiente nos botões de produto.
- **Densidade tipo Attio/Clay:** aproveitar o espaço, KPIs compactos, linhas de tabela confortáveis mas não gigantes.

**Do / Don't**
- ✅ Denso, apertado, neutro, 1 azul de ação, pill nos controles. ❌ Espaço vazio sobrando, sidebar azul, radius inconsistente.
- ✅ Dropdowns/date/time **custom** em tudo. ❌ Widgets nativos do SO (`<select>`, `type="date"`).
- ✅ Averta na UI + Inter no corpo. ❌ Misturar pesos sem hierarquia.
- ✅ Light **e** dark cuidados igualmente (a marca é dark-native). ❌ Dark como afterthought.
- ✅ Foco neutro e sutil (borda preta/branca). ❌ Halo/anel azul.

---

## 2. Cor

### Primária e neutros
- **Primária de ação:** `#1450E7` (azul Atomsix) — acentos, links, foco lógico, seleção. Usar com parcimônia.
- **Botão primário:** fundo `--color-foreground` + texto `--color-background`, hover `opacity-90`. **Não** usa a primária azul nem gradiente.
- **Fundo:** branco em tudo no light (conteúdo, top nav, sidebar e cards no mesmo branco, separados por **borda 1px**). Dark: preto puro `#000` com surfaces escalonadas.
- **Texto:** quase-preto (títulos `--color-foreground`), cinza médio (corpo `--color-foreground-muted`), cinza claro (legenda/placeholder `--color-foreground-subtle`). Contraste AA sempre.

### Gradiente-assinatura (reservado à marca)
Ordem: **cyan → azul → indigo → roxo → magenta → laranja**. No light usar com **parcimônia** (logo, raros destaques de IA). Nunca em botões/superfícies de produto.

### Semânticos
- Success `#16a34a` · Error `#dc2626` · Warning `#d97706` · Info = azul da marca.

### Alto contraste (preto/branco)
Reservado ao **segmented control** (abas): aba ativa usa `--color-foreground` com texto invertido.

---

## 3. Tipografia

- **UI = Averta** com stylistic alternate ligado (`font-feature-settings: var(--font-ui-features)`): botões, menus, tabs, chips, labels, títulos, cabeçalho de coluna/tabela.
- **Corpo = Inter** (self-host via `@fontsource/inter`): parágrafos, descrições, células de tabela. Fallback da Averta.
- **Averta self-hosted só tem 300/400/600/700/800** — **não existe 500/Medium**. Onde precisar de "medium", usar **600** (semibold); `font-medium`/500 cai para 400 e fica regular.
- **Nunca itálico** — nenhum texto usa `italic`. Para texto secundário/ausente, usar cor mais clara (`text-foreground-subtle`), não itálico.
- **Semibold (600)** em: botões, item de menu, título de coluna, **labels de input/select/combobox/picker**.
- **Títulos de página:** `text-2xl font-bold tracking-tight`. Saudações/home maiores (`text-3xl tracking-tight`).
- **Header de tabela:** Averta semibold, **texto preto** (`text-foreground`), `letter-spacing: 0`, **sem uppercase** (preserva o casing — só a 1ª letra do conteúdo é maiúscula). Nunca `uppercase tracking-wider`.

---

## 4. Densidade, raio & casing

- **Raio:** chips/badges 4px · menu items 4px · cards/dropdowns 8px · modais 10–12px. **Botões, inputs, selects, filtros e pickers = pill (`9999px`).** Filtros/seletores pill usam `pl-4 pr-3` (mais respiro à esquerda pela curvatura).
- **Altura fixa de controles:** inputs/selects/date-pickers/botões "ordenar"/botões só-ícone/view-toggle = **40px** (`h-10`). Botões por tamanho: **sm 32px · md 40px · lg 44px** (altura fixa, `box-border`, `shrink-0` — nunca sobrescrever via `className`). Headers de lista usam `size="md"` (40px).
- **Linhas de tabela:** células `px-3 py-3` (header e corpo) — confortáveis, não gigantes.
- **Casing — sentence case** em tags, chips, badges, labels de filtro e opções de dropdown: primeira letra maiúscula, resto minúsculo (acrônimos preservados). Aplicar em dados dinâmicos do banco ao montar os labels. Sem `capitalize`/`uppercase` CSS em chip.
- **Acentuação obrigatória** em TODA string visível (labels, placeholders, títulos, botões, tooltips, aria-labels, toasts, erros, opções). Verificar antes de commitar.
- **Nunca exibir key/enum cru** na tela (`score_gte`, `lead_criado`...). Todo enum tem um label humano. snake_case é dado interno, jamais texto de UI.

---

## 5. Foco (anti-halo)

- **Foco neutro e sutil:** borda **preta** (light) / **branca** (dark) de 1px via `--color-foreground`. **Sem halo/anel azul.**
- **Uma única indicação por elemento, nunca dupla.** Inputs/selects/combobox/pickers mudam a **cor da borda** no foco/aberto (`focus:border-foreground`); botões usam `ring-1` foreground; demais focáveis caem no `outline: 1px solid var(--color-foreground)` da regra global `:focus-visible`.
- Nunca `ring-primary` (azul).

---

## 6. Layout & navegação

- **Largura do conteúdo:** total (sem `max-width`), alinhado à esquerda, com padding do `main`.
- **Sidebar esquerda** (~`w-72`), tema-aware, **neutra**, com borda direita. Dark: fundo com **gradiente** de `--color-sidebar-bg` até `--color-background` (não cor sólida).
  - **Topo:** logo (símbolo + wordmark) + botão recolher/expandir. Abaixo: **busca em pill** (`rounded-full`, `h-8`) + botão **"+"** ao lado (mesmo visual da busca).
  - **Seções** com título uppercase muted, dividers entre seções; item ativo com tokens `sidebar-item-active-*` (neutro, não azul). Ícone do item ativo vira **filled**.
  - **Recolhível** (estado persistido): expandida `w-72`; recolhida `w-[72px]` em modo ícone (só ícones, com tooltip).
  - **Rodapé:** menu do usuário (avatar + nome + dropdown).
- **Sem botão/seta de "voltar"** ao lado do título de página — navegação é pela sidebar. (Builders/editores de tela cheia podem ter voltar explícito.)
- **Header de página:** título à esquerda (`text-2xl font-bold tracking-tight`), ação primária à direita.
- **Scrollbars ocultas** em toda a app (scroll funciona) — regra global no `globals.css`.

---

## 7. Primitivos de UI (use, não reinvente)

> **Regra dura:** nunca hand-rolle campos/listas/drawers com `<input>`/`<select>`/`<label>` crus + classes próprias. Se o primitivo não cobre, **estenda o primitivo** ou crie um novo em `components/ui/` — nunca um paralelo na feature. **Widget nativo do SO é proibido.** Inventário completo em [UI-PRIMITIVES.md](./UI-PRIMITIVES.md).

### Campos de formulário
| Caso | Use | NÃO use |
|---|---|---|
| Texto com label + erro | `Input` | `<input>` cru + classe própria |
| Select simples | `Select` (popover custom) | `<select>` nativo |
| Autocomplete / busca em lista | `Combobox` (type-ahead embutido no trigger) | input + dropdown manual |
| Escolher entidade existente/criar | `EntityPicker` | combobox manual |
| Multi-tags / chips | `ChipSelect` | checkboxes soltos |
| Data / período | `DatePicker` / `DateRangeFilter` | `type="date"` (abre calendário nativo — proibido) |

- **Altura 40px**, fundo branco (`bg-background`), borda `--color-border`, foco com borda preta.
- **Label = `text-xs font-medium text-foreground-muted`** (via prop `label` do componente). Nunca `text-sm font-semibold`, nunca classes-fantasma `input`/`field-label`/`field-error`.

### Criação / edição de entidade
- **Criar/editar registro = `Drawer` lateral** (slide-in pela direita), nunca página dedicada nem modal central. Footer: `Cancelar` (outline, esquerda via `mr-auto`) + `Salvar` (primário, direita), ambos largura automática.
- **Wizard multi-etapa:** página dentro do layout (sidebar visível, sem top bar própria), nunca `fixed inset-0`.
- **Confirmação destrutiva = `ConfirmDialog`** (card compacto centralizado, sem X/dividers, título + descrição muted + Cancelar/ação à direita). É o popup PADRÃO de confirmação/alerta/exclusão.
- **`Modal`** (header + X + dividers) só para diálogos pequenos com conteúdo (ex.: form pontual), nunca para criar entidade.

### Listagem (scaffold)
Header (título + contagem + ação primária) · busca (`Input`) · filtros (`MultiSelectFilter` / `SortMenu`) · `ViewToggle` (grid/lista) · `EmptyState` · `TablePagination` · seleção em lote (`SelectAllCheckbox` + `BulkBar` via portal `position: fixed`).

### Tabelas
Visual limpo: **sem borda no container**, **sem dividers entre linhas**, **um divider abaixo do header**. Header fundo branco, `text-[13px]`, sticky. Hover sutil; linha selecionada `bg-primary/5`. Avatar embutido na coluna de nome. `RowActions` (3 pontos) visível só no hover (`group/row`). Chips editáveis inline via `ChipSelect`.

### Outros
- **Badges:** `Badge` aplica `sentenceCase()` automático; variante gray usa `text-foreground/70`. Peso 600.
- **Botões:** primário (fundo foreground), secundário (branco + borda), ghost, danger. Pill em todas. Labels de criação sem prefixo "+".
- **KPI cards:** ícone no topo, rótulo abaixo do número, compactos.
- **Avatar:** iniciais com **fundo claro + texto cor forte** (nunca fundo sólido escuro + texto branco).
- **Ícones:** só de `components/ui/icons.tsx` (stroke 1.5, `currentColor`). Não importar lib de ícone nova sem decisão.
- **Skeleton:** fiel à silhueta do conteúdo real (`Skeleton`, `TableSkeleton`, `KpiSkeleton`, `CardSkeleton`). `Shimmer` (faixa clara varrendo) só quando um valor específico está sendo buscado.
- **Spinner:** anel fino (`stroke 2.25`) + arco de ¼ girando, `currentColor`. Tamanhos 16/24/40px.
- **Toast:** canto inferior direito, sem barra de progresso, Averta, radius 16px, auto-dismiss 5s. Só o ícone na cor do tipo (lucide `CircleCheck`/`CircleX`/`TriangleAlert`/`Info`), sem fundo.
- **Tooltips — SEMPRE custom, NUNCA nativas.** Camada global intercepta `title` nativo e exibe tooltip próprio (fundo `foreground`, texto `background`, `text-[11px]`, radius md, delay ~350ms). **Botão só-ícone é obrigado a ter tooltip** (usa `aria-label` como fallback). Nunca depender do `title` nativo para feedback.
- **Checkbox:** `appearance: none`, ~18px, check stroke 1.5, fundo primário quando marcado.
- **Dropdowns/menus:** container radius 8px + padding 4px; cada item radius 4px (hover/ativo arredondados).

---

## 8. Padrão de IA (quando o produto tiver assistente)

Se o novo produto tiver IA, reusar o visual:
- **Avatar de IA:** círculo no gradiente indigo→magenta→laranja com sparkle branco (32px).
- **Bolhas de chat:** usuário = `bg-foreground text-background` à direita; IA = card `bg-surface` + borda, `rounded-xl px-4 py-3 text-sm`.
- **Loader de IA:** anel no degradê (conic-gradient da marca girando) + texto rotativo do que está fazendo.
- **Botão de ação de IA:** gradiente-assinatura + pill (única exceção ao "sem gradiente em botões"). Sparkle filled branco dentro.
- **Toda resposta de IA tem like/dislike**; dislike pede justificativa.
- **Campos sugeridos pela IA:** pill com borda tracejada + `bg-surface-2`, marcado com sparkle no gradiente.

---

## 9. Stack & disciplina técnica (resumo)

Front: **React 19 + Vite + TS + Tailwind 4 + TanStack Query + Axios + Zustand + React Hook Form + Zod**. (Website/LP → Next.js 16.) Tudo tipado (sem `any` sem justificativa). Sem cor/tamanho hardcoded — só tokens. Tratar **loading / erro / empty** em toda tela. Acessibilidade e segurança sempre. Reflita toda mudança de UI na página viva (`src/pages/design-system-page.tsx`) + este doc. Padrões técnicos completos (arquitetura de pastas, TanStack Query, formulários, backend Java/Spring) em [CLAUDE.md](./CLAUDE.md).

---

## Checklist de conformidade (auto-checar antes de "pronto")

- [ ] Tokens copiados; nenhuma cor/tamanho hardcoded no JSX.
- [ ] Light **e** dark testados.
- [ ] Averta na UI + Inter no corpo; nada itálico; "medium" = 600.
- [ ] Controles interativos pill-shaped; alturas fixas (sm 32 / md 40 / lg 44).
- [ ] Sidebar neutra; sem botão de "voltar" ao lado do título.
- [ ] Dropdowns/date/time **custom** — zero widget nativo do SO.
- [ ] Criação de registro em **Drawer**; confirmação em **ConfirmDialog**.
- [ ] Tabela: sem borda no container, um divider sob o header, hover sutil.
- [ ] Foco neutro (borda preta/branca), sem anel azul, sem indicação dupla.
- [ ] Acentos corretos em toda string; nenhum enum/key cru na tela; sentence case nos chips.
- [ ] Botão só-ícone tem tooltip custom + aria-label.
- [ ] Loading / erro / empty tratados em toda tela.
