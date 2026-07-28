# Portonave — Protótipo de Checklist de Pré-Operação

Protótipo de demonstração (não é um MVP) de um sistema que digitaliza o checklist de
pré-operação de equipamentos portuários, bloqueia equipamento com falha crítica,
aciona manutenção automaticamente e mantém histórico de uso. Veja `PLAN.md` para o
detalhamento de arquitetura, modelo de dados e decisões de implementação.

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
- A "sincronização com o portal corporativo" (tela de operadores no admin) é
  simulada: um `setTimeout` e uma atualização de estado local, sem chamada de rede.
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
| `/equipamento/[tag]/checklist/[secaoOrdem]` | Preenchimento do checklist, uma seção por vez |
| `/equipamento/[tag]/resultado` | Resultado: liberado / liberado com apontamento / bloqueado |
| `/equipamento/[tag]/sessao` | Sessão de operação aberta (tempo decorrido, encerrar) |
| `/supervisor` | Painel do supervisor (bloqueados, apontamentos abertos, disponibilidade) |
| `/supervisor/checklists-suspeitos` | Checklists marcados pelo sistema antifraude |
| `/supervisor/relatorios/*` | Falhas recorrentes, disponibilidade, aderência por turno, ranking de confiabilidade |
| `/manutencao` | Quadro de chamados (aberto / em atendimento / aguardando liberação / concluído) |
| `/manutencao/chamados/[id]` | Detalhe do chamado — registrar reparo, liberar equipamento |
| `/admin` | Cadastros — equipamentos, modelos de checklist, operadores |
| `/admin/equipamentos` | Lista de equipamentos |
| `/admin/checklists` / `/admin/checklists/novo` / `/admin/checklists/[modeloId]` | Construtor de modelos de checklist |
| `/admin/operadores` / `/admin/operadores/[operadorId]` | Lista e ficha de operadores (sincronizado do portal) |

## Roteiro de demonstração (10 minutos)

1. **`/`** — apresente as quatro jornadas e explique que não há login: a troca de
   perfil acontece pelo painel "Modo demonstração".
2. **Admin → Modelos de checklist** (`/admin/checklists`) — abra o modelo de
   empilhadeira e mostre o item "Buzina": tipo de resposta, modo de tratamento
   (`bloqueia`, em vermelho) e a flag "exige foto ao reprovar". É a regra de negócio
   central do produto, configurável sem código.
3. **Admin → Equipamentos** (`/admin/equipamentos`) — abra a ficha do `EMP-03`
   (bloqueado) e mostre a aba de QR: gerado em SVG real, pronto para impressão.
4. **Trocar para o perfil Operador**, escanear (aba "Câmera") ou escolher em
   "Próximos" o equipamento **`EMP-03`** — mostre a negação de uso com o motivo, quem
   bloqueou e quando. É o "uso negado ali mesmo".
5. Volte e escolha um equipamento **disponível** (ex. `EMP-01`). Preencha o
   checklist: aponte que a ordem dos itens muda a cada tentativa, reprove um item
   crítico (ex. freio) para mostrar a exigência de foto + observação, e conclua —
   chegando à tela de **bloqueado** com o chamado aberto automaticamente.
6. Repita rapidamente em outro equipamento aprovando tudo, para mostrar a tela de
   **liberado** e a sessão aberta com o tempo decorrido.
7. **Ligue o modo offline** nos controles de demo, preencha mais um checklist —
   mostre a faixa "Modo offline" e o contador de pendentes na fila. Desligue o
   offline e mostre a sincronização automática.
8. **Troque para Supervisor** (`/supervisor`) — mostre os cards (bloqueados,
   apontamentos, checklists suspeitos, disponibilidade) e abra **"Checklists em
   revisão"**: o operador de baixa confiabilidade já aparece com o motivo da
   suspeita (tempo abaixo do mínimo).
9. **Troque para Manutenção** (`/manutencao`) — abra o chamado do `EMP-03`,
   registre um reparo e libere o equipamento; volte ao painel do supervisor e
   mostre que ele já não aparece mais como bloqueado. Fecha o ciclo completo:
   reprovação → apontamento → chamado → liberação → histórico.
10. **Avance o tempo** (+7 dias) nos controles de demo e volte ao painel do
    supervisor / relatórios para mostrar os gráficos de disponibilidade e
    aderência por turno reagindo à janela de tempo simulada.
