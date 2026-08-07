"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { BadgeIA } from "@/components/ia/BadgeIA";
import { CampoGerandoIA } from "@/components/ia/CampoGerandoIA";
import { useGeracaoIA } from "@/components/ia/useGeracaoIA";
import { ETAPAS_SOLUCAO, gerarSolucaoSugerida } from "@/lib/data/ia-simulada";
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
  const { gerando, revelando, etapaAtual, gerar } = useGeracaoIA(ETAPAS_SOLUCAO);

  function aoGerar() {
    gerar(
      () => gerarSolucaoSugerida(apontamentos),
      (novo) => {
        setTexto(novo);
        setGeradoPorIA(true);
      },
    );
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
        {!gerando && geradoPorIA && <BadgeIA />}
      </div>
      <Button
        variante="ia"
        iconeEsquerda={<Sparkles size={14} aria-hidden />}
        carregando={gerando}
        onClick={aoGerar}
      >
        {gerando ? "Pensando…" : "Gerar solução com IA"}
      </Button>
      {gerando ? (
        <CampoGerandoIA rotulo="Análise e solução sugerida" linhas={5} etapa={ETAPAS_SOLUCAO[etapaAtual]} />
      ) : (
        <Textarea
          rotulo="Análise e solução sugerida"
          rows={5}
          className={revelando ? "ia-revelar" : ""}
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            setGeradoPorIA(false);
          }}
          placeholder="Descreva a análise e a solução recomendada para a manutenção."
        />
      )}
      <Button disabled={!texto.trim() || gerando} onClick={aoSalvar}>
        {chamado.analiseAdmin ? "Atualizar análise" : "Encaminhar para manutenção"}
      </Button>
    </Card>
  );
}
