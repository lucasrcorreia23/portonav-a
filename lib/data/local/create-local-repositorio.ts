import type { Repositorio } from "../repository";
import { criarEquipamentosRepositorio } from "./equipamentos";
import { criarChecklistsRepositorio } from "./checklists";
import { criarOperadoresRepositorio } from "./operadores";
import { criarManutencaoRepositorio } from "./manutencao";
import { criarSessoesRepositorio } from "./sessoes";
import { criarHistoricoRepositorio } from "./historico";
import { criarSyncRepositorio } from "./sync";

/**
 * Única implementação hoje da interface Repositorio. Uma futura API real viraria
 * lib/data/remote/*, implementando as mesmas interfaces — nenhum componente muda.
 */
export function criarRepositorioLocal(): Repositorio {
  return {
    equipamentos: criarEquipamentosRepositorio(),
    checklists: criarChecklistsRepositorio(),
    operadores: criarOperadoresRepositorio(),
    manutencao: criarManutencaoRepositorio(),
    sessoes: criarSessoesRepositorio(),
    historico: criarHistoricoRepositorio(),
    sync: criarSyncRepositorio(),
  };
}
