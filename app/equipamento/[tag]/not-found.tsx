import Link from "next/link";
import { SearchX } from "lucide-react";

export default function EquipamentoNaoEncontrado() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-20 text-center">
      <SearchX size={40} className="text-foreground-subtle" aria-hidden />
      <h1 className="text-lg font-medium text-foreground">Equipamento não encontrado</h1>
      <p className="text-sm text-foreground-muted">
        Não existe nenhum equipamento cadastrado com essa tag. Ela pode ter sido removida após um reset dos
        dados de demonstração.
      </p>
      <Link
        href="/entrada"
        className="inline-flex h-11 items-center justify-center rounded-control bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600"
      >
        Voltar para a entrada
      </Link>
    </div>
  );
}
