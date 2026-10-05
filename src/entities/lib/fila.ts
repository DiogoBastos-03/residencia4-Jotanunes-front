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
  enviadoEm: IsoDate;
  esperaDias: number;
  prioridade: Prioridade;
};

export type EntradaFilaDocumento = EntradaBase & {
  kind: 'documento';
  documentoId: string;
  documentoNome: string;
  /** Renovação: a versão atual continua valendo enquanto a nova é analisada. */
  renovacao: boolean;
};

export type EntradaFilaRemessa = EntradaBase & {
  kind: 'remessa';
  remessaId: string;
  funcionarios: number;
};

export type EntradaFila = EntradaFilaDocumento | EntradaFilaRemessa;

function ordenar(a: EntradaFila, b: EntradaFila): number {
  if (a.prioridade !== b.prioridade) return a.prioridade === 'urgente' ? -1 : 1;
  if (a.esperaDias !== b.esperaDias) return b.esperaDias - a.esperaDias;
  return a.fornecedor.razaoSocial.localeCompare(b.fornecedor.razaoSocial, 'pt-BR');
}

/** Tudo o que espera decisão: documentos em análise, renovações e remessas abertas. */
export function montarFila(ds: Dataset): EntradaFila[] {
  const entradas: EntradaFila[] = [];

  for (const doc of ds.documentos) {
    const envio =
      doc.status === 'emAnalise' && doc.enviadoEm
        ? { enviadoEm: doc.enviadoEm, prioridade: doc.prioridade ?? 'normal', renovacao: false }
        : doc.renovacao
          ? { enviadoEm: doc.renovacao.enviadoEm, prioridade: doc.renovacao.prioridade, renovacao: true }
          : null;
    if (!envio) continue;
    const fornecedor = ds.fornecedores.find((f) => f.id === doc.fornecedorId);
    const exigido = documentosExigidos(ds, doc.fornecedorId).find((d) => d.tipoDocumentoId === doc.tipoDocumentoId);
    const obraPrincipal = exigido?.obras[0];
    const lista = exigido?.listas[0];
    if (!fornecedor || !obraPrincipal || !lista || !exigido) continue;
    entradas.push({
      kind: 'documento',
      id: doc.id,
      documentoId: doc.id,
      documentoNome: nomeDoTipoDocumento(ds, doc.tipoDocumentoId),
      renovacao: envio.renovacao,
      fornecedor,
      obraPrincipal,
      obrasExtras: exigido.obras.length - 1,
      lista,
      enviadoEm: envio.enviadoEm,
      esperaDias: diasEntre(envio.enviadoEm.slice(0, 10), ds.hoje),
      prioridade: envio.prioridade,
    });
  }

  for (const remessa of ds.remessas) {
    if (remessa.situacao !== 'emAnalise') continue;
    const fornecedor = ds.fornecedores.find((f) => f.id === remessa.fornecedorId);
    const obraPrincipal = ds.obras.find((o) => o.id === remessa.obraId);
    const lista = ds.listas.find((l) => l.id === remessa.listaId);
    if (!fornecedor || !obraPrincipal || !lista) continue;
    entradas.push({
      kind: 'remessa',
      id: remessa.id,
      remessaId: remessa.id,
      funcionarios: ds.funcionarios.filter((f) => f.remessaId === remessa.id).length,
      fornecedor,
      obraPrincipal,
      obrasExtras: 0,
      lista,
      enviadoEm: remessa.enviadaEm,
      esperaDias: diasEntre(remessa.enviadaEm.slice(0, 10), ds.hoje),
      prioridade: remessa.prioridade,
    });
  }

  return entradas.sort(ordenar);
}
