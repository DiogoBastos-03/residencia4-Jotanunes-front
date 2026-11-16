import { NovaListaForm } from '@/features/exigencias';
import { useDocumentTitle } from '@/shared/lib';
import { strings } from '@/shared/strings';

export function NovaListaPage() {
  useDocumentTitle(strings.pages.novaLista.title);
  return <NovaListaForm />;
}
