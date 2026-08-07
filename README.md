# Portonave — Protótipo de Checklist de Pré-Operação

Protótipo de demonstração (não é um MVP) de um sistema que digitaliza o checklist de
pré-operação de equipamentos portuários, bloqueia equipamento com falha crítica,
aciona manutenção automaticamente e mantém histórico de uso. Veja `PLAN.md` para o
detalhamento de arquitetura, modelo de dados e decisões de implementação, e
`docs/conformidade-fluxos.md` para a matriz de rastreabilidade entre este protótipo
e o fluxo de negócio do cliente (raias A1/A2/A3).

## Como rodar

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Não há login: use o painel
**"Modo demonstração"** (canto inferior direito, sempre visível) para trocar de
perfil, ligar/desligar o modo offline, avançar o tempo simulado ou resetar os dados
para o estado inicial.

`npm run build` gera o build de produção; `npm run lint` roda o ESLint.

## O que é mock

Não há backend, banco de dados ou autenticação real:

- Todos os dados vivem em memória e são persistidos em `localStorage` do navegador
  (`lib/data/store.ts`). Um "reset" nos controles de demo regenera o seed original.
- O seed inicial (`lib/data/seed/`) é determinístico (PRNG seedado, nunca
  `Math.random()`/`Date.now()` na estrutura) e gera 8 equipamentos, 12 operadores, 3
  modelos de checklist e ~45 dias de histórico sintético — sempre com a mesma
  narrativa (um equipamento bloqueado por buzina, um com apontamento não crítico
  ativo, um em manutenção aguardando peça, e um operador de baixa confiabilidade com
  checklists suspeitos).
- A "sincronização com o portal corporativo via SSO/API" (tela de operadores no
  admin) é simulada: um `setTimeout` e uma atualização de estado local, sem chamada
  de rede. Pessoas e habilitações são somente leitura no app — o cadastro vive no
  portal corporativo.
- Fotos de evidência (ao reprovar item crítico) podem ser uma foto real capturada
  pelo dispositivo ou uma imagem de exemplo gerada localmente (SVG), para quando a
  demonstração rodar num notebook sem câmera.
- A camada de dados é isolada em `lib/data/` atrás de interfaces (`repository.ts`) —
  trocar por uma API real no futuro é troca de implementação (`lib/data/local/` →
  `lib/data/remote/`), não reescrita das telas.

## Mapa de rotas

| Rota | Descrição |
|---|---|
| `/` | Seletor de jornada |
| `/entrada` | Entrada por QR (câmera simulada, lista de próximos, digitar tag) |
| `/operador` | Início da jornada do operador |
| `/equipamento/[tag]` | Ficha do equipamento — **porta única**: o conteúdo muda conforme o perfil ativo (admin vê a ficha completa; supervisor/manutenção veem status e chamado; operador vê o card de status, negações e o CTA para iniciar o checklist) |
| `/equipamento/[tag]/iniciar` | Retirada — leitura do QR antes da verificação de disponibilidade (só quem chega pelo card da tarefa; quem vem de `/entrada` já escaneou) |
| `/equipamento/[tag]/checklist/[secaoOrdem]` | Preenchimento do checklist, uma seção por vez |
| `/equipamento/[tag]/resultado` | Resultado: liberado / liberado com apontamento / bloqueado |
| `/equipamento/[tag]/sessao` | Devolução — releitura do QR, confirmação e conclusão da tarefa (a sessão registra a posse, não o tempo: não há cronômetro) |
| `/supervisor` | Painel do supervisor (bloqueados/em manutenção, apontamentos abertos, aguardando aprovação, disponibilidade) |
| `/supervisor/checklists-suspeitos` | Checklists marcados pelo sistema antifraude |
| `/supervisor/liberacoes` | Reparos registrados pela manutenção aguardando aprovação do supervisor (ou admin) para liberar o equipamento |
| `/supervisor/relatorios/*` | Falhas recorrentes (com reincidência por equipamento), disponibilidade, aderência por turno, ranking de confiabilidade |
| `/manutencao` | Quadro de chamados (aberto / em atendimento / aguardando liberação / concluído) |
| `/manutencao/chamados/[id]` | Detalhe do chamado — registrar reparo (a liberação é feita pelo supervisor em `/supervisor/liberacoes`) |
| `/admin` (Portal Portonav) | Cadastros e regras — equipamentos, modelos de checklist, operadores, regras |
| `/admin/equipamentos` / `/admin/equipamentos/novo` | Lista e cadastro de equipamentos (tag, tipo, tipo de operação — QR e checklist padrão gerados automaticamente) |
| `/admin/checklists` / `/admin/checklists/novo` / `/admin/checklists/[modeloId]` | Construtor de modelos de checklist, com escopo por tipo de equipamento e tipo de operação |
| `/admin/operadores` / `/admin/operadores/[operadorId]` | Lista e ficha de operadores (sincronizados via SSO/API do portal corporativo) — habilitações somente leitura, com aviso de vencimento |
| `/admin/regras` | Modos de tratamento do checklist e regra de liberação vigente (somente leitura) |

## Caminho feliz do operador (3 minutos)

O ciclo completo num perfil só, sem trocar para supervisor. Depende da chave
**"Aprovação automática"** (ligada por padrão nos controles de demo): com ela, a
solicitação do operador já nasce aprovada, assinada por Ana Beatriz Monteiro.

