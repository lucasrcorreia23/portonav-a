# Atomsix Design System — Inventário de Primitivos de UI (fonte da verdade)

> **Regra dura:** ao construir qualquer tela nova no produto que instalar este design system, use os componentes deste repo (`src/components/ui/`). **Não hand-rolle** campos, drawers, filtros ou listas com `<input>`/`<label>`/`<select>` crus + classes próprias. Se o primitivo não cobre o caso, **estenda o primitivo** (ou abra um novo em `components/ui/`), nunca crie um paralelo na feature do produto consumidor.
>
> Todos os componentes abaixo já vêm prontos em `src/components/ui/` deste repo — copie a pasta inteira para o novo produto (ou instale como dependência do monorepo, se aplicável). Tokens em `src/styles/tokens.css`. **Nunca** cor/tamanho hardcoded. A página viva `src/pages/design-system-page.tsx` renderiza exemplos reais de cada primitivo — use-a como referência visual e mantenha-a atualizada ao estender algo.

---

## 1. Campos de formulário

| Caso | Use | NÃO use |
|---|---|---|
| Campo de texto com label + erro | `<Input label="..." error={...} />` (`input.tsx`) | `<label className="field-label">` + `<input className="input">` |
| Select simples | `<Select>` (`select.tsx`) — abre **popover estilizado** | `<select>` nativo do SO; `<select className="input">` |
| Alternar entre **2 opções** (ou poucas, mutuamente exclusivas) | `<SegmentedControl>` — pill switcher, seleção em **1 clique** | `<Select>`/dropdown com só 2 opções (abrir popover pra 1 escolha) |
| Autocomplete texto livre / busca em lista | `<Combobox>` (`combobox.tsx`) | input + dropdown manual |
| Escolher entidade (cliente, contato, empresa…) | `<EntityPicker>` (`entity-picker.tsx`) | combobox manual |
| Multi-tags / chips | `<ChipSelect>` (`chip-select.tsx`) | checkboxes soltos |
| Data / período | `<DatePicker>` (`date-picker.tsx`) / `<DateRangeFilter>` | `<input type="date">` cru **e** `<Input type="date">` (ambos abrem o calendário NATIVO do SO — proibido) |
| Escolha única em poucos valores com cor semântica | `<ChipChoice>` (`chip-choice.tsx`) — chips 1-clique | botões soltos com cor hardcoded; `<Select>` para 3 valores fixos |

`Input` já renderiza o label (`text-xs font-semibold text-foreground-muted`), o campo `rounded-[10px]` tokenizado e a mensagem de erro. **É o label oficial.** Se precisar de label fora de um Input, copie exatamente essa classe — não invente `field-label`.

**Regra dos 2 itens (obrigatória):** um seletor com apenas **2 opções** (ou poucas, curtas e mutuamente exclusivas) deve usar **`<SegmentedControl>`**, **não** um `<Select>`/dropdown. Dropdown (`<Select>`/`<Combobox>`) só quando a lista é longa, cresce, ou os rótulos são grandes.

**Classes proibidas (não existem no CSS):** `input`, `field-label`, `field-error`. Qualquer ocorrência é bug.

### 1.1 Anatomia visual obrigatória de seletores e dropdowns

Todo seletor de formulário (Select, Combobox, EntityPicker, ou qualquer custom) **deve** seguir esta anatomia visual exata. **Nunca hand-rolle um seletor com classes ad-hoc** — use um primitivo existente ou estenda-o.

**Trigger (botão/campo que abre o dropdown):**

| Token | Valor | Errado |
|---|---|---|
| border-radius | `rounded-[10px]` | `rounded-full`, `rounded-md`, `rounded-lg` |
| background | `bg-background` | `bg-surface`, `bg-surface-2` |
| border | `border border-border` | `border-foreground/20`, opacidades custom |
| altura | `h-10` | — |
| padding | `pl-4 pr-3.5` | `px-3`, `px-2` |
| hover | `hover:bg-background` | `hover:bg-surface-2`, `hover:border-foreground/20` |
| focus | `focus:border-foreground` | — |
| disabled | `disabled:opacity-50 disabled:cursor-not-allowed` | `disabled:opacity-60` |
| chevron | SVG 14x14 `text-foreground-subtle`, posicionado com `justify-between` no lado **direito** do trigger, separado do label | Chevron dentro do mesmo `<span>` do label |

**Popover (dropdown que abre abaixo):**

| Token | Valor | Errado |
|---|---|---|
| border-radius | `rounded-lg` | `rounded-xl`, `rounded-md` |
| background | `bg-surface` | `bg-surface-1`, `bg-background` |
| shadow | `shadow-md` | `shadow-lg` |
| z-index | `z-[var(--z-dropdown)]` | `z-20`, `z-50`, qualquer valor hardcoded |
| item radius | `rounded-[4px]` | `rounded-lg`, `rounded-md` |
| item padding | `px-2.5 py-1.5` | `px-2.5 py-2`, `px-3 py-2` |

**Exceções legítimas a `rounded-full`:** botões de ícone circulares (notificação, kebab, avatar) e chips/badges internos.

**Widget nativo do SO é proibido (regra geral).** Nenhum campo pode abrir UI do sistema operacional. Isso inclui: `<select>` nativo, e `type="date"|"time"|"datetime-local"|"month"|"week"` em **qualquer** elemento, inclusive `<Input>`.

---

## 2. Criação / edição de entidade

