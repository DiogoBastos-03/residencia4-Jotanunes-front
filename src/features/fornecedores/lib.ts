import { ApiError, mensagemDoErro } from '@/shared/api';
import { cnpjValido, telefoneValido } from '@/shared/lib';
import { strings } from '@/shared/strings';
import type { CampoFormFornecedor, EdicaoFornecedor, ErrosFormFornecedor } from './types';

const t = strings.pages.fornecedorNovo;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function emailValido(email: string): boolean {
  return EMAIL.test(email.trim());
}

/** Dados da empresa: razão social, telefone, e-mail e pelo menos um tipo. */
export function validarDados(d: Pick<EdicaoFornecedor, 'razaoSocial' | 'telefone' | 'email' | 'tipos'>): ErrosFormFornecedor {
  return {
    razaoSocial: d.razaoSocial.trim().length >= 2 ? undefined : t.identificacao.razaoErro,
    telefone: telefoneValido(d.telefone) ? undefined : t.identificacao.telefoneErro,
    email: emailValido(d.email) ? undefined : t.identificacao.emailErro,
    tipos: d.tipos.length > 0 ? undefined : t.tipo.erro,
  };
}

export function validarCnpj(cnpj: string): string | undefined {
  return cnpjValido(cnpj) ? undefined : t.identificacao.cnpjErro;
}

type CampoApi = Exclude<CampoFormFornecedor, 'prazo'>;

/** Campo do corpo da API (já normalizado pelo ApiError) → campo do formulário. */
const CAMPO_DA_API: Readonly<Record<string, CampoApi>> = {
  enterpriseName: 'razaoSocial',
  cnpj: 'cnpj',
  phone: 'telefone',
  email: 'email',
  enterpriseTypes: 'tipos',
};

/** Código de negócio (409/422) → campo do formulário. */
const CAMPO_DO_CODIGO: Readonly<Record<string, CampoApi>> = {
  CNPJ_ALREADY_REGISTERED: 'cnpj',
  INVALID_CNPJ: 'cnpj',
  INVALID_PHONE: 'telefone',
  INVALID_EMAIL: 'email',
  INVALID_ENTERPRISE_NAME: 'razaoSocial',
  ENTERPRISE_TYPE_REQUIRED: 'tipos',
  INVALID_ENTERPRISE_TYPE: 'tipos',
};

/** Erro devolvido pela API, separado em: mensagens ao lado de cada campo, e uma mensagem geral (ou null). */
export type ErrosDaApi = { campos: ErrosFormFornecedor; topo: string | null };

export const SEM_ERROS_DA_API: ErrosDaApi = { campos: {}, topo: null };

/**
 * Traduz o erro de uma mutação de fornecedor para o formulário:
 * - 409/422 com code de campo → mensagem do code ao lado daquele campo;
 * - 400 (sem code, com `errors`) → mensagem de cada campo recusado ao lado dele;
 *   campo que o formulário não tem vai para a mensagem geral;
 * - o resto (rede, 5xx, 404…) → mensagem geral, da tabela por code.
 */
export function errosDaApi(erro: unknown): ErrosDaApi {
  if (!(erro instanceof ApiError)) return { campos: {}, topo: mensagemDoErro(erro) };
  const campos: ErrosFormFornecedor = {};
  const doCodigo = erro.code ? CAMPO_DO_CODIGO[erro.code] : undefined;
  if (doCodigo) {
    campos[doCodigo] = erro.mensagem;
    return { campos, topo: null };
  }
  if (erro.code === 'VALIDATION_ERROR') {
    let foraDoFormulario = false;
    for (const chave of erro.camposComErro) {
      const campo = CAMPO_DA_API[chave];
      if (campo) campos[campo] = strings.errosApi.porCampo[campo];
      else foraDoFormulario = true;
    }
    return { campos, topo: foraDoFormulario || Object.keys(campos).length === 0 ? erro.mensagem : null };
  }
  return { campos: {}, topo: erro.mensagem };
}

/** Tira os erros da API dos campos que o usuário acabou de mudar. */
export function limparErrosDaApi(atual: ErrosDaApi, mudou: readonly string[]): ErrosDaApi {
  if (mudou.length === 0) return atual;
  return { campos: Object.fromEntries(Object.entries(atual.campos).filter(([campo]) => !mudou.includes(campo))), topo: atual.topo };
}
