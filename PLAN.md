# PLAN.md — Protótipo de demonstração: Checklist de Pré-Operação (Portonave)

## Contexto

O cliente-alvo (Portonave, terminal portuário em Navegantes/SC) precisa ver, em ~10 minutos de navegação, um protótipo convincente de um sistema que digitaliza o checklist de pré-operação de equipamentos (empilhadeiras, reach stackers, transpaleteiras), bloqueia equipamento com falha crítica, aciona manutenção automaticamente e mantém histórico completo. É uma peça de venda, não um MVP: o critério de sucesso é "uma pessoa da Portonave navega sozinha e entende o produto", não robustez de backend. Não há login, banco ou API — tudo roda em memória + `localStorage`, com uma camada de dados isolada para que uma troca por API real no futuro seja substituição de implementação, não reescrita.

Este documento cobre a fundação completa (tipos de domínio, camada de dados, seed determinístico, sistema de design a partir da identidade visual real da Portonave, mapa de rotas das três jornadas, mecânicas de antifraude/offline) e a ordem de implementação até a entrega.

Ver `docs/conformidade-fluxos.md` para a matriz de rastreabilidade entre este protótipo e o diagrama de fluxo de negócio do cliente ("Projeto A", raias A1/A2/A3) — inclui as decisões tomadas para os dois pontos que o diagrama deixava em aberto (onde vive a habilitação; quem pode liberar um equipamento após reparo).

---

## O que já existe no repositório (não reconfigurar)

- Next.js 16.2.12, App Router (`app/`, sem `src/`), React 19.2.4, TypeScript 5.9.3 (`strict: true`), Tailwind CSS 4.3.3 (config CSS-first — **sem** `tailwind.config.*`, tokens vivem em `app/globals.css` via `@theme inline`), ESLint 9 flat config (`eslint-config-next`, já traz `eslint-plugin-jsx-a11y`).
- npm (`package-lock.json`), alias `@/*` → raiz do projeto.
- `app/layout.tsx`, `app/page.tsx`, `app/globals.css` são boilerplate puro do `create-next-app` (fontes Geist, página padrão) — serão substituídos, não hackeados em volta.
- `AGENTS.md`/`CLAUDE.md` avisam que este Next.js 16 pode divergir de convenções mais antigas. Pontos confirmados em `node_modules/next/dist/docs/01-app/` que orientam este plano:
  - `params`/`searchParams` são `Promise` em Server e Client Components (`use(params)` no client) — vale para toda rota dinâmica.
  - `redirect()`/`notFound()` só funcionam durante o render, nunca em handler de clique — como quase toda transição aqui nasce de clique/submit, **`useRouter().push()` é o mecanismo de navegação padrão**; `notFound()` fica só para o caso de tag inexistente acessada direto por URL.
  - `cacheComponents` (feature nova/opt-in do Next 16) **não será habilitada**: este app não busca dados de servidor real, é quase todo Client Component por causa de `localStorage`/interatividade, e ligar isso só adicionaria exigência de `<Suspense>` em runtime APIs sem ganho.
- Nenhuma dependência além do scaffold está instalada — campo livre para as adições descritas abaixo.

---

## Identidade visual (extraída de portonave.com.br, valores reais)

O site institucional também é construído com Next.js + Tailwind; seu CSS compilado foi baixado e inspecionado diretamente (não adivinhado):

- **Vermelho da marca**: `#DD1337` (classe `primary-portonave` no site) — cor dominante de CTA/interação.
- **Escala neutra**: 50 `#F2F2F2`, 100 `#E2E2E2`, 300 `#B5B5B5`, 400 `#888888`, 700 `#5A5A5A`, 800 `#2D2D2D`.
- **Acento suave**: `aqua` `#B9E8DF`, uso decorativo pontual.
- **Tipografia**: corpo em **Kumbh Sans** (Google Font real); títulos em **"Margem"**, fonte licenciada/local, indisponível para nós (o próprio fallback do site aponta `ui-serif`, ou seja, tem caráter editorial, não é uma grotesca genérica). Títulos renderizam em `font-weight: 500`, `line-height: 110%`.
- **Forma**: nada de cantos retos — o site usa toda a escala de arredondamento do Tailwind (4px a 16px, mais `rounded-full`). Sombras suaves, baixa opacidade (~8–10% preto), com uma sombra difusa bem suave reservada para elementos hero.

### Adaptação para uso operacional (exigência explícita do cliente)

Telas de operador (pátio, mobile) precisam de alto contraste, toques ≥48px, e status **sempre** cor + ícone + texto (há daltônicos no pátio). Telas administrativas são densas/desktop. O vermelho da marca convenientemente já lê como "perigo/bloqueado" — reaproveitado para o status `avariado`.

