import {
  documentoDoFornecedor,
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
import { datasetStore } from '@/mocks';
import { useMockQuery, useStore } from '@/shared/lib';
import type { FichaFornecedor } from '../types';

function carregar(ds: Dataset, id: string): FichaFornecedor | null {
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
    aguardandoAcesso: !fornecedor.acessoPortal.acessouEm,
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

/** Ficha completa do fornecedor. `null` se não existe. */
export function useFornecedor(id: string) {
  const ds = useStore(datasetStore);
  return useMockQuery(`fornecedor-${id}`, () => carregar(ds, id), { version: ds });
}
