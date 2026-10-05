import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import type { FiltrosFila } from '../lib';

const TIPOS: readonly FiltrosFila['tipo'][] = ['todos', 'empresa', 'funcionario', 'urgentes'];

function lerTipo(valor: string | null): FiltrosFila['tipo'] {
  return TIPOS.find((t) => t === valor) ?? 'todos';
}

/** Filtros da fila guardados na URL (?tipo=&obra=&busca=), para voltar e compartilhar. */
export function useFiltrosFila() {
  const [params, setParams] = useSearchParams();
  const filtros = useMemo<FiltrosFila>(
    () => ({ tipo: lerTipo(params.get('tipo')), obraId: params.get('obra') ?? '', busca: params.get('busca') ?? '' }),
    [params],
  );

  const atualizar = useCallback(
    (parcial: Partial<FiltrosFila>) => {
      setParams(
        (atual) => {
          const proximo = new URLSearchParams(atual);
          const valores = { tipo: parcial.tipo, obra: parcial.obraId, busca: parcial.busca };
          for (const [chave, valor] of Object.entries(valores)) {
            if (valor === undefined) continue;
            if (valor === '' || valor === 'todos') proximo.delete(chave);
            else proximo.set(chave, valor);
          }
          return proximo;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const limpar = useCallback(() => atualizar({ tipo: 'todos', obraId: '', busca: '' }), [atualizar]);
  const ativo = filtros.tipo !== 'todos' || filtros.obraId !== '' || filtros.busca !== '';

  return { filtros, atualizar, limpar, ativo };
}
