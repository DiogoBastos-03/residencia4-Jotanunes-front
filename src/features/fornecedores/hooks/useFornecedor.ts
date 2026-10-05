import {
  documentoDoFornecedor,
  ehPendencia,
  estaEmDia,
  listasAplicaveis,
  listasAplicaveisNaObra,
  listasDaObra,
  listasIgnoradas,
  obrasDoFornecedor,
  resumoFornecedor,
  resumoFuncionariosDoFornecedor,
  statusDocumento,
  documentosExigidos,
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
      if (item.kind !== 'documento') return [];
      const exigido = exigidos.find((e) => e.tipoDocumentoId === item.tipoDocumentoId);
      if (!exigido) return [];
      const documento = documentoDoFornecedor(ds, id, item.tipoDocumentoId);
      return [{ exigido: { ...exigido, obrigatoriedade: item.obrigatoriedade }, documento, status: statusDocumento(documento, ds.hoje) }];
    });
    const obrigatorios = documentos.filter((d) => d.exigido.obrigatoriedade === 'obrigatorio');
    return {
      aplicavel,
      documentos,
      obrigatoriosEmDia: obrigatorios.filter((d) => estaEmDia(d.status)).length,
      obrigatoriosTotal: obrigatorios.length,
      temFuncionarios: aplicavel.lista.itens.some((i) => i.kind === 'funcionarios'),
    };
  });

  const pendenciasParaCobrar = exigidos.filter(
    (e) => e.obrigatoriedade === 'obrigatorio' && ehPendencia(statusDocumento(documentoDoFornecedor(ds, id, e.tipoDocumentoId), ds.hoje)),
  ).length;

  return {
    fornecedor,
    resumo: resumoFornecedor(ds, id),
    grupos,
    ignoradas: listasIgnoradas(ds, id),
    obras: obrasDoFornecedor(ds, id).flatMap((obra) => {
      const vinculo = ds.vinculos.find((v) => v.obraId === obra.id && v.fornecedorId === id);
      return vinculo
        ? [{
            obra,
            vinculo,
            listasAplicaveis: listasAplicaveisNaObra(ds, id, obra.id).length,
            listasNaObra: listasDaObra(ds, obra.id).length,
          }]
        : [];
    }),
    funcionarios: ds.funcionarios.filter((f) => f.fornecedorId === id),
    resumoFuncionarios: resumoFuncionariosDoFornecedor(ds, id),
    historico: ds.eventos.filter((e) => e.fornecedorId === id),
    pendenciasParaCobrar,
  };
}

/** Ficha completa do fornecedor. `null` se não existe. */
export function useFornecedor(id: string) {
  const ds = useStore(datasetStore);
  return useMockQuery(`fornecedor-${id}`, () => carregar(ds, id), { version: ds });
}
