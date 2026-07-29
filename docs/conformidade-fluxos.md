# Conformidade do protótipo com `portonave.pdf` (Projeto A)

Matriz de rastreabilidade nó a nó entre o diagrama de fluxo do cliente (`portonave.pdf`,
raias A1/A2/A3) e a implementação neste repositório. Cada linha aponta para a evidência
em código (`arquivo:linha`) e para o roteiro de navegador que a exercita (ver seção
"Roteiros de verificação" no fim deste documento).

Legenda de veredito: ✅ Atende · ⚠️ Atendia parcialmente (corrigido nesta rodada) · 🆕 Implementado nesta rodada (não existia) · 🔀 Decisão do cliente aplicada (nó "?" do diagrama).

## Decisões do diagrama originalmente em aberto ("?")

| Nó do diagrama | Decisão aplicada | Como foi implementada |
|---|---|---|
| A1 — "Habilitação fica em qual sistema" | **No portal — sistema apenas lê** | `possuiHabilitacaoValida()` continua somente leitura (`lib/data/local/operadores.ts`); UI em `/admin/operadores/[operadorId]` passa a rotular a origem explicitamente. |
| A3 — "Quem pode liberar" | **Supervisor aprova o reparo** | `REGRA_LIBERACAO_PADRAO` restrita a `supervisor`/`admin` (`lib/data/regras.ts`); a checagem passa a valer também na camada de dados (`liberarChamado()`); aprovação vira uma tela do lado do supervisor (`/supervisor/liberacoes`), já que `/manutencao/*` força o perfil `manutencao`. |

## A1 — Cadastros e regras

| # | Nó do diagrama | Evidência em código | Roteiro | Veredito |
|---|---|---|---|---|
| A1.1 | Cadastro do equipamento com tag e QR | `lib/data/repository.ts` (`EquipamentosRepositorio.criar`), `lib/data/local/equipamentos.ts`, `app/admin/equipamentos/novo/page.tsx`, QR em `components/equipamento/QRDisplay.tsx` | R1 | 🆕 |
| A1.2 | Modelo de checklist por tipo de operação | `lib/types/equipamento.ts` (`TipoOperacao`), `lib/types/checklist.ts` (`tipoOperacaoAlvo`), `components/checklist/ChecklistModelBuilder.tsx` | R1 | 🆕 |
| A1.3 | Cada item recebe um modo de tratamento | `lib/types/checklist.ts:6,14`, `components/checklist/ChecklistModelBuilder.tsx` (toggle bloqueia/alerta) | R1 | ✅ |
| A1.4 | Modo alerta — libera e registra apontamento | `lib/data/checklist-logica.ts` (`calcularResultadoChecklist`), `lib/data/local/checklists.ts` (geração de apontamento) | R3 | ✅ |
| A1.5 | Modo bloqueia — impede o uso | `lib/data/checklist-logica.ts`, `lib/data/local/checklists.ts` (bloqueio automático do equipamento) | R3 | ✅ |
| A1.6 | Portal Portonav | `app/admin/layout.tsx`, `app/admin/page.tsx` (shell renomeado) | R1 | ⚠️ |
| A1.7 | Sincroniza pessoas por SSO ou API | `lib/types/operador.ts` (`SincronizacaoPortal`), `lib/data/local/operadores.ts`, `app/admin/operadores/page.tsx` | R1 | ⚠️ |
| A1.8 | Habilitação fica em qual sistema? (decisão) | ver tabela de decisões acima | R1 | 🔀 |
| A1.8a | No portal → Sistema apenas lê a habilitação | `lib/data/local/operadores.ts` (`possuiHabilitacaoValida`, somente leitura), `app/admin/operadores/[operadorId]/page.tsx` | R1 | ✅ |
| A1.9 | Cadastro de habilitação por tipo de equipamento | `lib/types/operador.ts` (`Habilitacao`) — modelo existe, escrita fica fora do app (ramo "Aqui" fora de escopo pela decisão acima) | R1 | 🔀 (fora de escopo) |

## A2 — Uso do equipamento

