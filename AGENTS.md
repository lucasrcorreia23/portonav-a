<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Design system

Este projeto adota a direção visual do **Atomsix Design System** (`atom6development/atomsix-design-system`). Fonte de verdade de UI, nesta ordem de precedência em caso de conflito:

0. **Figma `IPM03 — Sistema de Checklist (internal)`** (`fileKey QxSouvVyYPnkSIU3XSdXq8`) — fonte de verdade da **jornada do operador**. Onde ele especifica algo, ele ganha dos documentos abaixo. Ler o node com `get_design_context` antes de mexer nessas telas; não implementar de memória.
1. `docs/design-system/UI-PRIMITIVES.md` — inventário de primitivos, anatomia exata de trigger/popover/tabela.
2. `docs/design-system/DESIGN.md` — direção visual (cor, tipografia, densidade, raio, foco, layout).
3. Tokens em `app/globals.css`.

Nodes já implementados (usar como referência de padrão para as telas seguintes do fluxo):

| Node | Tela | Padrões que ela fixa |
| --- | --- | --- |
| `4113:550` | Home do operador | cabeçalho em pílula, títulos de seção, card de tarefa, lista de verificações |
| `4119:2536` | Seção do checklist | stepper, barra de progresso, card de item, botões OK / Com falha, rodapé |
| `4174:6993` | Devolver — leitura do QR | `OperatorPageHeader` (voltar + título), visor de câmera só com cantos, status como ícone sobre texto sem pílula |
| `4114:1134` | Nova solicitação (folha) | `Drawer navegacao="voltar"` — o `×` dá lugar ao `BackButton` à esquerda do título |

Regras que se mantêm específicas deste produto (não vêm do design system):

- Nomes de prop dos primitivos de `components/ui/` continuam em português (`variante`, `tamanho`, etc.) para consistência com o resto do código.
- A jornada de operador (`OperatorShell`, `/entrada`, QR-entry, checklist) usa alvos de toque maiores que a densidade desktop: **56px** (`tamanho="touch"`) nas ações principais e nos botões OK / Com falha. `--size-touch-min` (48px) continua sendo o piso para alvos livres, mas **não é um mínimo universal** — o Figma especifica 44px no sino do cabeçalho e 40px nos botões secundários dentro de card, e o Figma manda.
- A taxonomia de status do equipamento (`components/status/statusTaxonomy.ts`) é uma camada de tokens de domínio por cima do core do design system — nunca comunicar status só por cor, sempre ícone + texto + cor. Em repouso, um par de escolha (OK / Com falha) é **neutro**: a cor de status só entra na opção escolhida.
- Chip/badge é **sempre pílula** (`rounded-pill`), em `Badge` e em `StatusBadge` — exceção deliberada à precedência do Figma acima, que desenha o selo de status com 4px. Decisão do dono do produto. Não "corrigir" copiando a prancha.
- Sombra continua desligada no produto inteiro, com **uma** exceção: `--shadow-card-operador` (1px a 4%) nos cards da jornada do operador, conforme o Figma. Não é elevação — é o fio que separa o card do fundo branco. Não usar fora dessa jornada.
- Averta self-hosted **não tem peso 500**: `font-medium` cai num peso sintetizado pelo navegador. Em título de seção e rótulo, usar `font-bold` (700) ou `font-semibold` (600).
- Marca/logo é o wordmark **TiL** (`components/brand/LogoTil.tsx`), conforme a prancha `Operador Flow.pdf` aprovada — não a do Atomsix/Carbon CRM. Portonave continua sendo o cliente-alvo do protótipo, mas não aparece como marca na interface.
- **Degradê é exclusivo da IA** (`variante="ia"`) — exceção deliberada à precedência do Figma acima. As pranchas mostram primários com o degradê da marca ("Nova solicitação", "Iniciar"); no produto eles são pretos sólidos (`variante="primary"`). Decisão do dono do produto: o degradê é o que marca "isto é IA", e usá-lo em primário comum apagaria essa leitura. Não "corrigir" copiando a prancha.
- Navegação de volta: sempre o `BackButton` (círculo com borda, 44px, `ArrowLeft` 20px) — no cabeçalho de tela via `OperatorPageHeader`, no de folha via `Drawer navegacao="voltar"`. Só nas telas em que a prancha o mostra; a home e a lista de solicitações não têm.
- A **IA não usa loader** — nem o anel girando do DESIGN.md §8, nem spinner, nem skeleton. Enquanto gera, o botão de IA só troca de estado para "Pensando…", e o único movimento é o véu (`.ia-veu`, `--gradient-brand-veu`): o degradê da marca em baixa opacidade varrendo **a foto e o campo de texto** — as superfícies que a IA está trabalhando. O botão não varre: ele recua para não disputar com elas.
