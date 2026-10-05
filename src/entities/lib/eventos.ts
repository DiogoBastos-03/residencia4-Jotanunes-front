import type { Dataset } from '../dataset';
import type { EventoHistorico } from '../historico';
import type { MotivoReprovacao } from '../documento';

export type AutorResolvido = { kind: 'pessoa' | 'fornecedor'; nome: string } | { kind: 'sistema' } | { kind: 'integracao' };

/** Ação com os nomes no lugar dos ids — pronta para virar texto. */
export type AcaoResolvida =
  | { tipo: 'documentoEnviado'; documento: string }
  | { tipo: 'remessaEnviada'; funcionarios: number; obra: string }
  | { tipo: 'documentoVencido'; documento: string; fornecedor: string }
  | { tipo: 'documentoAprovado'; documento: string }
  | { tipo: 'documentoReprovado'; documento: string; motivo: MotivoReprovacao }
  | { tipo: 'fornecedorVinculado'; fornecedor: string; obra: string }
  | { tipo: 'listasVinculadas'; listas: string[]; obra: string }
  | { tipo: 'listaDesvinculada'; lista: string; obra: string }
  | { tipo: 'obraRecebida'; obra: string };

export type EventoResolvido = { id: string; quando: string; autor: AutorResolvido; acao: AcaoResolvida };

export function resolverEvento(ds: Dataset, evento: EventoHistorico): EventoResolvido {
  const fornecedor = (id: string) => ds.fornecedores.find((f) => f.id === id)?.razaoSocial ?? id;
  const obra = (id: string) => ds.obras.find((o) => o.id === id)?.nome ?? id;
  const lista = (id: string) => ds.listas.find((l) => l.id === id)?.nome ?? id;
  const a = evento.acao;
  const acao: AcaoResolvida =
    a.tipo === 'remessaEnviada'
      ? { tipo: a.tipo, funcionarios: a.funcionarios, obra: obra(a.obraId) }
      : a.tipo === 'documentoVencido'
        ? { tipo: a.tipo, documento: a.documento, fornecedor: fornecedor(a.fornecedorId) }
        : a.tipo === 'fornecedorVinculado'
          ? { tipo: a.tipo, fornecedor: fornecedor(a.fornecedorId), obra: obra(a.obraId) }
          : a.tipo === 'listasVinculadas'
            ? { tipo: a.tipo, listas: a.listaIds.map(lista), obra: obra(a.obraId) }
            : a.tipo === 'listaDesvinculada'
              ? { tipo: a.tipo, lista: lista(a.listaId), obra: obra(a.obraId) }
              : a.tipo === 'obraRecebida'
                ? { tipo: a.tipo, obra: obra(a.obraId) }
                : a;
  const autor: AutorResolvido =
    evento.autor.kind === 'fornecedor'
      ? { kind: 'fornecedor', nome: fornecedor(evento.autor.fornecedorId) }
      : evento.autor.kind === 'pessoa'
        ? { kind: 'pessoa', nome: evento.autor.nome }
        : evento.autor;
  return { id: evento.id, quando: evento.quando, autor, acao };
}