| # | Nó do diagrama | Evidência em código | Roteiro | Veredito |
|---|---|---|---|---|
| A2.1 | Operador lê o QR no equipamento | `components/qr-entry/ScanFakeCamera.tsx`, `app/entrada/page.tsx` (câmera simulada) | R2 | ✅ (simulado) |
| A2.2 | Aplicativo com conexão? | `lib/types/demo.ts` (`EstadoDemo.offline`), `components/demo/OfflineToggle.tsx` | R4 | ✅ (simulado) |
| A2.3 | Consulta o status atual (online) | `components/equipamento/OrigemStatusNota.tsx`, integrado a `FluxoOperador.tsx` | R4 | 🆕 |
| A2.4 | Usa o último status conhecido e sincroniza depois (offline) | `components/equipamento/OrigemStatusNota.tsx`, `lib/data/local/sync.ts` (`enfileirarSeOffline`) | R4 | 🆕 |
| A2.5 | Equipamento liberado? | `components/equipamento/FluxoOperador.tsx` (ramos por `status`) | R2/R3 | ✅ |
| A2.6 | Uso negado com motivo e responsável | `components/equipamento/FluxoOperador.tsx` (bloqueio: motivo + responsável; habilitação: idem após ajuste) | R2 | ⚠️ |
| A2.7 | Preenche o checklist | `app/equipamento/[tag]/checklist/[secaoOrdem]/page.tsx`, `app/equipamento/[tag]/checklist/draft-context.tsx` | R3 | ✅ |
| A2.8 | Resultado — sem reprovação / alerta / bloqueia | `lib/data/checklist-logica.ts` (`calcularResultadoChecklist`) | R3 | ✅ |
| A2.9 | Libera e gera apontamento (alerta) | `lib/data/local/checklists.ts:116-169` | R3 | ✅ |
| A2.10 | Equipamento bloqueado — segue para A3 (bloqueia) | `lib/data/local/checklists.ts:171-189` | R3 | ✅ |
| A2.11 | Abre sessão de operação | `lib/data/local/checklists.ts:191-215`, `app/equipamento/[tag]/sessao/page.tsx` | R3 | ✅ |
| A2.12 | Encerra sessão e grava o histórico | `lib/data/local/sessoes.ts` (`encerrar`) | R3 | ✅ |

## A3 — Falha, manutenção e retorno

| # | Nó do diagrama | Evidência em código | Roteiro | Veredito |
|---|---|---|---|---|
| A3.1 | Item em status bloqueado foi reprovado | `lib/data/checklist-logica.ts` | R3 | ✅ |
| A3.2 | Equipamento marcado como avariado | `status: "bloqueado"` rotulado "Avariado" — `components/status/statusTaxonomy.ts:52-57` | R3 | ✅ |
| A3.3 | Bloqueio visível no QR e no painel do supervisor | `components/equipamento/FluxoOperador.tsx` / `FichaGestao.tsx` / `FichaAdmin.tsx`, `app/supervisor/page.tsx` | R5 | ⚠️ |
| A3.4 | Chamado aberto para a manutenção | `lib/data/local/checklists.ts:145-169` (automático) | R3 | ✅ |
| A3.5 | Manutenção registra o reparo | `components/chamados/RegistrarReparoForm.tsx`, `lib/data/local/manutencao.ts` (`registrarReparo`) | R5 | ✅ |
| A3.6 | Quem pode liberar? (decisão) | ver tabela de decisões acima | R5 | 🔀 |
| A3.6a | Reparo aguarda aprovação (supervisor) | `app/supervisor/liberacoes/page.tsx`, `lib/data/regras.ts` | R5 | 🆕 |
| A3.6b | Libera direto (manutenção) — fora de escopo pela decisão | — | — | 🔀 (fora de escopo) |
| A3.7 | Data de liberação | `lib/types/chamado.ts` (`LiberacaoEquipamento.liberadoEm`), `app/supervisor/liberacoes/page.tsx` | R5 | ✅ |
| A3.8 | Status volta para disponível | `lib/data/local/manutencao.ts` (`liberarChamado`) | R5 | ✅ |
| A3.9 | Histórico e indicadores de falha recorrente | `lib/data/local/historico.ts`, `app/supervisor/relatorios/falhas-recorrentes/page.tsx` (agregação por equipamento×item) | R5 | ⚠️ |

## Roteiros de verificação (navegador) — executados

Todos os 5 roteiros foram executados de ponta a ponta no Chrome (`npm run dev`), a partir do seed regenerado (`SEED_VERSION = 2`). Resultado: **todas as linhas acima confirmadas** — nenhum veredito pendente.

