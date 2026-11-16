import { ApiError, mensagemDoErro } from '@/shared/api';
import { strings } from '@/shared/strings';

export const MB = 1024 * 1024;

/** 5242880 → "5 MB"; 1572864 → "1,5 MB". */
export function formatarTamanho(bytes: number): string {
  const mb = bytes / MB;
  return `${mb.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} MB`;
}

/** "1,5" ou "1.5" → bytes (inteiro), ou null se inválido. */
export function mbParaBytes(texto: string): number | null {
  const n = Number(texto.replace(',', '.'));
  if (texto.trim() === '' || !Number.isFinite(n)) return null;
  return Math.round(n * MB);
}

export type CampoTipo = 'nome' | 'descricao' | 'tamanho' | 'validade' | 'formatos';
export type ErrosTipo = Partial<Record<CampoTipo, string>>;

const CAMPO_DO_CODIGO: Readonly<Record<string, CampoTipo>> = {
  DOCUMENT_DEFINITION_NAME_ALREADY_EXISTS: 'nome',
  INVALID_DOCUMENT_DEFINITION_NAME: 'nome',
  INVALID_DOCUMENT_DEFINITION_DESCRIPTION: 'descricao',
  INVALID_MAX_SIZE: 'tamanho',
  INVALID_VALIDITY_DAYS: 'validade',
  INVALID_EXPIRATION_INPUT: 'validade',
  EXPIRATION_POLICY_REQUIRED: 'validade',
  FORMATS_REQUIRED: 'formatos',
  DOCUMENT_FORMAT_NOT_FOUND: 'formatos',
};

const CAMPO_DA_API: Readonly<Record<string, CampoTipo>> = {
  name: 'nome',
  description: 'descricao',
  maxSizeBytes: 'tamanho',
  expiresInDays: 'validade',
  neverExpires: 'validade',
  acceptedFormatIds: 'formatos',
};

const MENSAGEM: Readonly<Record<CampoTipo, string>> = {
  nome: strings.errosApi.porCampo.nome,
  descricao: strings.errosApi.porCampo.descricao,
  tamanho: strings.errosApi.porCampo.tamanho,
  validade: strings.errosApi.porCampo.validade,
  formatos: strings.errosApi.porCampo.formatos,
};

export function errosDaApiTipo(e: unknown): { campos: ErrosTipo; topo: string | null } {
  if (!(e instanceof ApiError)) return { campos: {}, topo: mensagemDoErro(e) };
  const campo = e.code ? CAMPO_DO_CODIGO[e.code] : undefined;
  if (campo) return { campos: { [campo]: e.mensagem }, topo: null };
  if (e.code === 'VALIDATION_ERROR') {
    const campos: ErrosTipo = {};
    let fora = false;
    for (const c of e.camposComErro) {
      const nosso = CAMPO_DA_API[c];
      if (nosso) campos[nosso] = MENSAGEM[nosso];
      else fora = true;
    }
    return { campos, topo: fora || Object.keys(campos).length === 0 ? e.mensagem : null };
  }
  return { campos: {}, topo: e.mensagem };
}
