import type { IsoDate } from '../common';
import type { Dataset } from '../dataset';
import type { Prioridade } from '../documento';
import type { Fornecedor } from '../fornecedor';
import type { ListaExigencias } from '../listaExigencias';
import type { Obra } from '../obra';
import { documentosExigidos, nomeDoTipoDocumento } from './aplicabilidade';
import { diasEntre } from './dates';

type EntradaBase = {
  id: string;
  fornecedor: Fornecedor;
  obraPrincipal: Obra;
  /** Outras obras em que o mesmo envio vale. */
  obrasExtras: number;
  lista: ListaExigencias;
  documentoNome: string;
  enviadoEm: IsoDate;
  esperaDias: number;
  prioridade: Prioridade;
};

export type EntradaFilaDocumento = EntradaBase & {
  kind: 'documento';
  /** Renovação: a versão atual continua valendo enquanto a nova é analisada. */
  renovacao: boolean;
};

/** Envio de documento de funcionário: uma linha só, não importa quantos arquivos. */
export type EntradaFilaEnvio = EntradaBase & {
  kind: 'envio';
  arquivos: number;
  emAnalise: number;
};

export type EntradaFila = EntradaFilaDocumento | EntradaFilaEnvio;

function ordenar(a: EntradaFila, b: EntradaFila): number {
  if (a.prioridade !== b.prioridade) return a.prioridade === 'urgente' ? -1 : 1;
  if (a.esperaDias !== b.esperaDias) return b.esperaDias - a.esperaDias;
  return a.fornecedor.razaoSocial.localeCompare(b.fornecedor.razaoSocial, 'pt-BR');
}

/** Tudo o que espera decisão: documentos em análise, renovações e envios de documentos de funcionário. */
export function montarFila(ds: Dataset): EntradaFila[] {
  const entradas: EntradaFila[] = [];
  const exigido = (fornecedorId: string, tipoDocumentoId: string) =>
    documentosExigidos(ds, fornecedorId).find((d) => d.tipoDocumentoId === tipoDocumentoId);

  for (const doc of ds.documentos) {
    const envio =
      doc.status === 'emAnalise' && doc.enviadoEm
        ? { enviadoEm: doc.enviadoEm, prioridade: doc.prioridade ?? 'normal', renovacao: false }
        : doc.renovacao
          ? { enviadoEm: doc.renovacao.enviadoEm, prioridade: doc.renovacao.prioridade, renovacao: true }
          : null;
    if (!envio) continue;
    const fornecedor = ds.fornecedores.find((f) => f.id === doc.fornecedorId);
    const e = exigido(doc.fornecedorId, doc.tipoDocumentoId);
    const obraPrincipal = e?.obras[0];
    const lista = e?.listas[0];
    if (!fornecedor || !obraPrincipal || !lista || !e) continue;
    entradas.push({
      kind: 'documento',
      id: doc.id,
      documentoNome: nomeDoTipoDocumento(ds, doc.tipoDocumentoId),
      renovacao: envio.renovacao,
      fornecedor,
      obraPrincipal,
      obrasExtras: e.obras.length - 1,
      lista,
      enviadoEm: envio.enviadoEm,
      esperaDias: diasEntre(envio.enviadoEm.slice(0, 10), ds.hoje),
      prioridade: envio.prioridade,
    });
  }

  for (const envio of ds.envios) {
    const arquivos = ds.arquivos.filter((a) => a.envioId === envio.id);
    const emAnalise = arquivos.filter((a) => a.status === 'emAnalise').length;
    if (emAnalise === 0) continue;
    const fornecedor = ds.fornecedores.find((f) => f.id === envio.fornecedorId);
    const e = exigido(envio.fornecedorId, envio.tipoDocumentoId);
    const obraPrincipal = e?.obras[0];
    const lista = e?.listas[0];
    if (!fornecedor || !obraPrincipal || !lista || !e) continue;
    entradas.push({
      kind: 'envio',
      id: envio.id,
      documentoNome: nomeDoTipoDocumento(ds, envio.tipoDocumentoId),
      arquivos: arquivos.length,
      emAnalise,
      fornecedor,
      obraPrincipal,
      obrasExtras: e.obras.length - 1,
      lista,
      enviadoEm: envio.enviadoEm,
      esperaDias: diasEntre(envio.enviadoEm.slice(0, 10), ds.hoje),
      prioridade: envio.prioridade,
    });
  }

  return entradas.sort(ordenar);
}
