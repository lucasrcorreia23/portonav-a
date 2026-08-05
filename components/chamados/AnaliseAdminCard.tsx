"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { BadgeIA } from "@/components/ia/BadgeIA";
import { gerarSolucaoSugerida } from "@/lib/data/ia-simulada";
import { agora, useRepositorio } from "@/lib/data/context";
import type { Apontamento, ChamadoManutencao, Perfil } from "@/lib/types";

/** Rótulo estável — este protótipo não tem login/identidade individual por perfil. */
const NOME_ADMIN = "Administrador";

export function AnaliseAdminCard({
  chamado,
  apontamentos,
  perfilAtivo,
}: {
  chamado: ChamadoManutencao;
  apontamentos: Apontamento[];
  perfilAtivo: Perfil;
}) {
  const repo = useRepositorio();
  const [texto, setTexto] = useState(chamado.analiseAdmin?.texto ?? "");
  const [geradoPorIA, setGeradoPorIA] = useState(chamado.analiseAdmin?.geradoPorIA ?? false);

  function aoGerar() {
    setTexto(gerarSolucaoSugerida(apontamentos));
    setGeradoPorIA(true);
  }

  function aoSalvar() {
    repo.manutencao.registrarAnaliseAdmin(chamado.id, {
      texto,
      geradoPorIA,
      analisadoPor: { perfil: perfilAtivo, nome: NOME_ADMIN },
      analisadoEm: agora().toISOString(),
    });
  }

  return (
    <Card densidade="densa" className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <h2 className="font-medium text-foreground">Análise do administrador</h2>
        {geradoPorIA && <BadgeIA />}
      </div>
      <Button
        variante="ia"
        tamanho="sm"
        iconeEsquerda={<Sparkles size={14} aria-hidden />}
        onClick={aoGerar}
        className="self-start"
      >
        Gerar solução com IA
      </Button>
      <Textarea
        rotulo="Análise e solução sugerida"
        rows={5}
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value);
          setGeradoPorIA(false);
        }}
        placeholder="Descreva a análise e a solução recomendada para a manutenção."
      />
      <Button tamanho="sm" disabled={!texto.trim()} onClick={aoSalvar} className="self-start">
        {chamado.analiseAdmin ? "Atualizar análise" : "Encaminhar para manutenção"}
      </Button>
    </Card>
  );
}
