import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import type { FiltroSituacao, FiltroTipo, LinhaFornecedor } from '../types';

const SITUACOES: readonly FiltroSituacao[] = ['todos', 'apto', 'comPendencia', 'bloqueado'];
const TIPOS: readonly FiltroTipo[] = ['todos', 'servico', 'material'];

export type FiltrosFornecedores = { situacao: FiltroSituacao; tipo: FiltroTipo; busca: string };

function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Situação, tipo e busca (nome ou CNPJ, com ou sem pontuação). */
export function filtrarFornecedores(linhas: readonly LinhaFornecedor[], f: FiltrosFornecedores): LinhaFornecedor[] {
  const termo = normalizar(f.busca.trim());
  const digitos = f.busca.replace(/\D/g, '');
  return linhas.filter((l) => {
    if (f.situacao !== 'todos' && l.resumo.situacao !== f.situacao) return false;
    if (f.tipo !== 'todos' && l.fornecedor.tipo !== f.tipo) return false;
    if (!termo) return true;
    return (
      normalizar(l.fornecedor.razaoSocial).includes(termo) ||
      normalizar(l.fornecedor.nomeFantasia ?? '').includes(termo) ||
      (digitos.length >= 3 && l.fornecedor.cnpj.includes(digitos))
    );
  });
}

/** Filtros guardados na URL (?situacao=&tipo=&busca=). */
export function useFiltrosFornecedores() {
  const [params, setParams] = useSearchParams();
  const filtros = useMemo<FiltrosFornecedores>(
    () => ({
      situacao: SITUACOES.find((s) => s === params.get('situacao')) ?? 'todos',
      tipo: TIPOS.find((t) => t === params.get('tipo')) ?? 'todos',
      busca: params.get('busca') ?? '',
    }),
    [params],
  );
  const atualizar = useCallback(
    (parcial: Partial<FiltrosFornecedores>) =>
      setParams(
        (atual) => {
          const proximo = new URLSearchParams(atual);
          for (const [chave, valor] of Object.entries(parcial)) {
            if (valor === undefined) continue;
            if (valor === '' || valor === 'todos') proximo.delete(chave);
            else proximo.set(chave, valor);
          }
          return proximo;
        },
        { replace: true },
      ),
    [setParams],
  );
  const ativo = filtros.situacao !== 'todos' || filtros.tipo !== 'todos' || filtros.busca !== '';
  return { filtros, atualizar, limpar: () => atualizar({ situacao: 'todos', tipo: 'todos', busca: '' }), ativo };
}
