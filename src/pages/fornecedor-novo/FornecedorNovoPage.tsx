import { NovoFornecedorForm } from '@/features/fornecedores';
import { useDocumentTitle } from '@/shared/lib';
import { strings } from '@/shared/strings';

export function FornecedorNovoPage() {
  useDocumentTitle(strings.pages.fornecedorNovo.title);
  return <NovoFornecedorForm />;
}
