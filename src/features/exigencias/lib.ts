import type { ItemExigencia } from '@/entities/exigencias';
import { ApiError, mensagemDoErro } from '@/shared/api';
import { strings } from '@/shared/strings';

export type CampoLista = 'nome' | 'tipo' | 'documentos' | 'obra' | 'prazo';
export type ErrosLista = Partial<Record<CampoLista, string>>;

/** Código de negócio → campo do formulário. Os demais vão para a mensagem geral. */
const CAMPO_DO_CODIGO: Readonly<Record<string, CampoLista>> = {
  INVALID_WORKFLOW_NAME: 'nome',
  INVALID_WORKFLOW_TYPE: 'tipo',
  REQUIREMENTS_REQUIRED: 'documentos',
  INVALID_DOCUMENT_REQUIREMENT: 'documentos',
  DUPLICATED_REQUIREMENT: 'documentos',
  INVALID_DISPLAY_ORDER: 'documentos',
  DOCUMENT_DEFINITION_NOT_FOUND: 'documentos',
  CONSTRUCTION_NOT_FOUND: 'obra',
  CONSTRUCTION_ALREADY_HAS_WORKFLOW_FOR_TYPE: 'obra',
  WORKFLOW_ALREADY_IN_CONSTRUCTION: 'obra',
  INVALID_LIMIT_EXPIRES_DAYS: 'prazo',
};

/** Campo do 400 (já normalizado pelo ApiError) → campo do formulário. */
const CAMPO_DA_API: Readonly<Record<string, CampoLista>> = {
  name: 'nome',
  type: 'tipo',
  documents: 'documentos',
  constructionId: 'obra',
  limitExpiresDays: 'prazo',
  workFlowId: 'obra',
};

const MENSAGEM_DO_CAMPO: Readonly<Record<CampoLista, string>> = {
  nome: strings.errosApi.porCampo.nome,
  tipo: strings.errosApi.porCampo.tipo,
  documentos: strings.errosApi.porCampo.documentos,
  obra: strings.errosApi.porCampo.obra,
  prazo: strings.errosApi.porCampo.prazo,
};

/** Erro da API → mensagens por campo (pela tabela de códigos) e mensagem geral. */
export function errosDaApiLista(e: unknown): { campos: ErrosLista; topo: string | null } {
  if (!(e instanceof ApiError)) return { campos: {}, topo: mensagemDoErro(e) };
  const campo = e.code ? CAMPO_DO_CODIGO[e.code] : undefined;
  if (campo) return { campos: { [campo]: e.mensagem }, topo: null };
  if (e.code === 'VALIDATION_ERROR') {
    const campos: ErrosLista = {};
    let fora = false;
    for (const c of e.camposComErro) {
      const nosso = CAMPO_DA_API[c];
      if (nosso) campos[nosso] = MENSAGEM_DO_CAMPO[nosso];
      else fora = true;
    }
    return { campos, topo: fora || Object.keys(campos).length === 0 ? e.mensagem : null };
  }
  return { campos: {}, topo: e.mensagem };
}

/** Prazo do formulário (texto) → dias, ou null se fora de 1–9999. */
export function prazoValido(texto: string): number | null {
  const n = Number(texto);
  return texto !== '' && Number.isInteger(n) && n >= 1 && n <= 9999 ? n : null;
}

export const mesmasExigencias = (a: readonly ItemExigencia[], b: readonly ItemExigencia[]) =>
  a.length === b.length && a.every((x, i) => x.definicaoId === b[i]?.definicaoId && x.obrigatoria === b[i]?.obrigatoria);
