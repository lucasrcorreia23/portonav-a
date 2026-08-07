import type { Perfil } from "@/lib/types";

/** Fonte única do rótulo de perfil — evita repetir o mesmo Record em cada tela. */
export const ROTULO_PERFIL: Record<Perfil, string> = {
  operador: "Operador",
  supervisor: "Supervisor",
  manutencao: "Manutenção",
  admin: "Admin",
};
