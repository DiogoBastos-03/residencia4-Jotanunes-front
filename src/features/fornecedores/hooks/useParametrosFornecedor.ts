import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

/**
 * Abas em uso: só o que a API fornece. Documentos, Exigências, Histórico e Contatos
 * saíram da interface (ver src/pages/fornecedor/FornecedorPage.tsx).
 */
export type AbaFornecedor = 'dados' | 'obras';
type ModalFornecedor = 'bloquear' | 'editar';

const ABAS: readonly AbaFornecedor[] = ['dados', 'obras'];

/** Estado da ficha do fornecedor na URL: ?aba=obras, ?modal=bloquear|editar. */
export function useParametrosFornecedor() {
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
  const modal = params.get('modal');
  return {
    aba: ABAS.find((a) => a === params.get('aba')) ?? 'dados',
    modal: modal === 'bloquear' || modal === 'editar' ? (modal satisfies ModalFornecedor) : null,
    setAba: (aba: AbaFornecedor) => definir({ aba: aba === 'dados' ? null : aba }),
    setModal: (m: ModalFornecedor | null) => definir({ modal: m }),
  };
}
