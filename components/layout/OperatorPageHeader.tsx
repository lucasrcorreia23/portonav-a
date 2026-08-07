import { BackButton } from "@/components/ui/BackButton";

/**
 * Cabeçalho de tela da jornada do operador: botão circular de voltar + título, com
 * descrição opcional embaixo. Distinto do <OperatorHeader>, que é a cromia do shell
 * (avatar, marca, sino) — este é o título da tela em si, o par operador do <PageHeader>
 * do admin.
 *
 * O voltar só aparece nas telas em que as pranchas o mostram; sem `aoVoltar` o título
 * ocupa a linha inteira (é o caso de "Minhas solicitações", por exemplo).
 */
export function OperatorPageHeader({
  titulo,
  descricao,
  aoVoltar,
  rotuloVoltar = "Voltar",
}: {
  titulo: string;
  descricao?: string;
  aoVoltar?: () => void;
  rotuloVoltar?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-4">
        {aoVoltar && <BackButton aoVoltar={aoVoltar} rotulo={rotuloVoltar} />}
        <h1 className="text-display-sm text-foreground">{titulo}</h1>
      </div>
      {descricao && <p className="mt-1 text-sm text-foreground-muted">{descricao}</p>}
    </div>
  );
}
