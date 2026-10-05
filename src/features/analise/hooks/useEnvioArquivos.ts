import { arquivosDoItem, documentosExigidos, resumoArquivos, statusArquivo, type Dataset } from '@/entities';
import { useDatasetQuery } from '@/mocks';
import type { DetalheEnvioArquivos } from '../types';

function carregar(ds: Dataset, id: string): DetalheEnvioArquivos | null {
  const envio = ds.envios.find((e) => e.id === id);
  const fornecedor = ds.fornecedores.find((f) => f.id === envio?.fornecedorId);
  if (!envio || !fornecedor) return null;
  const exigido = documentosExigidos(ds, envio.fornecedorId).find((d) => d.tipoDocumentoId === envio.tipoDocumentoId);
  const lista = exigido?.listas[0];
  if (!exigido || !lista) return null;
  const doEnvio = ds.arquivos.filter((a) => a.envioId === id);
  return {
    envio,
    exigido,
    fornecedor,
    lista,
    arquivos: doEnvio.map((arquivo) => ({ arquivo, status: statusArquivo(arquivo, ds.hoje) })),
    resumoEnvio: resumoArquivos(doEnvio, ds.hoje),
    resumoItem: resumoArquivos(arquivosDoItem(ds, envio.fornecedorId, envio.tipoDocumentoId).arquivos, ds.hoje),
    emAnalise: doEnvio.some((a) => a.status === 'emAnalise'),
  };
}

/** Envio de documento de funcionário com os arquivos. `null` se não existe. */
export function useEnvioArquivos(id: string) {
  return useDatasetQuery(`envio-${id}`, (ds) => carregar(ds, id));
}
