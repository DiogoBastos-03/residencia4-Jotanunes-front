import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

export type AbaFornecedor = 'documentos' | 'exigencias' | 'obras' | 'historico' | 'contatos';
type ModalFornecedor = 'bloquear' | 'reenviar' | 'editar';

const ABAS: readonly AbaFornecedor[] = ['documentos', 'exigencias', 'obras', 'historico', 'contatos'];

/** Estado da ficha do fornecedor na URL: ?aba=, ?modal=bloquear|reenviar|editar. */
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
    aba: ABAS.find((a) => a === params.get('aba')) ?? 'documentos',
    modal: modal === 'bloquear' || modal === 'reenviar' || modal === 'editar' ? (modal satisfies ModalFornecedor) : null,
    setAba: (aba: AbaFornecedor) => definir({ aba: aba === 'documentos' ? null : aba }),
    setModal: (m: ModalFornecedor | null) => definir({ modal: m }),
  };
}
