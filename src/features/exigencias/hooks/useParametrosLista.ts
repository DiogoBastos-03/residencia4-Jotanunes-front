import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

export type DrawerLista = 'empresa' | 'funcionario' | 'obras';

/** Estado da configuração na URL: ?drawer=empresa|funcionario|obras, ?item=<id em edição>, ?remover=<obra>, ?form=vazio. */
export function useParametrosLista() {
  const [params, setParams] = useSearchParams();
  const definir = useCallback(
    (mudancas: Record<string, string | null>) =>
      setParams(
        (atual) => {
          const proximo = new URLSearchParams(atual);
          for (const [k, v] of Object.entries(mudancas)) {
            if (v === null) proximo.delete(k);
            else proximo.set(k, v);
          }
          return proximo;
        },
        { replace: true },
      ),
    [setParams],
  );
  const d = params.get('drawer');
  return {
    drawer: d === 'empresa' || d === 'funcionario' || d === 'obras' ? d : null,
    itemId: params.get('item'),
    remover: params.get('remover'),
    formVazio: params.get('form') === 'vazio',
    abrir: (drawer: DrawerLista, itemId: string | null = null) => definir({ drawer, item: itemId, form: null }),
    fechar: () => definir({ drawer: null, item: null, form: null }),
    setRemover: (obraId: string | null) => definir({ remover: obraId }),
  };
}
