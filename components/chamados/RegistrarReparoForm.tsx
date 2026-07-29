"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { agora, useRepositorio } from "@/lib/data/context";
import type { Perfil } from "@/lib/types";

export function RegistrarReparoForm({ chamadoId, perfilAtivo }: { chamadoId: string; perfilAtivo: Perfil }) {
  const repo = useRepositorio();
  const [descricao, setDescricao] = useState("");
  const [pecas, setPecas] = useState("");

  function aoSalvar() {
    repo.manutencao.registrarReparo(chamadoId, {
      descricao,
      pecasTrocadas: pecas
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean),
      registradoPor: { perfil: perfilAtivo, nome: "Equipe de manutenção" },
      registradoEm: agora().toISOString(),
    });
    setDescricao("");
    setPecas("");
  }

  return (
    <div className="flex flex-col gap-3">
      <Textarea rotulo="Descrição do reparo" value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
      <Input rotulo="Peças trocadas (separadas por vírgula)" value={pecas} onChange={(e) => setPecas(e.target.value)} />
      <Button onClick={aoSalvar} disabled={!descricao.trim()}>
        Registrar reparo
      </Button>
    </div>
  );
}