### Tokens em `app/globals.css` (via `@theme inline`, nunca hex direto em componente)

```css
--color-brand-50..900      /* rampa autorada em volta do #DD1337 extraído (500) */
--color-neutral-50..950     /* 50/100/300/400/700/800 extraídos; resto interpolado; 900 = #171717 */
--color-aqua / --color-aqua-ink

--color-status-disponivel        #1E7A46   /* 5.38:1 em branco */
--color-status-em-uso            #0B5FA5   /* 6.58:1 */
--color-status-apontamento       #92400E   /* 7.09:1 */
--color-status-avariado          #DD1337   /* 4.97:1 — vermelho da marca, não usar mais escuro */
--color-status-manutencao        #6D28D9   /* 7.10:1 */
--color-focus-ring: var(--color-status-em-uso)   /* azul, nunca o vermelho de perigo */
--shadow-elevated: 27px 19.5px 150px rgba(0,0,0,.07)   /* extraído do site, uso raro/hero */
--radius-control / --radius-card / --radius-card-hero / --radius-pill
```

Todas as 5 cores de status foram auditadas contra AA (texto normal em branco) — todas passam. Achado importante: `neutral-400 (#888888)`, apesar de extraído de verdade, falha AA para texto normal (3.55:1) — reservado para ícones/texto grande/estados desabilitados, nunca texto secundário real.

### Fontes (`next/font/google`, mesmo padrão do scaffold atual — só troca de família)

- Corpo: `Kumbh_Sans` (peso variável, real, igual ao site institucional).
- Títulos: substituto para "Margem" — **`Fraunces`** (serifada suave, peso 500 disponível, caráter editorial compatível com o fallback `ui-serif` observado no site).
- Dark mode do scaffold (`prefers-color-scheme`) removido — um app operacional de segurança não deveria mudar de aparência com o SO do apresentador durante a demo.

---

## Estrutura de pastas

```
lib/
  types/                    # ÚNICO lugar de tipos de domínio
    common.ts equipamento.ts checklist.ts operador.ts operacao.ts
    apontamento.ts chamado.ts historico.ts sync.ts demo.ts index.ts
  data/                      # camada ISOLADA — nenhum componente acessa seed/mock direto
    store.ts                # motor: estado em memória + localStorage, sem import de React
    repository.ts           # interfaces (contratos) — o que os componentes de fato importam
    local/                  # única implementação hoje (equipamentos, checklists, operadores,
                             #   manutencao, sessoes, historico, sync) — troca futura por API real
                             #   vira lib/data/remote/*, sem tocar em nenhum componente
    seed/                   # rng.ts (PRNG seeded, mulberry32), seed-*.ts por entidade, seed.ts (orquestra)
    context.tsx             # 'use client' — ponte única store↔React via useSyncExternalStore

components/
  ui/          # primitivos puros sobre tokens (Button, Card, Badge, ProgressBar, Stepper, Input,
               #   DataTable, Modal, Tabs, Timeline...) — zero import de lib/data
  status/statusTaxonomy.ts   # fonte única: status → {label, cor, ícone, descrição}
  layout/      # OperatorShell (mobile, espaçado) vs AdminShell (desktop, denso) + PageHeader
  demo/        # DemoControlBar, ProfileSwitcher, OfflineToggle, ResetButton, TimeAdvanceControl,
               #   OfflineIndicator, SyncQueueIndicator — visualmente distinto do produto real
  equipamento/ checklist/ operador/ chamados/ supervisor/ qr-entry/   # componentes por domínio

app/
  layout.tsx page.tsx not-found.tsx globals.css
  entrada/page.tsx                       # câmera fake | próximos | digitar tag
  equipamento/[tag]/
    page.tsx                             # PORTA ÚNICA: mesma rota p/ todo perfil, conteúdo ramifica
                                          #   por perfil ativo (operador/supervisor/manutencao/admin)
    not-found.tsx
    checklist/page.tsx  checklist/[secaoOrdem]/page.tsx
    resultado/page.tsx  sessao/page.tsx
  operador/page.tsx
  supervisor/
    layout.tsx page.tsx checklists-suspeitos/page.tsx
    relatorios/{page,falhas-recorrentes,disponibilidade,aderencia-checklist,confiabilidade-operadores}
  manutencao/layout.tsx page.tsx chamados/[id]/page.tsx
  admin/
    layout.tsx page.tsx
    equipamentos/{page,novo/page}
    checklists/{page,novo/page,[modeloId]/page}
    operadores/{page,[operadorId]/page}
```

