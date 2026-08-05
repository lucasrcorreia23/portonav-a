<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Design system

Este projeto adota a direção visual do **Atomsix Design System** (`atom6development/atomsix-design-system`). Fonte de verdade de UI, nesta ordem de precedência em caso de conflito:

1. `docs/design-system/UI-PRIMITIVES.md` — inventário de primitivos, anatomia exata de trigger/popover/tabela.
2. `docs/design-system/DESIGN.md` — direção visual (cor, tipografia, densidade, raio, foco, layout).
3. Tokens em `app/globals.css`.

Regras que se mantêm específicas deste produto (não vêm do design system):

- Nomes de prop dos primitivos de `components/ui/` continuam em português (`variante`, `tamanho`, etc.) para consistência com o resto do código.
- A jornada de operador (`OperatorShell`, `/entrada`, QR-entry, checklist) mantém alvo de toque mínimo de 48px (`--size-touch-min`) em vez da densidade de 40px usada no resto do app — uso em pátio/externo, possivelmente com luvas.
- A taxonomia de status do equipamento (`components/status/statusTaxonomy.ts`) é uma camada de tokens de domínio por cima do core do design system — nunca comunicar status só por cor, sempre ícone + texto + cor.
- Marca/logo é a da Portonave, não a do Atomsix/Carbon CRM.