O operador padrão do seed é **Carlos Eduardo Silva (PN-4521)**, que já tem tarefas
aprovadas para EMP-01..04 e TP-01 — e `TarefaForm` esconde equipamento com solicitação
ativa. Para uma solicitação nova, use **`TP-02`** (transpaleteira, disponível, dentro das
habilitações dele). Para a empilhadeira do storyboard (`EMP-04`, checklist de 13 itens),
troque "Simulando como" para **Débora Cristina Ramos (PN-4530)**, que não tem tarefa de seed.

1. **`/operador` → "Nova Solicitação"** — escolha o equipamento, descreva a demanda e crie.
   O card volta **sem selo**: já está aprovada. (`/supervisor/tarefas` não recebeu nada.)
2. **"Iniciar"** — abre a leitura do QR do equipamento; a retirada só vale com o operador
   ao lado da máquina.
3. Lido o QR, cai na **verificação de disponibilidade** (status, habilitação, sessão de
   outro operador) e no CTA **"Iniciar verificação"**.
4. **Preencha o checklist inteiro em OK** — a ordem dos itens muda a cada tentativa. Não
   corra: abaixo de 10 s por seção ou 25 s no total, o preenchimento é marcado como
   suspeito (o resultado continua "liberado", mas o supervisor vê o alerta).
5. **Resultado "Liberado"** — a sessão abre e o equipamento passa a **Em uso**.
6. Voltando ao início, o card do equipamento agora tem selo **Em uso** e CTA **Devolver**.
7. **"Devolver"** → releitura do QR → "Confirmar devolução": o equipamento volta a
   disponível e a **tarefa é concluída no mesmo gesto**.
8. Troque para Supervisor e abra a ficha do equipamento: o histórico mostra a corrida
   inteira — `tarefa_criada` → `tarefa_aprovada` → `checklist_preenchido` →
   `equipamento_liberado_uso` → `sessao_operacao_encerrada` → `tarefa_concluida`.

Desligue "Aprovação automática" para demonstrar o caminho com o supervisor no meio: a
solicitação volta a nascer pendente e a decisão acontece em `/supervisor/tarefas`.

## Roteiro de demonstração (12 minutos)

1. **`/`** — apresente as quatro jornadas e explique que não há login: a troca de
   perfil acontece pelo painel "Modo demonstração".
2. **Portal Portonav → Equipamentos** (`/admin/equipamentos`) — cadastre um
   equipamento novo (`/admin/equipamentos/novo`): tag, tipo e tipo de operação —
   mostre que o QR e o checklist padrão são resolvidos automaticamente.
3. **Portal Portonav → Modelos de checklist** (`/admin/checklists`) — abra o modelo
   de empilhadeira e mostre o item "Buzina": tipo de resposta, modo de tratamento
   (`bloqueia`, em vermelho) e a flag "exige foto ao reprovar". É a regra de negócio
   central do produto, configurável sem código. Em **Regras** (`/admin/regras`),
   mostre os dois modos de tratamento e quem pode liberar um equipamento após reparo.
4. **Portal Portonav → Operadores** (`/admin/operadores`) — clique em "Sincronizar
   com o portal" (via SSO/API) e abra a ficha de um operador para mostrar a
   habilitação somente leitura, com aviso de vencimento.
5. **Trocar para o perfil Operador**, escanear (aba "Câmera") ou escolher em
   "Próximos" o equipamento **`EMP-03`** — mostre a negação de uso com o motivo, quem
   bloqueou e quando. É o "uso negado ali mesmo".
6. Volte e escolha um equipamento **disponível** (ex. `EMP-01`). Preencha o
   checklist: aponte que a ordem dos itens muda a cada tentativa, reprove um item
   crítico (ex. freio) para mostrar a exigência de foto + observação, e conclua —
   chegando à tela de **bloqueado** com o chamado aberto automaticamente.
7. Repita rapidamente em outro equipamento aprovando tudo, para mostrar a tela de
   **liberado** e o equipamento passando a "Em uso" com a devolução como próxima ação.
8. **Ligue o modo offline** nos controles de demo — mostre a nota "último status
   conhecido" na ficha do equipamento — preencha mais um checklist e mostre o
   contador de pendentes na fila. Desligue o offline e mostre a sincronização
   automática.
9. **Troque para Supervisor** (`/supervisor`) — mostre os cards (bloqueados/em
   manutenção, apontamentos, checklists suspeitos, aguardando aprovação,
   disponibilidade) e abra **"Checklists em revisão"**: o operador de baixa
   confiabilidade já aparece com o motivo da suspeita (tempo abaixo do mínimo).
10. **Troque para Manutenção** (`/manutencao`) — mova o chamado do equipamento
    bloqueado no passo 6 para "Em atendimento" (o equipamento passa a "Em
    manutenção" e continua visível ao supervisor) e registre o reparo — mostre que
    a manutenção **não** libera diretamente, só o supervisor.
11. **Volte para Supervisor → Liberações** (`/supervisor/liberacoes`) — aprove o
    reparo com uma observação; volte ao painel e mostre que o equipamento já não
    aparece mais como bloqueado. Fecha o ciclo completo: reprovação → apontamento →
    chamado → em atendimento → reparo → aprovação → liberação → histórico.
12. **Avance o tempo** (+7 dias) nos controles de demo e volte ao painel do
    supervisor / relatórios para mostrar os gráficos de disponibilidade, aderência
    por turno e falhas recorrentes por equipamento reagindo à janela de tempo
    simulada.