**Por quê**: `lib/types/` satisfaz literalmente "tipos de domínio em um único lugar"; `lib/data/` satisfaz literalmente "camada de dados isolada"; o padrão repository (`repository.ts` só com interfaces, `local/` como única implementação) é o que torna "trocar por API real depois é substituição de implementação" verdadeiro, não só uma frase. `components/ui/` fica agnóstico de domínio (permite reuso real entre densidade operador/admin via props de tamanho). A rota `/equipamento/[tag]` única para todos os perfis é a implementação literal do diferencial "QR como porta única — o que muda é o que a pessoa vê, conforme o perfil".

---

## Modelo de dados (resumo — tipos completos em `lib/types/`)

Entidades centrais e o ciclo fechado que elas implementam (reprovação → apontamento → chamado → liberação → histórico):

- **Equipamento**: tag, tipo (`empilhadeira|reach_stacker|transpaleteira`), `tipoOperacao` (`carga_geral|conteineres|graneis|armazem` — classificação operacional, distinta de `tipo`), localização, `status` (`disponivel|em_uso|bloqueado|em_manutencao`), `bloqueio: {motivo, bloqueadoPor, bloqueadoEm, apontamentoId} | null`, `chamadoAtivoId`, `modeloChecklistIdPadrao`.
- **ModeloChecklist**: seções → itens; cada item tem `tipoResposta` (`ok_nao_ok|numerico|texto`), `modoTratamento` (`bloqueia|alerta`), `exigeFotoAoReprovar`, `exigeObservacaoAoReprovar`; o modelo é escopado por `tipoEquipamentoAlvo` **e** `tipoOperacaoAlvo`, resolvidos com precedência tipo+operação > tipo > universal (`resolverModeloChecklistPadrao` em `lib/data/checklist-logica.ts`).
- **ChecklistPreenchido** (registro central de antifraude): `ordemItensEmbaralhada` + `seedEmbaralhamento` (auditável), `duracaoPorSecaoSegundos`, `resultado` (`liberado|liberado_com_apontamento|bloqueado`), `suspeito` + `motivosSuspeita[]` tipados (tempo mínimo não atingido, preenchimento recorde, padrão idêntico ao histórico).
- **Apontamento** → **ChamadoManutencao** (`aberto|em_atendimento|aguardando_liberacao|concluido`, com `registroReparo` e `liberacao` restrita a `supervisor`/`admin` — `lib/data/regras.ts`) → **HistoricoEvento** (linha do tempo por equipamento).
- **Operador**: habilitações por tipo de equipamento, `scoreConfiabilidade`, `SincronizacaoPortal` mockada.
- **SessaoOperacao**, **SyncQueueItem** (fila offline), **EstadoDemo** (`perfilAtivo`, `offline`, `deslocamentoTempoMs` — "agora" = `Date.now() + deslocamentoTempoMs`, nunca reescreve timestamps existentes).

Todo apontamento (crítico ou não) vira chamado automaticamente — leitura literal de "item reprovado vira apontamento, que vira chamado"; prioridade no quadro varia por criticidade.

### Camada `lib/data/` — mecânica

- `store.ts`: singleton em módulo; `getStore()` carrega de `localStorage` ou gera seed; `mutar(receita)` aplica mudança + persiste + notifica listeners; `resetar()` regenera o seed inteiro.
- `context.tsx`: ponte React via **`useSyncExternalStore`** (não `useState`+`useEffect`) — resolve SSR/hidratação nativamente: `getServerSnapshot` devolve sempre o mesmo objeto de seed em memória (recriar esse objeto a cada chamada causa loop de re-render).
- **Offline**: escrita é aplicada otimisticamente ao estado local **e** enfileirada em `filaSincronizacao` — nunca "segura" esperando rede, porque "uso negado ali mesmo" e "checklist offline com último status conhecido" exigem que o aparelho já saiba o resultado na hora. `sincronizar()` marca pendentes como sincronizados e grava o evento com horário exato. Escopo: só as escritas da jornada operador (pátio) passam pela fila — admin/supervisor/manutenção são ferramentas de escritório sempre online.
- **Seed determinístico**: PRNG próprio (`mulberry32`, seed fixo `20260101`), zero `Math.random()`/`Date.now()` na estrutura (contagens, nomes, distribuição de suspeitas). A data-base da janela de histórico sintético (45 dias) é ancorada em "agora do primeiro load/reset" — o histórico sempre parece recente numa demo ao vivo, mas fica congelado em `localStorage` até um reset explícito.
- Conteúdo obrigatório do seed: 8 equipamentos (1 bloqueado por buzina com chamado aberto, 1 com apontamento não crítico ativo, 1 em manutenção aguardando peça, 5 disponíveis); 12 operadores (≥1 sem habilitação para algum tipo, 1 com score baixo (~42) e 2–3 checklists suspeitos já no histórico); 3 modelos de checklist (empilhadeira, EPI `tipoEquipamentoAlvo: 'todos'`, reach stacker).

