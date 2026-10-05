import type { IsoDate } from '../common';
import type { Dataset } from '../dataset';
import type { Fornecedor } from '../fornecedor';
import { fornecedoresDaObra, listasAplicaveisNaObra, nomeDoTipoDocumento } from './aplicabilidade';
import { arquivosDoItem, resumoArquivos } from './arquivos';
import { diasEntre } from './dates';
import { ehPendencia, statusArquivo, statusDocumento } from './status';

export type StatusPendencia = 'pendente' | 'reprovado' | 'vencido';

type PendenciaBase = {
  key: string;
  tipoDocumentoId: string;
  documentoNome: string;
  listaNome: string;
  status: StatusPendencia;
  desde: IsoDate;
  emAbertoDias: number;
};

export type Pendencia =
  | (PendenciaBase & { kind: 'empresa'; documentoId: string | undefined })
  | (PendenciaBase & {
      kind: 'funcionario';
      /** Envio mais recente do item, para abrir os arquivos. */
      envioId: string | undefined;
      reprovados: number;
      vencidos: number;
      semArquivos: boolean;
    });

export type GrupoPendencias = { fornecedor: Fornecedor; pendencias: Pendencia[] };

/**
 * O que falta em uma obra, por fornecedor. Pendência não trava ninguém: entra na cobrança.
 * Documento da empresa: pendente, reprovado ou vencido. Documento de funcionário obrigatório:
 * nenhum arquivo enviado, ou algum arquivo reprovado ou vencido.
 */
export function pendenciasDaObra(ds: Dataset, obraId: string): GrupoPendencias[] {
  const grupos: GrupoPendencias[] = [];

  for (const fornecedor of fornecedoresDaObra(ds, obraId)) {
    const pendencias: Pendencia[] = [];
    const vinculadoEm = ds.vinculos.find((v) => v.obraId === obraId && v.fornecedorId === fornecedor.id)?.vinculadoEm ?? ds.hoje;

    for (const lista of listasAplicaveisNaObra(ds, fornecedor.id, obraId)) {
      for (const item of lista.itens) {
        if (item.obrigatoriedade !== 'obrigatorio' || pendencias.some((p) => p.key === item.tipoDocumentoId)) continue;
        const base = { key: item.tipoDocumentoId, tipoDocumentoId: item.tipoDocumentoId, documentoNome: nomeDoTipoDocumento(ds, item.tipoDocumentoId), listaNome: lista.nome };

        if (item.escopo === 'empresa') {
          const doc = ds.documentos.find((d) => d.fornecedorId === fornecedor.id && d.tipoDocumentoId === item.tipoDocumentoId);
          const status = statusDocumento(doc, ds.hoje);
          if (!ehPendencia(status)) continue;
          const desde = status === 'vencido' && doc?.validade ? doc.validade : (doc?.pendenteDesde ?? vinculadoEm.slice(0, 10));
          // Só o que tem arquivo enviado pode ser aberto na análise.
          pendencias.push({ ...base, kind: 'empresa', documentoId: doc?.arquivo ? doc.id : undefined, status, desde, emAbertoDias: diasEntre(desde, ds.hoje) });
          continue;
        }

        const { arquivos, envios } = arquivosDoItem(ds, fornecedor.id, item.tipoDocumentoId);
        const r = resumoArquivos(arquivos, ds.hoje);
        if (r.total > 0 && r.reprovados === 0 && r.vencidos === 0) continue;
        const status: StatusPendencia = r.total === 0 ? 'pendente' : r.reprovados > 0 ? 'reprovado' : 'vencido';
        const datas = arquivos.flatMap((a) => {
          const s = statusArquivo(a, ds.hoje);
          if (s === 'vencido' && a.validade) return [a.validade];
          if (s === 'reprovado' && a.decisao) return [a.decisao.em.slice(0, 10)];
          return [];
        });
        const desde = datas.sort()[0] ?? vinculadoEm.slice(0, 10);
        pendencias.push({
          ...base,
          kind: 'funcionario',
          envioId: envios[0]?.id,
          reprovados: r.reprovados,
          vencidos: r.vencidos,
          semArquivos: r.total === 0,
          status,
          desde,
          emAbertoDias: diasEntre(desde, ds.hoje),
        });
      }
    }

    if (pendencias.length > 0) grupos.push({ fornecedor, pendencias });
  }

  return grupos;
}

export function totalPendenciasDaObra(ds: Dataset, obraId: string): number {
  return pendenciasDaObra(ds, obraId).reduce((total, g) => total + g.pendencias.length, 0);
}
