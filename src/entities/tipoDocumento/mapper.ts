import { momentoDeUtc } from '../lib/datasApi';
import type { DefinicaoDocumento, DefinicaoDocumentoDetalhe, FormatoArquivo } from './model';
import type {
  CreateDocumentDefinitionRequest,
  DocumentDefinitionDetail,
  DocumentDefinitionListItem,
  DocumentFormat,
  UpdateDocumentDefinitionRequest,
} from './schema';

export function formatoDaApi(dto: DocumentFormat): FormatoArquivo {
  return { id: dto.documentFormatId, nome: dto.name, icone: dto.icon, tipo: dto.type };
}

export function definicaoDaApi(dto: DocumentDefinitionListItem): DefinicaoDocumento {
  return {
    id: dto.documentDefinitionId,
    nome: dto.name,
    descricao: dto.description,
    tamanhoMaxBytes: dto.maxSizeBytes,
    reaproveitavel: dto.canReuse,
    validadeDias: dto.expiresInDays,
    formatoIds: dto.acceptedFormatIds,
  };
}

export function definicaoDetalheDaApi(dto: DocumentDefinitionDetail): DefinicaoDocumentoDetalhe {
  return { ...definicaoDaApi(dto), criadoEm: momentoDeUtc(dto.createdAt), atualizadoEm: momentoDeUtc(dto.updatedAt) };
}

export type DadosDefinicao = Omit<DefinicaoDocumento, 'id'>;

export function novaDefinicaoParaApi(d: DadosDefinicao): CreateDocumentDefinitionRequest {
  return {
    name: d.nome.trim(),
    description: d.descricao.trim(),
    maxSizeBytes: d.tamanhoMaxBytes,
    canReuse: d.reaproveitavel,
    expiresInDays: d.validadeDias,
    acceptedFormatIds: d.formatoIds,
  };
}

/** Só o que mudou. Validade: dias → expiresInDays; "não vence" → neverExpires (nunca os dois). */
export function edicaoDefinicaoParaApi(atual: DefinicaoDocumento, d: DadosDefinicao): UpdateDocumentDefinitionRequest {
  const corpo: UpdateDocumentDefinitionRequest = {};
  if (d.nome.trim() !== atual.nome) corpo.name = d.nome.trim();
  if (d.descricao.trim() !== atual.descricao) corpo.description = d.descricao.trim();
  if (d.tamanhoMaxBytes !== atual.tamanhoMaxBytes) corpo.maxSizeBytes = d.tamanhoMaxBytes;
  if (d.reaproveitavel !== atual.reaproveitavel) corpo.canReuse = d.reaproveitavel;
  if (d.validadeDias !== atual.validadeDias) {
    if (d.validadeDias === null) corpo.neverExpires = true;
    else corpo.expiresInDays = d.validadeDias;
  }
  const mesmos = d.formatoIds.length === atual.formatoIds.length && d.formatoIds.every((f) => atual.formatoIds.includes(f));
  if (!mesmos) corpo.acceptedFormatIds = d.formatoIds;
  return corpo;
}
