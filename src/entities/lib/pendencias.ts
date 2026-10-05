import type { IsoDate } from '../common';
import type { Dataset } from '../dataset';
import type { Fornecedor } from '../fornecedor';
import { documentosExigidos, itemFuncionarios, listasAplicaveisNaObra, fornecedoresDaObra } from './aplicabilidade';
import { diasEntre } from './dates';
import { ehPendencia, statusDocumento, statusPorValidade } from './status';

export type StatusPendencia = 'pendente' | 'reprovado' | 'vencido';

export type Pendencia =
  | {
      kind: 'empresa';
      key: string;
      documentoNome: string;
      listaNome: string;
      status: StatusPendencia;
      desde: IsoDate;
      emAbertoDias: number;
    }
  | {
      kind: 'funcionario';
      key: string;
      documentoNome: string;
      funcionarioNome: string;
      itemNome: string;
      status: StatusPendencia;
      desde: IsoDate;
      emAbertoDias: number;
    };

export type GrupoPendencias = { fornecedor: Fornecedor; pendencias: Pendencia[] };

/**
 * O que falta em uma obra, por fornecedor. Pendência não trava ninguém:
 * entra na cobrança. Funcionários de remessa ainda aberta não contam.
 */
export function pendenciasDaObra(ds: Dataset, obraId: string): GrupoPendencias[] {
  const grupos: GrupoPendencias[] = [];

  for (const fornecedor of fornecedoresDaObra(ds, obraId)) {
    const pendencias: Pendencia[] = [];
    const listas = listasAplicaveisNaObra(ds, fornecedor.id, obraId);
    const exigidos = documentosExigidos(ds, fornecedor.id);

    for (const lista of listas) {
      for (const item of lista.itens) {
        if (item.kind !== 'documento' || item.obrigatoriedade !== 'obrigatorio') continue;
        const doc = ds.documentos.find(
          (d) => d.fornecedorId === fornecedor.id && d.tipoDocumentoId === item.tipoDocumentoId,
        );
        const status = statusDocumento(doc, ds.hoje);
        if (!ehPendencia(status) || pendencias.some((p) => p.key === item.tipoDocumentoId)) continue;
        const desde = status === 'vencido' && doc?.validade ? doc.validade : (doc?.pendenteDesde ?? ds.hoje);
        pendencias.push({
          kind: 'empresa',
          key: item.tipoDocumentoId,
          documentoNome: exigidos.find((e) => e.tipoDocumentoId === item.tipoDocumentoId)?.nome ?? item.tipoDocumentoId,
          listaNome: lista.nome,
          status,
          desde,
          emAbertoDias: diasEntre(desde, ds.hoje),
        });
      }
    }

    const funcionarios = ds.funcionarios.filter((f) => {
      const remessa = ds.remessas.find((r) => r.id === f.remessaId);
      return f.obraId === obraId && f.fornecedorId === fornecedor.id && remessa?.situacao === 'concluida';
    });
    for (const funcionario of funcionarios) {
      const remessa = ds.remessas.find((r) => r.id === funcionario.remessaId);
      const lista = ds.listas.find((l) => l.id === remessa?.listaId);
      const item = lista ? itemFuncionarios(lista) : undefined;
      if (!item) continue;
      for (const doc of funcionario.documentos) {
        const exigido = item.documentosPessoa.find((d) => d.id === doc.documentoExigidoId);
        if (!exigido || exigido.obrigatoriedade !== 'obrigatorio') continue;
        const status = statusPorValidade(doc.status, doc.validade, ds.hoje);
        if (!ehPendencia(status)) continue;
        const desde = status === 'vencido' && doc.validade ? doc.validade : ds.hoje;
        pendencias.push({
          kind: 'funcionario',
          key: `${funcionario.id}-${doc.documentoExigidoId}`,
          documentoNome: exigido.nome,
          funcionarioNome: funcionario.nome,
          itemNome: item.nome,
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
