import { AlertTriangle, Ban, ClipboardCheck, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ROTULO_PERFIL } from "@/components/perfil/rotulos";
import { REGRA_APROVACAO_TAREFA_PADRAO, REGRA_LIBERACAO_PADRAO } from "@/lib/data/regras";

export default function RegrasPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Regras"
        subtitulo="Regras de negócio vigentes — configuradas nos modelos de checklist, aplicadas pelo sistema."
      />

      <Card densidade="densa">
        <h2 className="mb-3 font-semibold text-foreground">Modo de tratamento por item de checklist</h2>
        <p className="mb-4 text-sm text-foreground-muted">
          Definido por item, ao construir cada modelo de checklist em{" "}
          <span className="font-medium">Modelos de checklist</span>.
        </p>
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3 rounded-card border border-status-avariado/30 bg-status-avariado-surface p-3">
            <Badge texto="Bloqueia" icone={<Ban size={12} aria-hidden />} classeCor="text-status-avariado bg-surface" tamanho="sm" />
            <p className="text-sm text-foreground">
              Reprovação impede o uso: o equipamento é marcado como avariado, um chamado de manutenção é aberto
              automaticamente e o fluxo segue para manutenção e retorno.
            </p>
          </div>
          <div className="flex items-start gap-3 rounded-card border border-status-apontamento/30 bg-status-apontamento-surface p-3">
            <Badge texto="Alerta" icone={<AlertTriangle size={12} aria-hidden />} classeCor="text-status-apontamento bg-surface" tamanho="sm" />
            <p className="text-sm text-foreground">
              Reprovação libera o uso normalmente, mas registra um apontamento e abre um chamado de manutenção não
              crítico para acompanhamento — sem bloquear a operação.
            </p>
          </div>
        </div>
      </Card>

      <Card densidade="densa">
        <h2 className="mb-3 font-semibold text-foreground">Quem pode aprovar uma solicitação de tarefa</h2>
        <p className="mb-4 text-sm text-foreground-muted">
          Antes de escanear o equipamento, o operador registra a demanda recebida do chefe como uma solicitação — ela
          fica <span className="font-medium">&ldquo;Pendente&rdquo;</span> até que um dos perfis abaixo aprove em{" "}
          <span className="font-medium">Supervisor → Tarefas</span>.
        </p>
        <div className="flex flex-wrap gap-2">
          {REGRA_APROVACAO_TAREFA_PADRAO.perfisPermitidos.map((perfil) => (
            <Badge
              key={perfil}
              texto={ROTULO_PERFIL[perfil]}
              icone={<ClipboardCheck size={12} aria-hidden />}
              classeCor="text-status-em-uso bg-status-em-uso-surface"
            />
          ))}
        </div>
      </Card>

      <Card densidade="densa">
        <h2 className="mb-3 font-semibold text-foreground">Quem pode liberar um equipamento após reparo</h2>
        <p className="mb-4 text-sm text-foreground-muted">
          Manutenção registra o reparo, mas a liberação do equipamento exige aprovação de outro perfil — o reparo fica
          em <span className="font-medium">&ldquo;Aguardando liberação&rdquo;</span> até que um dos perfis abaixo aprove em{" "}
          <span className="font-medium">Supervisor → Liberações</span>.
        </p>
        <div className="flex flex-wrap gap-2">
          {REGRA_LIBERACAO_PADRAO.perfisPermitidos.map((perfil) => (
            <Badge
              key={perfil}
              texto={ROTULO_PERFIL[perfil]}
              icone={<ShieldCheck size={12} aria-hidden />}
              classeCor="text-status-disponivel bg-status-disponivel-surface"
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
