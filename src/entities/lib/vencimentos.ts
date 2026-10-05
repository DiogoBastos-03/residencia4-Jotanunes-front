import type { IsoDate } from '../common';
import type { Dataset } from '../dataset';
import type { Fornecedor } from '../fornecedor';
import { nomeDoTipoDocumento } from './aplicabilidade';
import { diasEntre, JANELA_VENCIMENTO_DIAS } from './dates';

export type Vencimento = {
  documentoId: string;
  documentoNome: string;
  fornecedor: Fornecedor;
  validade: IsoDate;
  /** Negativo quando já venceu. */
  diasRestantes: number;
  /** Já existe uma versão nova em análise. */
  renovacaoEmAnalise: boolean;
};

function montar(ds: Dataset, filtro: (dias: number) => boolean): Vencimento[] {
  const lista: Vencimento[] = [];
  for (const doc of ds.documentos) {
    if (doc.status !== 'aprovado' || !doc.validade) continue;
    const dias = diasEntre(ds.hoje, doc.validade);
    if (!filtro(dias)) continue;
    const fornecedor = ds.fornecedores.find((f) => f.id === doc.fornecedorId);
    if (!fornecedor) continue;
    lista.push({
      documentoId: doc.id,
      documentoNome: nomeDoTipoDocumento(ds, doc.tipoDocumentoId),
      fornecedor,
      validade: doc.validade,
      diasRestantes: dias,
      renovacaoEmAnalise: Boolean(doc.renovacao),
    });
  }
  return lista.sort(
    (a, b) =>
      a.validade.localeCompare(b.validade) ||
      a.fornecedor.razaoSocial.localeCompare(b.fornecedor.razaoSocial, 'pt-BR'),
  );
}

/** Documentos aprovados que vencem nos próximos 30 dias. */
export function vencimentosProximos(ds: Dataset): Vencimento[] {
  return montar(ds, (dias) => dias >= 0 && dias <= JANELA_VENCIMENTO_DIAS);
}

/** Documentos que venceram nos últimos 30 dias e continuam pendentes. */
export function vencidosRecentes(ds: Dataset): Vencimento[] {
  return montar(ds, (dias) => dias < 0 && dias >= -JANELA_VENCIMENTO_DIAS);
}
