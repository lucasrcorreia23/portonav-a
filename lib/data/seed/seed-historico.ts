import type {
  Apontamento,
  ChamadoManutencao,
  ChecklistPreenchido,
  Equipamento,
  HistoricoEvento,
  ModeloChecklist,
  MotivoSuspeita,
  Operador,
  RespostaItemChecklist,
  Turno,
} from "@/lib/types";
import { criarId } from "../id";
import { calcularResultadoChecklist, itensPlanos, type ItemPlano } from "../checklist-logica";
import { DIA_MS, HORA_MS, TEMPO_MINIMO_SECAO_SEGUNDOS } from "../regras";
import { chance, embaralhar, inteiroEntre, escolherUm, type RNG } from "./rng";

const FOTO_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiLz4=";

function gerarRespostas(
  plano: ItemPlano[],
  respondidoEm: Date,
  itemReprovadoId?: string,
  fotoNaReprovacao = false,
): RespostaItemChecklist[] {
  return plano.map(({ item }) => {
    const reprovado = item.id === itemReprovadoId;
    const resposta: RespostaItemChecklist = {
      itemId: item.id,
      valor: reprovado ? "nao_ok" : item.tipoResposta === "numerico" ? 4 : "ok",
      reprovado,
      respondidoEm: respondidoEm.toISOString(),
    };
    if (reprovado && item.exigeObservacaoAoReprovar) {
      resposta.observacao = "Verificado visualmente durante a inspeção de pré-operação.";
    }
    if (reprovado && (item.exigeFotoAoReprovar || fotoNaReprovacao)) {
      resposta.fotoEvidencia = {
        dataUrl: FOTO_PLACEHOLDER,
        timestamp: respondidoEm.toISOString(),
        origemSimulada: true,
      };
    }
    return resposta;
  });
}

function duracoesPorSecao(
  modelo: ModeloChecklist,
  rng: RNG,
  suspeitoTempo: boolean,
): { duracaoPorSecaoSegundos: Record<string, number>; duracaoTotalSegundos: number } {
  const duracaoPorSecaoSegundos: Record<string, number> = {};
  let total = 0;
  modelo.secoes.forEach((secao, indice) => {
    const baixa = suspeitoTempo && indice === 0;
    const duracao = baixa
      ? inteiroEntre(rng, 2, TEMPO_MINIMO_SECAO_SEGUNDOS - 2)
      : inteiroEntre(rng, TEMPO_MINIMO_SECAO_SEGUNDOS + 5, 75);
    duracaoPorSecaoSegundos[secao.id] = duracao;
    total += duracao;
  });
  return { duracaoPorSecaoSegundos, duracaoTotalSegundos: total };
}

interface ParametrosPreenchimento {
  equipamento: Equipamento;
  operador: Operador;
  modelo: ModeloChecklist;
  concluidoEm: Date;
  itemReprovadoId?: string;
  fotoNaReprovacao?: boolean;
  forcarSuspeito?: boolean;
  rng: RNG;
}

function criarPreenchimento(params: ParametrosPreenchimento): ChecklistPreenchido {
  const { equipamento, operador, modelo, concluidoEm, itemReprovadoId, rng } = params;
  const plano = itensPlanos(modelo);
  const respostas = gerarRespostas(plano, concluidoEm, itemReprovadoId, params.fotoNaReprovacao);
  const resultado = calcularResultadoChecklist(plano, respostas);
  const suspeitoPorTempo = params.forcarSuspeito ?? chance(rng, 0.04);
  const { duracaoPorSecaoSegundos, duracaoTotalSegundos } = duracoesPorSecao(
    modelo,
    rng,
    suspeitoPorTempo,
  );
  const iniciadoEm = new Date(concluidoEm.getTime() - duracaoTotalSegundos * 1000);

  const motivosSuspeita: MotivoSuspeita[] = [];
  if (suspeitoPorTempo) {
    const primeiraSecao = modelo.secoes[0];
    motivosSuspeita.push({
      tipo: "tempo_minimo_nao_atingido",
      secaoId: primeiraSecao.id,
      duracaoSegundos: duracaoPorSecaoSegundos[primeiraSecao.id],
      minimoEsperadoSegundos: TEMPO_MINIMO_SECAO_SEGUNDOS,
    });
  }

  return {
    id: criarId("checklist"),
    modeloChecklistId: modelo.id,
    modeloVersao: modelo.versao,
    equipamentoId: equipamento.id,
    operadorId: operador.id,
    ordemItensEmbaralhada: embaralhar(rng, plano.map((p) => p.item.id)),
    seedEmbaralhamento: inteiroEntre(rng, 1, 999_999),
    respostas,
    iniciadoEm: iniciadoEm.toISOString(),
    concluidoEm: concluidoEm.toISOString(),
    duracaoTotalSegundos,
    duracaoPorSecaoSegundos,
    resultado,
    suspeito: motivosSuspeita.length > 0,
    motivosSuspeita,
    scoreConfiabilidadeNoMomento: operador.scoreConfiabilidade,
    preenchidoOffline: false,
  };
}

