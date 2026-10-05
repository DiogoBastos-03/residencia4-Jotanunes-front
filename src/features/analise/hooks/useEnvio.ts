import { diasEntre, documentosExigidos, montarFila, statusDocumento, type Dataset } from '@/entities';
import { datasetStore } from '@/mocks';
import { useMockQuery, useStore } from '@/shared/lib';
import type { DetalheEnvio } from '../types';

function carregar(ds: Dataset, id: string): DetalheEnvio | null {
  const documento = ds.documentos.find((d) => d.id === id);
  const fornecedor = ds.fornecedores.find((f) => f.id === documento?.fornecedorId);
  if (!documento || !fornecedor) return null;
  const exigido = documentosExigidos(ds, documento.fornecedorId).find((d) => d.tipoDocumentoId === documento.tipoDocumentoId);
  const lista = exigido?.listas[0];
  const obraPrincipal = exigido?.obras[0];
  if (!exigido || !lista || !obraPrincipal) return null;

  const renovacao = Boolean(documento.renovacao);
  const emAnalise = documento.status === 'emAnalise' || renovacao;
  const envio = documento.renovacao ?? documento;
  const enviadoEm = envio.enviadoEm ?? ds.agora;
  const fila = montarFila(ds);
  const posicao = fila.findIndex((e) => e.id === id);

  return {
    documento,
    exigido,
    fornecedor,
    lista,
    obraPrincipal,
    obrasExtras: exigido.obras.length - 1,
    emAnalise,
    renovacao,
    status: emAnalise ? 'emAnalise' : statusDocumento(documento, ds.hoje),
    arquivo: envio.arquivo ?? '',
    tamanhoKb: envio.tamanhoKb ?? 0,
    paginas: envio.paginas ?? 1,
    enviadoEm,
    esperaDias: diasEntre(enviadoEm.slice(0, 10), ds.hoje),
    validadeInformada: envio.validadeInformada,
    decisao: ds.analises.find((a) => a.documentoId === id),
    proximo: posicao >= 0 ? (fila[posicao + 1] ?? fila[0]) : fila[0],
  };
}

/** Um documento enviado, com o que é preciso para decidir — ou a decisão já tomada. `null` se não existe. */
export function useEnvio(id: string) {
  const ds = useStore(datasetStore);
  return useMockQuery(`envio-${id}`, () => carregar(ds, id), { version: ds });
}
