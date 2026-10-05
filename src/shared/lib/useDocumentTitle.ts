import { useEffect } from 'react';
import { strings } from '@/shared/strings';

/** Define o título da aba: "<página> — Gestão de Fornecedores". */
export function useDocumentTitle(page: string): void {
  useEffect(() => {
    document.title = strings.common.documentTitle(page);
  }, [page]);
}
