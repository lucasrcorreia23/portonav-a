import type { Habilitacao, Operador, TipoEquipamento, Turno } from "@/lib/types";
import { criarIdSeed, type RNG } from "./rng";
import { DIA_MS } from "../regras";

interface OperadorSeedInput {
  matricula: string;
  nome: string;
  turnoPadrao: Turno;
  tipos: TipoEquipamento[];
  scoreConfiabilidade: number;
  /** dias relativos a agoraBaseMs em que a habilitação do primeiro tipo vence (positivo = no futuro) */
  diasParaVencerPrimeiraHabilitacao?: number;
}

const ROSTER: OperadorSeedInput[] = [
  { matricula: "PN-4521", nome: "Carlos Eduardo Silva", turnoPadrao: "manha", tipos: ["empilhadeira", "transpaleteira"], scoreConfiabilidade: 92 },
  { matricula: "PN-4522", nome: "Marcos Vinícius Souza", turnoPadrao: "tarde", tipos: ["empilhadeira", "reach_stacker", "transpaleteira"], scoreConfiabilidade: 88 },
  { matricula: "PN-4523", nome: "Juliana Aparecida Costa", turnoPadrao: "noite", tipos: ["empilhadeira"], scoreConfiabilidade: 95 },
  { matricula: "PN-4524", nome: "Fernanda Lima Santos", turnoPadrao: "manha", tipos: ["reach_stacker", "transpaleteira"], scoreConfiabilidade: 90 },
  { matricula: "PN-4525", nome: "Roberto Carlos Oliveira", turnoPadrao: "tarde", tipos: ["empilhadeira", "transpaleteira"], scoreConfiabilidade: 76 },
  { matricula: "PN-4526", nome: "Patrícia Almeida Rocha", turnoPadrao: "noite", tipos: ["empilhadeira", "reach_stacker"], scoreConfiabilidade: 84 },
  { matricula: "PN-4527", nome: "Anderson Luiz Pereira", turnoPadrao: "manha", tipos: ["transpaleteira"], scoreConfiabilidade: 98 },
  { matricula: "PN-4528", nome: "Camila Ferreira Dias", turnoPadrao: "tarde", tipos: ["empilhadeira"], scoreConfiabilidade: 81, diasParaVencerPrimeiraHabilitacao: 5 },
  { matricula: "PN-4529", nome: "Rodrigo Machado Teixeira", turnoPadrao: "noite", tipos: ["reach_stacker", "transpaleteira"], scoreConfiabilidade: 70 },
  { matricula: "PN-4530", nome: "Débora Cristina Ramos", turnoPadrao: "manha", tipos: ["empilhadeira", "reach_stacker", "transpaleteira"], scoreConfiabilidade: 94 },
  { matricula: "PN-4531", nome: "Éverton José Barbosa", turnoPadrao: "noite", tipos: ["empilhadeira"], scoreConfiabilidade: 42 },
  { matricula: "PN-4532", nome: "Sandra Regina Nascimento", turnoPadrao: "tarde", tipos: ["transpaleteira"], scoreConfiabilidade: 87 },
];

export function gerarOperadores(agoraBaseMs: number, rng: RNG): Operador[] {
  const admissaoEm = new Date(agoraBaseMs - 300 * DIA_MS).toISOString();

  return ROSTER.map((entrada) => {
    const habilitacoes: Habilitacao[] = entrada.tipos.map((tipo, indice) => {
      const numeroCertificado = `CNH-${entrada.matricula.replace("PN-", "")}-${tipo.slice(0, 3).toUpperCase()}`;
      const habilitacao: Habilitacao = { tipoEquipamento: tipo, numeroCertificado };
      if (indice === 0 && entrada.diasParaVencerPrimeiraHabilitacao !== undefined) {
        habilitacao.validoAte = new Date(
          agoraBaseMs + entrada.diasParaVencerPrimeiraHabilitacao * DIA_MS,
        ).toISOString();
      }
      return habilitacao;
    });

    const operador: Operador = {
      id: criarIdSeed(rng, "oper"),
      matricula: entrada.matricula,
      nome: entrada.nome,
      turnoPadrao: entrada.turnoPadrao,
      habilitacoes,
      scoreConfiabilidade: entrada.scoreConfiabilidade,
      ativo: true,
      admissaoEm,
    };
    return operador;
  });
}