---

## Dependências novas a instalar

- `qrcode` — gera SVG real (vetorial, imprime nítido), sem acoplamento a React. QR codifica a URL absoluta `${origin}/equipamento/${tag}` calculada no cliente.
- `lucide-react` — apenas ícones (tree-shakeable), não é uma biblioteca de componentes; usado por `StatusBadge` e toda a UI para a regra "nunca só cor".
- Gráficos dos relatórios: hand-rolled SVG (`components/charts/`), sem lib de charts.
- Kanban de chamados: sem drag-and-drop (ações explícitas "Mover para →" por acessibilidade/teclado).

---

## Mecânicas de antifraude e offline na UI (o argumento de venda)

- **Ordem embaralhada**: shuffle determinístico por sessão de preenchimento, com aviso discreto na tela.
- **Tempo mínimo por seção**: "Confirmar seção" com affordance de preenchimento até um limiar; envio abaixo do mínimo marca `suspeito` com motivo e tempo medido.
- **Foto + timestamp obrigatórios ao reprovar item crítico**: `PhotoCapture` usa `<input capture="environment">` real **e** um fallback "usar foto de exemplo" para demo sem câmera; overlay de data/hora renderizado sobre a miniatura.
- **Score de confiabilidade** visível no painel do supervisor e na ficha do operador.
- **"Checklists em revisão"**: tabela dedicada no painel do supervisor, motivo + tempo vs. mínimo + score do operador + replay do checklist completo.
- **Offline**: indicador persistente no layout raiz — discreto quando online, faixa cheia quando offline; contador de pendentes na fila; ao reconectar, "Sincronizando…" seguido de toast explícito com o horário.
- **Barra de controles de demo**: visualmente distinta do produto, sempre acessível como uma pílula recolhida no mínimo; troca de perfil, toggle offline, reset com confirmação, avançar tempo.

---

## Ordem de implementação (commits)

1. **`feat: tipos de domínio, camada de dados e seed determinístico`** — `lib/types/*`, `lib/data/*` completos.
2. **`feat: design system e shell (tokens, componentes ui, layout raiz, controles de demo)`** — `app/globals.css`, `app/layout.tsx`, `components/ui/*`, `components/demo/*`, `components/status/statusTaxonomy.ts`.
3. **`feat(admin): cadastros de equipamentos, modelos de checklist e operadores + QR`** — árvore `/admin/*`.
4. **`feat(operador): entrada por QR, checklist, resultado, sessão e modo offline`** — `/entrada`, `/equipamento/[tag]` (ramo operador), checklist por seção, 3 telas de resultado, sessão aberta, fila de sincronização.
5. **`feat(supervisor-manutencao): painel, chamados, relatórios + README e roteiro de demo`** — `/supervisor/*`, `/manutencao/*`, `README.md` com roteiro de demonstração de 10 minutos.

---

## Decisões assumidas

- Fonte de títulos: **Fraunces** no lugar de "Margem" (licenciada/indisponível).
- Dark mode do scaffold removido.
- Rota de ficha de equipamento **unificada** (`/equipamento/[tag]`) para os 4 perfis.
- `tipoOperacao` do equipamento = classificação operacional (distinta do `tipo`, classe física da máquina) — renomeado de `categoria` para alinhar ao vocabulário do fluxo do cliente (ver `docs/conformidade-fluxos.md`).
- Todo apontamento (crítico ou não) abre chamado automaticamente.
- Fila de offline escopada só à jornada operador (pátio); admin/supervisor/manutenção sempre online.
- QR codifica URL absoluta calculada no cliente.
- Habilitação do operador é somente leitura no app, sincronizada do portal corporativo — cadastro/regularização não fazem parte deste protótipo.
- Liberação de equipamento após reparo exige aprovação de `supervisor` ou `admin` (`lib/data/regras.ts`) — manutenção registra o reparo mas não libera; a aprovação vive em `/supervisor/liberacoes`, não na tela do chamado.
- 5 commits (fundação → design system → admin → operador → supervisor/manutenção+docs) em vez de exatamente 3.

---

## Verificação

- `npm run build` sem erro nem warning de tipo após cada commit relevante.
- Navegar manualmente as três jornadas confirmando: nenhuma tela vazia/botão morto, troca de perfil sem login, toggle offline afetando o fluxo do operador, "avançar o tempo" mudando disponibilidade/vencimento visível, "resetar" restaurando o seed original.
- Contraste AA dos tokens de status nas telas reais.
- QR gerado na ficha do equipamento renderiza SVG válido.
- `README.md` final deve permitir que alguém sem contexto rode o projeto e siga o roteiro de 10 minutos sozinho.
