import { PageHeader } from "@/components/layout/PageHeader";
import { ChecklistModelBuilder } from "@/components/checklist/ChecklistModelBuilder";

export default function NovoModeloChecklistPage() {
  return (
    <div>
      <PageHeader titulo="Novo modelo de checklist" subtitulo="Defina as seções, itens e o modo de tratamento de cada um." />
      <ChecklistModelBuilder />
    </div>
  );
}