- **R1 (A1)** — Cadastrei `EMP-05` (empilhadeira / carga geral) por `/admin/equipamentos/novo`: tag, QR (SVG) e checklist padrão resolvidos automaticamente e evento gravado no histórico. Criei o modelo "Pré-operação — empilhadeira em contêineres" (`/admin/checklists/novo`) com escopo tipo+operação e um item em cada modo de tratamento. Conferi `/admin/regras` (modos de tratamento e regra de liberação) e `/admin/operadores` (sincronização nomeada "via SSO/API", habilitação somente leitura com aviso "Válida até 03/08/2026" na operadora com certificado vencendo em 5 dias).
- **R2 (A2, ramo negado)** — `EMP-03` (bloqueado no seed): "Uso negado" com motivo ("Buzina inoperante...") e responsável ("Bloqueado por Sistema... em 28/07/2026, 20:03"). Com a operadora Juliana (sem habilitação para reach stacker) em `RS-01`: "Uso negado" citando explicitamente a habilitação ausente + nota de que a regularização é responsabilidade do supervisor junto ao portal.
- **R3 (A2, três ramos do resultado)** — `EMP-01` aprovado integralmente → "Equipamento liberado" → sessão aberta → encerrada e registrada no histórico. `EMP-02` com dois itens em modo alerta reprovados (incluindo foto+observação obrigatórias) → "Liberado com apontamento" + chamado não crítico aberto, sessão permanece disponível. `EMP-04` com a Buzina (modo bloqueia) reprovada → "Bloqueado", sem sessão, chamado de prioridade alta aberto automaticamente.
- **R4 (A2, offline)** — Liguei o modo offline: nota "Último status conhecido (…) — sincroniza automaticamente ao reconectar" na ficha do operador; preenchi o checklist de `EMP-05` normalmente, com o contador "1 pendente de sincronização" na faixa offline e o aviso "Calculado com base no último status conhecido (offline)" na tela de resultado. Ao desligar o offline, a sincronização ocorreu automaticamente (faixa e contador somem sem ação adicional).
- **R5 (A3, ciclo fechado)** — Painel do supervisor listou os 3 equipamentos bloqueados/em manutenção (incluindo `TP-01`, que antes não aparecia). Movi o chamado de `EMP-04` para "Em atendimento" — o equipamento passou a `em_manutencao` automaticamente e continuou visível ao supervisor. Registrei o reparo: a tela de manutenção passou a mostrar apenas "Aguardando aprovação do supervisor" (sem botão de liberar). Em `/supervisor/liberacoes`, aprovei com observação — `EMP-04` voltou a "Disponível", o histórico gravou a cadeia completa (bloqueio → apontamento → chamado → em atendimento → reparo → liberação), e `/supervisor/relatorios/falhas-recorrentes` mostrou a tabela "Falha recorrente por equipamento" (`RS-01`/Câmeras e monitores 2×, `RS-02`/Vazamentos visíveis 2×) — também refletida como card na ficha desses equipamentos. Avancei o tempo em +7 dias e o gráfico de disponibilidade reagiu à nova janela.

## Observações fora do escopo do PDF (achadas durante a verificação)

- **Corrigido nesta rodada**: a pílula fixa "Modo demonstração" (`components/demo/DemoControlBar.tsx`, `fixed bottom-4 right-4`) sobrepunha o botão de ação principal em formulários curtos (ex.: "Salvar modelo" em `/admin/checklists/novo`), tornando-o inclicável. Corrigido com `pb-24` em `AdminShell`/`OperatorShell` para abrir espaço de proteção — não é uma lacuna do PDF, mas bloqueava a verificação de R1.
- **Não corrigido (fora do escopo L1–L11)**: ao reprovar um item em modo bloqueia, existe uma corrida entre o redirect programático para `/equipamento/[tag]/resultado` (em `draft-context.tsx`) e o guard de `app/equipamento/[tag]/checklist/layout.tsx` (que redireciona para a ficha assim que `podeIniciar` vira falso). Na prática o guard costuma vencer, e o operador vê a ficha com "Uso negado" diretamente, pulando a tela de resultado com a lista de itens reprovados. O equipamento fica bloqueado e o chamado é aberto corretamente — o efeito é só a tela intermediária ser pulada. Vale uma investigação e correção à parte.