function evento(
  tipo: HistoricoEvento["tipo"],
  em: Date,
  resumo: string,
  refs: HistoricoEvento["refs"] = {},
  equipamentoId?: string,
  operadorId?: string,
): HistoricoEvento {
  return {
    id: criarId("hist"),
    tipo,
    em: em.toISOString(),
    equipamentoId,
    operadorId,
    refs,
    resumo,
  };
}

export interface ResultadoSeedHistorico {
  checklistsPreenchidos: ChecklistPreenchido[];
  apontamentos: Apontamento[];
  chamados: ChamadoManutencao[];
  historico: HistoricoEvento[];
}

const NOME_EQUIPE_MANUTENCAO = { perfil: "manutencao" as const, nome: "Equipe de manutenção" };

export function gerarHistorico(
  agoraBaseMs: number,
  rng: RNG,
  equipamentos: Equipamento[],
  operadores: Operador[],
  modelos: ModeloChecklist[],
): ResultadoSeedHistorico {
  const checklistsPreenchidos: ChecklistPreenchido[] = [];
  const apontamentos: Apontamento[] = [];
  const chamados: ChamadoManutencao[] = [];
  const historico: HistoricoEvento[] = [];

  const buscarEquip = (tag: string) => {
    const eq = equipamentos.find((e) => e.tag === tag);
    if (!eq) throw new Error(`Equipamento ${tag} não encontrado no seed`);
    return eq;
  };
  const modeloDe = (eq: Equipamento) => {
    const m = modelos.find((mod) => mod.id === eq.modeloChecklistIdPadrao);
    if (!m) throw new Error(`Modelo de checklist não encontrado para ${eq.tag}`);
    return m;
  };
  const operadoresHabilitados = (eq: Equipamento) =>
    operadores.filter((o) => o.ativo && o.habilitacoes.some((h) => h.tipoEquipamento === eq.tipo));

  const operadorBaixoScore = operadores.find((o) => o.scoreConfiabilidade < 60);
  const equipEmp03 = buscarEquip("EMP-03");
  const equipRs01 = buscarEquip("RS-01");
  const equipTp01 = buscarEquip("TP-01");

  const diaDoIncidenteEmp03 = 1;
  const diaDoIncidenteRs01 = 3;
  const diaDaManutencaoTp01 = 6;

  const equipamentosForaDeServicoAntesDe: Record<string, number> = {
    [equipEmp03.id]: diaDoIncidenteEmp03,
    [equipTp01.id]: diaDaManutencaoTp01,
  };

  // --- Histórico ambiente (45 dias) ---
  for (let diasAtras = 44; diasAtras >= 1; diasAtras--) {
    for (const equipamento of equipamentos) {
      const limiteServico = equipamentosForaDeServicoAntesDe[equipamento.id];
      if (limiteServico !== undefined && diasAtras <= limiteServico) continue;

      const candidatos = operadoresHabilitados(equipamento);
      if (candidatos.length === 0) continue;

      const probabilidadeFill = operadorBaixoScore && candidatos.includes(operadorBaixoScore) ? 0.5 : 0.32;
      if (!chance(rng, probabilidadeFill)) continue;

      const operador = escolherUm(rng, candidatos);
      const turno: Turno = operador.turnoPadrao;
      const horaBase = turno === "manha" ? 7 : turno === "tarde" ? 15 : 23;
      const concluidoEm = new Date(
        agoraBaseMs - diasAtras * DIA_MS + horaBase * HORA_MS + inteiroEntre(rng, 0, 40) * 60_000,
      );

      const ehBaixoScore = operadorBaixoScore?.id === operador.id;
      const chanceSuspeita = ehBaixoScore ? 0.55 : turno === "noite" ? 0.1 : 0.03;
      const forcarSuspeito = chance(rng, chanceSuspeita);

      // pequena chance de apontamento não crítico "de fundo", sempre resolvido
      const modelo = modeloDe(equipamento);
      const plano = itensPlanos(modelo);
      const itensAlerta = plano.filter((p) => p.item.modoTratamento === "alerta");
      const gerarApontamentoDeFundo = itensAlerta.length > 0 && chance(rng, 0.08);
      const itemReprovadoId = gerarApontamentoDeFundo ? escolherUm(rng, itensAlerta).item.id : undefined;

      const preenchimento = criarPreenchimento({
        equipamento,
        operador,
        modelo,
        concluidoEm,
        itemReprovadoId,
        forcarSuspeito,
        rng,
      });
      checklistsPreenchidos.push(preenchimento);
      historico.push(
        evento(
          "checklist_preenchido",
          concluidoEm,
          `Checklist "${modelo.nome}" preenchido por ${operador.nome} — resultado: ${preenchimento.resultado.replace(/_/g, " ")}.`,
          { checklistPreenchidoId: preenchimento.id },
          equipamento.id,
          operador.id,
        ),
      );

      if (preenchimento.resultado === "liberado_com_apontamento") {
        const itemDef = plano.find((p) => p.item.id === itemReprovadoId)?.item;
        const apontamento: Apontamento = {
          id: criarId("apont"),
          equipamentoId: equipamento.id,
          origem: {
            checklistPreenchidoId: preenchimento.id,
            itemId: itemDef?.id ?? "",
            itemTitulo: itemDef?.titulo ?? "Item de checklist",
          },
          modoTratamento: "alerta",
          criticidade: "nao_critica",
          status: "resolvido",
          chamadoId: null,
          criadoEm: concluidoEm.toISOString(),
          criadoPorOperadorId: operador.id,
          resolvidoEm: new Date(concluidoEm.getTime() + inteiroEntre(rng, 4, 36) * HORA_MS).toISOString(),
          descricao: `${itemDef?.titulo ?? "Item"} reprovado durante checklist de rotina.`,
        };
        const chamado: ChamadoManutencao = {
          id: criarId("chamado"),
          equipamentoId: equipamento.id,
          apontamentoIds: [apontamento.id],
          origemAutomatica: true,
          status: "concluido",
          prioridade: "baixa",
          abertoEm: apontamento.criadoEm,
          atribuidoA: NOME_EQUIPE_MANUTENCAO,
          registroReparo: {
            descricao: `Ajuste em "${itemDef?.titulo ?? "item"}" realizado durante rotina de manutenção.`,
            pecasTrocadas: [],
            registradoPor: NOME_EQUIPE_MANUTENCAO,
            registradoEm: apontamento.resolvidoEm!,
          },
          liberacao: {
            liberadoPor: NOME_EQUIPE_MANUTENCAO,
            liberadoEm: apontamento.resolvidoEm!,
          },
          historicoStatus: [
            { status: "aberto", em: apontamento.criadoEm },
            { status: "concluido", em: apontamento.resolvidoEm! },
          ],
        };
        apontamento.chamadoId = chamado.id;
        apontamentos.push(apontamento);
        chamados.push(chamado);
        historico.push(
          evento(
            "apontamento_criado",
            concluidoEm,
            `Apontamento aberto para "${itemDef?.titulo ?? "item"}" (não crítico).`,
            { apontamentoId: apontamento.id },
            equipamento.id,
            operador.id,
          ),
        );
      }
    }
  }

  // Garante ao menos 2 checklists suspeitos no histórico do operador de baixo score
  if (operadorBaixoScore) {
    const doOperador = checklistsPreenchidos.filter((c) => c.operadorId === operadorBaixoScore.id);
    const jaSuspeitos = doOperador.filter((c) => c.suspeito).length;
    if (jaSuspeitos < 2) {
      const candidatosParaMarcar = doOperador.filter((c) => !c.suspeito).slice(0, 2 - jaSuspeitos);
      for (const c of candidatosParaMarcar) {
        c.suspeito = true;
        c.motivosSuspeita = [
          {
            tipo: "preenchimento_recorde",
            duracaoTotalSegundos: Math.min(c.duracaoTotalSegundos, 18),
            minimoEsperadoSegundos: TEMPO_MINIMO_SECAO_SEGUNDOS * 2,
          },
        ];
        c.duracaoTotalSegundos = Math.min(c.duracaoTotalSegundos, 18);
      }
    }
  }

  // --- Incidente roteirizado 1: EMP-03 bloqueado por buzina inoperante ---
  {
    const modelo = modeloDe(equipEmp03);
    const plano = itensPlanos(modelo);
    const itemBuzina = plano.find((p) => p.item.titulo === "Buzina")!.item;
    const operador = escolherUm(rng, operadoresHabilitados(equipEmp03));
    const concluidoEm = new Date(agoraBaseMs - diaDoIncidenteEmp03 * DIA_MS + 9 * HORA_MS);

    const preenchimento = criarPreenchimento({
      equipamento: equipEmp03,
      operador,
      modelo,
      concluidoEm,
      itemReprovadoId: itemBuzina.id,
      fotoNaReprovacao: true,
      forcarSuspeito: false,
      rng,
    });
    checklistsPreenchidos.push(preenchimento);
    historico.push(
      evento(
        "checklist_preenchido",
        concluidoEm,
        `Checklist "${modelo.nome}" preenchido por ${operador.nome} — resultado: bloqueado.`,
        { checklistPreenchidoId: preenchimento.id },
        equipEmp03.id,
        operador.id,
      ),
    );

    const apontamento: Apontamento = {
      id: criarId("apont"),
      equipamentoId: equipEmp03.id,
      origem: { checklistPreenchidoId: preenchimento.id, itemId: itemBuzina.id, itemTitulo: itemBuzina.titulo },
      modoTratamento: "bloqueia",
      criticidade: "critica",
      status: "aberto",
      chamadoId: null,
      criadoEm: concluidoEm.toISOString(),
      criadoPorOperadorId: operador.id,
      descricao: "Buzina não emite som ao ser acionada — item crítico de segurança.",
    };
    const chamado: ChamadoManutencao = {
      id: criarId("chamado"),
      equipamentoId: equipEmp03.id,
      apontamentoIds: [apontamento.id],
      origemAutomatica: true,
      status: "aberto",
      prioridade: "alta",
      abertoEm: concluidoEm.toISOString(),
      historicoStatus: [{ status: "aberto", em: concluidoEm.toISOString() }],
    };
    apontamento.chamadoId = chamado.id;
    apontamentos.push(apontamento);
    chamados.push(chamado);

    equipEmp03.status = "bloqueado";
    equipEmp03.chamadoAtivoId = chamado.id;
    equipEmp03.bloqueio = {
      motivo: "Buzina inoperante (item crítico reprovado no checklist de pré-operação).",
      origemItemChecklistId: itemBuzina.id,
      bloqueadoPor: { perfil: "sistema", nome: "Sistema (bloqueio automático)" },
      bloqueadoEm: concluidoEm.toISOString(),
      apontamentoId: apontamento.id,
    };

    historico.push(
      evento(
        "apontamento_criado",
        concluidoEm,
        `Apontamento crítico aberto para "${itemBuzina.titulo}".`,
        { apontamentoId: apontamento.id },
        equipEmp03.id,
        operador.id,
      ),
    );
    historico.push(
      evento(
        "equipamento_bloqueado",
        concluidoEm,
        `Equipamento bloqueado automaticamente: buzina inoperante.`,
        { apontamentoId: apontamento.id, chamadoId: chamado.id },
        equipEmp03.id,
      ),
    );
    historico.push(
      evento(
        "chamado_aberto",
        concluidoEm,
        `Chamado de manutenção aberto automaticamente (prioridade alta).`,
        { chamadoId: chamado.id, apontamentoId: apontamento.id },
        equipEmp03.id,
      ),
    );
  }

  // --- Incidente roteirizado 2: RS-01 com apontamento não crítico ativo, chamado em atendimento ---
  {
    const modelo = modeloDe(equipRs01);
    const plano = itensPlanos(modelo);
    const itemCamera = plano.find((p) => p.item.titulo === "Câmeras e monitores")!.item;
    const operador = escolherUm(rng, operadoresHabilitados(equipRs01));
    const concluidoEm = new Date(agoraBaseMs - diaDoIncidenteRs01 * DIA_MS + 14 * HORA_MS);

    const preenchimento = criarPreenchimento({
      equipamento: equipRs01,
      operador,
      modelo,
      concluidoEm,
      itemReprovadoId: itemCamera.id,
      forcarSuspeito: false,
      rng,
    });
    checklistsPreenchidos.push(preenchimento);
    historico.push(
      evento(
        "checklist_preenchido",
        concluidoEm,
        `Checklist "${modelo.nome}" preenchido por ${operador.nome} — resultado: liberado com apontamento.`,
        { checklistPreenchidoId: preenchimento.id },
        equipRs01.id,
        operador.id,
      ),
    );

    const apontamento: Apontamento = {
      id: criarId("apont"),
      equipamentoId: equipRs01.id,
      origem: { checklistPreenchidoId: preenchimento.id, itemId: itemCamera.id, itemTitulo: itemCamera.titulo },
      modoTratamento: "alerta",
      criticidade: "nao_critica",
      status: "em_atendimento",
      chamadoId: null,
      criadoEm: concluidoEm.toISOString(),
      criadoPorOperadorId: operador.id,
      descricao: "Monitor da câmera lateral esquerda com imagem intermitente.",
    };
    const chamado: ChamadoManutencao = {
      id: criarId("chamado"),
      equipamentoId: equipRs01.id,
      apontamentoIds: [apontamento.id],
      origemAutomatica: true,
      status: "em_atendimento",
      prioridade: "media",
      abertoEm: concluidoEm.toISOString(),
      atribuidoA: NOME_EQUIPE_MANUTENCAO,
      historicoStatus: [
        { status: "aberto", em: concluidoEm.toISOString() },
        {
          status: "em_atendimento",
          em: new Date(concluidoEm.getTime() + 5 * HORA_MS).toISOString(),
        },
      ],
    };
    apontamento.chamadoId = chamado.id;
    apontamentos.push(apontamento);
    chamados.push(chamado);
    equipRs01.status = "com_apontamento";
    equipRs01.chamadoAtivoId = chamado.id;

    historico.push(
      evento(
        "apontamento_criado",
        concluidoEm,
        `Apontamento não crítico aberto para "${itemCamera.titulo}".`,
        { apontamentoId: apontamento.id },
        equipRs01.id,
        operador.id,
      ),
    );
    historico.push(
      evento(
        "chamado_aberto",
        concluidoEm,
        `Chamado de manutenção aberto automaticamente (prioridade média).`,
        { chamadoId: chamado.id, apontamentoId: apontamento.id },
        equipRs01.id,
      ),
    );
  }

  // --- Incidente roteirizado 3: TP-01 em manutenção preventiva, aguardando peça ---
  {
    const abertoEm = new Date(agoraBaseMs - diaDaManutencaoTp01 * DIA_MS + 8 * HORA_MS);
    const previsaoConclusaoEm = new Date(agoraBaseMs + 4 * DIA_MS);
    const chamado: ChamadoManutencao = {
      id: criarId("chamado"),
      equipamentoId: equipTp01.id,
      apontamentoIds: [],
      origemAutomatica: false,
      status: "em_atendimento",
      prioridade: "media",
      abertoEm: abertoEm.toISOString(),
      atribuidoA: NOME_EQUIPE_MANUTENCAO,
      historicoStatus: [
        { status: "aberto", em: abertoEm.toISOString() },
        { status: "em_atendimento", em: new Date(abertoEm.getTime() + 2 * HORA_MS).toISOString() },
      ],
    };
    chamados.push(chamado);
    equipTp01.status = "em_manutencao";
    equipTp01.chamadoAtivoId = chamado.id;
    equipTp01.previsaoManutencao = {
      descricao: "Aguardando peça — correia de transmissão",
      previsaoConclusaoEm: previsaoConclusaoEm.toISOString(),
    };

    historico.push(
      evento(
        "chamado_aberto",
        abertoEm,
        "Manutenção preventiva aberta: substituição de correia de transmissão.",
        { chamadoId: chamado.id },
        equipTp01.id,
      ),
    );
  }

  historico.sort((a, b) => a.em.localeCompare(b.em));

  return { checklistsPreenchidos, apontamentos, chamados, historico };
}
