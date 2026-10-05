import { dominio } from './dominio';

type Autor = { kind: 'pessoa' | 'fornecedor'; nome: string } | { kind: 'sistema' } | { kind: 'integracao' };

type Acao =
  | { tipo: 'documentoEnviado'; documento: string }
  | { tipo: 'arquivosEnviados'; quantidade: number; documento: string }
  | { tipo: 'documentoVencido'; documento: string; fornecedor: string }
  | { tipo: 'documentoAprovado'; documento: string }
  | { tipo: 'documentoReprovado'; documento: string; motivo: keyof typeof dominio.motivos }
  | { tipo: 'fornecedorVinculado'; fornecedor: string; obra: string }
  | { tipo: 'listasVinculadas'; listas: string[]; obra: string }
  | { tipo: 'listaDesvinculada'; lista: string; obra: string }
  | { tipo: 'obraRecebida'; obra: string };

const juntar = (itens: string[]) =>
  itens.length <= 1 ? (itens[0] ?? '') : `${itens.slice(0, -1).join(', ')} e ${itens[itens.length - 1] ?? ''}`;

/** Frases do histórico. `contexto` diz em qual ficha o evento aparece. */
export const eventos = {
  autor: (autor: Autor) =>
    autor.kind === 'sistema' ? 'Sistema' : autor.kind === 'integracao' ? 'Integração' : autor.nome,
  descricao: (acao: Acao, contexto: 'obra' | 'fornecedor'): string => {
    switch (acao.tipo) {
      case 'documentoEnviado':
        return `enviou ${acao.documento}`;
      case 'arquivosEnviados':
        return `enviou ${dominio.arquivos(acao.quantidade)} de ${acao.documento}`;
      case 'documentoVencido':
        return contexto === 'obra'
          ? `marcou como vencida a ${acao.documento} da ${acao.fornecedor}`
          : `marcou como vencida a ${acao.documento}`;
      case 'documentoAprovado':
        return `aprovou ${acao.documento}`;
      case 'documentoReprovado':
        return `reprovou ${acao.documento} — ${dominio.motivos[acao.motivo].toLowerCase()}`;
      case 'fornecedorVinculado':
        return contexto === 'obra' ? `vinculou ${acao.fornecedor} à obra` : `vinculou a empresa à obra ${acao.obra}`;
      case 'listasVinculadas':
        return acao.listas.length === 1
          ? `vinculou a lista de exigências ${acao.listas[0] ?? ''}`
          : `vinculou as listas de exigências ${juntar(acao.listas)}`;
      case 'listaDesvinculada':
        return `desvinculou a lista de exigências ${acao.lista}`;
      case 'obraRecebida':
        return `enviou a obra ${acao.obra} para o sistema`;
    }
  },
} as const;