| Caso | Use |
|---|---|
| Criar/editar entidade (registro do domínio) | **`<Drawer>`** (`drawer.tsx`) + um form reutilizável. Lateral, não centralizado. |
| Wizard de criação multi-etapa | **Página dentro do layout do app** (`/entidade/new`) — ocupa só a **área de conteúdo**, com a **sidebar visível** e **SEM top bar própria**. `<WizardSteps>` + título + botão fechar vão num header do próprio conteúdo; footer de ações fixo no rodapé. **Nunca** `fixed inset-0`, `<Drawer>` ou `<Modal>`. |
| Confirmação destrutiva (excluir, arquivar) | `<ConfirmDialog>` (`confirm-dialog.tsx`) |
| Diálogo pequeno e pontual | `<Modal>` (`modal.tsx`) — **só** para isso, nunca para criar entidade |
| Preview rápido de registro | `<EntityPreviewDrawer>` (`entity-preview-drawer.tsx`) |

---

## 3. Página de listagem (scaffold)

Toda lista deve ter:

- Header: título + contagem + botão primário de ação (gradiente).
- Busca: `<Input>` de busca.
- Filtros: `<MultiSelectFilter>` / `<SortMenu>` (`table-tools.tsx`) — **não** `<select>` cru. Todo `<MultiSelectFilter>` traz, no topo do dropdown, um master "Selecionar todos" e, no rodapé, "Limpar filtro" quando há seleção.
- Alternância grid/lista: `<ViewToggle>` (`view-toggle.tsx`).
- Vazio: `<EmptyState>` (`empty-state.tsx`).
- Paginação: `<TablePagination>` (`table-pagination.tsx`).
- Seleção em lote: `<SelectAllCheckbox>` + `<BulkBar>` (`table-tools.tsx`) — hook `useRowSelection` (`lib/table-utils.ts`). `BulkBar` deve trazer **ações contextuais ao tipo de registro** da lista (não só "excluir"/"exportar") — ex.: mudar estágio em massa, atribuir responsável/canal em massa — sempre que o domínio do produto tiver essas operações.
- Scroll horizontal: container `overflow-x-auto`/`overflow-auto` com `ref` + `useDragScroll(ref)` (`lib/use-drag-scroll.ts`) quando a tabela pode estourar a largura.

### 3.1 Agrupar por (group-by) — padrão recomendado em toda lista/tabela

Controle **`<GroupByMenu>`** na toolbar (ao lado do `<SortMenu>`). Default **"Nenhum"** (lista plana). Estado persiste por lista via `useGroupBy('chave')` (localStorage). Primitivos em `components/ui/table-tools.tsx` + `lib/table-utils.ts`: `<GroupByMenu options value onChange />`, `useGroupBy(storageKey)`, `type GroupByOption<T>`, `groupRows(rows, option)`, `<GroupHeaderRow label count collapsed onToggle colSpan selectAll? />`.

---

## 4. Outros

- Badges de status: `<Badge>` / `<ScoreBadge>`. Menu de ações de linha: `<RowActions>` / `<MoreMenu>`. `MoreMenu` aceita `trigger` opcional (render prop `{ open, toggle }`) para abrir o menu a partir de qualquer botão em vez do kebab.
- Chip de condição de filtro: `<FilterChip>` — `onEdit`/`onRemove` opcionais; sem `onRemove` vira chip **somente leitura**.
- KPIs: `<KpiCard>`. Avatar: `<Avatar>` / `<EditableAvatar>`.
- Ícones: **só** de `components/ui/icons.tsx`. Não importar lib de ícone nova sem decisão.
- Botão só-ícone (ex.: excluir com lixeira) **exige** `<Tooltip label="...">` e `aria-label` — nunca ícone sem rótulo acessível.
- Editor de texto rico: `<RichContentArea>`/`<FormattingToolbar>` (`formatting-toolbar.tsx`).
- Notas/atividades com menção `@usuário`: `<ActivityComposer>` + `<ActivityFeed>` (`activity-composer.tsx`, `activity-feed.tsx`) + `useMentionableUsers` — exemplo de referência de como implementar menções, anexos e histórico timeline.
- Chat de IA: `<AiChat>`/`<AiPrompt>` — segue o padrão de IA do [DESIGN.md](./DESIGN.md) §8.

---

## 5. Convenções de arquivo

- **Nomes de arquivo em kebab-case**: `sow-list-page.tsx`, `sow-wizard.tsx` — **não** PascalCase (`SowListPage.tsx`). O conteúdo (componente) é PascalCase; o arquivo é kebab.
- Estrutura de feature (no produto consumidor): `features/<x>/{pages,components,hooks,services,types}`.

---

## 6. Guard rail (anti-regressão) — obrigatório no CI/precommit

Regra de lint (ESLint `no-restricted-syntax`, já configurada em `eslint.config.js` deste repo) que **falha o build** quando encontrar, em `src/features/**` e `src/components/**` (exceto `components/ui/**`):

- `className` contendo as classes-fantasma `input`, `field-label`, `field-error`.
- `<select`, `<textarea` crus (forçar `Select`/`Combobox`/`Textarea`); `<input>` cru gera warning.
- Nome de arquivo em PascalCase dentro de `features/`.

Rode `npm run lint` antes de qualquer commit/PR — resultado deve ser 0 erros.

---

*Fonte da verdade de UI. Em conflito, este doc + [DESIGN.md](./DESIGN.md) + `tokens.css` prevalecem sobre o que a feature do produto consumidor inventar.*
