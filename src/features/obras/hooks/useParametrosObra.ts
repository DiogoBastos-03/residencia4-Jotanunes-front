import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

export type AbaObra = 'fornecedores' | 'exigencias' | 'pendencias' | 'historico';
export type DrawerObra = 'fornecedor' | 'lista';

const ABAS: readonly AbaObra[] = ['fornecedores', 'exigencias', 'pendencias', 'historico'];

/**
 * Estado da ficha da obra na URL: ?aba=, ?drawer=, ?desvincular=<lista>, ?form=vazio.
 * Tudo abre clicando; a URL só permite voltar e abrir direto pela /_estados.
 */
export function useParametrosObra() {
  const [params, setParams] = useSearchParams();
  const aba = ABAS.find((a) => a === params.get('aba')) ?? 'fornecedores';
  const valorDrawer = params.get('drawer');
  const drawer: DrawerObra | null = valorDrawer === 'fornecedor' || valorDrawer === 'lista' ? valorDrawer : null;

  const definir = useCallback(
    (mudancas: Record<string, string | null>) =>
      setParams(
        (atual) => {
          const proximo = new URLSearchParams(atual);
          for (const [chave, valor] of Object.entries(mudancas)) {
            if (valor === null) proximo.delete(chave);
            else proximo.set(chave, valor);
          }
          return proximo;
        },
        { replace: true },
      ),
    [setParams],
  );

  return {
    aba,
    drawer,
    desvincular: params.get('desvincular'),
    formVazio: params.get('form') === 'vazio',
    setAba: (valor: AbaObra) => definir({ aba: valor === 'fornecedores' ? null : valor }),
    abrirDrawer: (valor: DrawerObra | null) => definir({ drawer: valor, form: null }),
    setDesvincular: (listaId: string | null) => definir({ desvincular: listaId }),
    /** Fecha o drawer e mostra a aba onde o resultado aparece. */
    concluirDrawer: (aba: AbaObra) => definir({ drawer: null, form: null, aba: aba === 'fornecedores' ? null : aba }),
  };
}
