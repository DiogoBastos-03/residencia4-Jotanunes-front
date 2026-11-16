import {
  documentoDoFornecedor,
  aguardandoAcesso,
  arquivosDoItem,
  documentosExigidos,
  ehPendencia,
  estaEmDia,
  listasAplicaveis,
  listasAplicaveisNaObra,
  listasDaObra,
  listasIgnoradas,
  obrasDoFornecedor,
  resolverEvento,
  resumoFornecedor,
  resumoArquivos,
  statusDocumento,
  type Dataset,
} from '@/entities';
import { useDatasetQuery } from '@/mocks';
import { ApiError } from '@/shared/api';
import type { QueryResult } from '@/shared/lib';
import type { FichaFornecedor } from '../types';
import { useFornecedorDetalhe } from './useFornecedoresApi';

type FichaDemo = Omit<FichaFornecedor, 'cadastro'>;

function carregar(ds: Dataset, id: string): FichaDemo | null {
  const fornecedor = ds.fornecedores.find((f) => f.id === id);
  if (!fornecedor) return null;
  const exigidos = documentosExigidos(ds, id);

  const grupos = listasAplicaveis(ds, id).map((aplicavel) => {
    const documentos = aplicavel.lista.itens.flatMap((item) => {
      if (item.escopo !== 'empresa') return [];
      const exigido = exigidos.find((e) => e.tipoDocumentoId === item.tipoDocumentoId);
      if (!exigido) return [];
      const documento = documentoDoFornecedor(ds, id, item.tipoDocumentoId);
      return [
        {
          exigido: { ...exigido, obrigatoriedade: item.obrigatoriedade },
          documento,
          status: statusDocumento(documento, ds.hoje),
          naFila: documento?.status === 'emAnalise' || Boolean(documento?.renovacao),
        },
      ];
    });
    const funcionario = aplicavel.lista.itens.flatMap((item) => {
      if (item.escopo !== 'funcionario') return [];
      const exigido = exigidos.find((e) => e.tipoDocumentoId === item.tipoDocumentoId);
      if (!exigido) return [];
      const { arquivos, envios } = arquivosDoItem(ds, id, item.tipoDocumentoId);
      const comAnalise = envios.find((e) => arquivos.some((a) => a.envioId === e.id && a.status === 'emAnalise'));
      return [
        {
          exigido: { ...exigido, obrigatoriedade: item.obrigatoriedade },
          resumo: resumoArquivos(arquivos, ds.hoje),
          envioAlvo: comAnalise ?? envios[0],
          ultimoEnvio: envios[0]?.enviadoEm,
        },
      ];
    });
    const obrigatorios = documentos.filter((d) => d.exigido.obrigatoriedade === 'obrigatorio');
    return {
      aplicavel,
      documentos,
      funcionario,
      obrigatoriosEmDia: obrigatorios.filter((d) => estaEmDia(d.status)).length,
      obrigatoriosTotal: obrigatorios.length,
    };
  });

  return {
    fornecedor,
    resumo: resumoFornecedor(ds, id),
    aguardandoAcesso: aguardandoAcesso(fornecedor),
    grupos,
    ignoradas: listasIgnoradas(ds, id),
    obras: obrasDoFornecedor(ds, id).flatMap((obra) => {
      const vinculo = ds.vinculos.find((v) => v.obraId === obra.id && v.fornecedorId === id);
      return vinculo
        ? [{ obra, vinculo, listasAplicaveis: listasAplicaveisNaObra(ds, id, obra.id).length, listasNaObra: listasDaObra(ds, obra.id).length }]
        : [];
    }),
    historico: ds.eventos
      .filter((e) => e.fornecedorId === id)
      .sort((a, b) => b.quando.localeCompare(a.quando))
      .map((e) => resolverEvento(ds, e)),
    pendenciasParaCobrar: exigidos.filter(
      (e) => e.escopo === 'empresa' && e.obrigatoriedade === 'obrigatorio' && ehPendencia(statusDocumento(documentoDoFornecedor(ds, id, e.tipoDocumentoId), ds.hoje)),
    ).length,
  };
}

/** Fornecedor que não existe na API: 404 com ENTERPRISE_NOT_FOUND, ou 404 sem corpo (id que não é GUID). */
function naoExiste(erro: Error | null): boolean {
  return erro instanceof ApiError && erro.status === 404;
}

/**
 * Ficha completa do fornecedor. `null` se não existe.
 * Junta duas fontes: o detalhe da API (dados cadastrais — aba Dados e cabeçalho) e a
 * demonstração gerada sobre ele (documentos, exigências, obras, histórico, contatos).
 */
export function useFornecedor(id: string): QueryResult<FichaFornecedor | null> {
  const demo = useDatasetQuery(`fornecedor-${id}`, (ds) => carregar(ds, id));
  const detalhe = useFornecedorDetalhe(id);
  const refetch = () => {
    demo.refetch();
    void detalhe.refetch();
  };

  if (demo.error) return { data: undefined, isLoading: false, error: demo.error, refetch };
  if (naoExiste(detalhe.error)) return { data: demo.isLoading ? undefined : null, isLoading: demo.isLoading, error: null, refetch };
  if (detalhe.error) return { data: undefined, isLoading: false, error: detalhe.error, refetch };
  if (demo.isLoading || demo.data === undefined || !detalhe.data) return { data: undefined, isLoading: true, error: null, refetch };
  if (demo.data === null) return { data: null, isLoading: false, error: null, refetch };

  const cadastro = detalhe.data;
  return {
    data: {
      ...demo.data,
      // O que a API sabe vence o que está no dataset.
      fornecedor: {
        ...demo.data.fornecedor,
        razaoSocial: cadastro.razaoSocial,
        cnpj: cadastro.cnpj,
        tipos: cadastro.tipos,
        bloqueado: cadastro.bloqueado,
        telefone: cadastro.telefone,
        email: cadastro.email,
        desde: cadastro.desde,
      },
      cadastro,
    },
    isLoading: false,
    error: null,
    refetch,
  };
}
