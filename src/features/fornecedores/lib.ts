import { camposRecusados } from '@/entities';
import { ApiError, cnpjValido, telefoneValido } from '@/shared/lib';
import { strings } from '@/shared/strings';
import type { EdicaoFornecedor, ErrosFormFornecedor } from './types';

const t = strings.pages.fornecedorNovo;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Mesmas regras do back, para o erro aparecer antes de enviar. */
export function validarDados(d: Pick<EdicaoFornecedor, 'razaoSocial' | 'telefone' | 'email' | 'tipos'>): ErrosFormFornecedor {
  return {
    razaoSocial: d.razaoSocial.trim().length >= 2 ? undefined : t.identificacao.razaoErro,
    telefone: telefoneValido(d.telefone) ? undefined : t.identificacao.telefoneErro,
    email: EMAIL.test(d.email.trim()) ? undefined : t.identificacao.emailErro,
    tipos: d.tipos.length > 0 ? undefined : t.tipo.erro,
  };
}

export function validarCnpj(cnpj: string): string | undefined {
  return cnpjValido(cnpj) ? undefined : t.identificacao.cnpjErro;
}

/**
 * Onde mostrar um erro da API: 400 vira erro por campo, 409 vira erro no CNPJ,
 * 422 e 500 (e o resto) viram mensagem no topo do formulário ou modal.
 */
export function errosDaApi(erro: unknown): { campos: ErrosFormFornecedor; topo: string | undefined } {
  if (!(erro instanceof ApiError)) return { campos: {}, topo: strings.api.semResposta };
  if (erro.status === 409) return { campos: { cnpj: erro.message }, topo: undefined };
  if (erro.status === 400) {
    const campos = camposRecusados(erro.fieldErrors);
    if (campos.length === 0) return { campos: {}, topo: erro.message };
    return { campos: Object.fromEntries(campos.map((c) => [c, t.recusado[c]])), topo: undefined };
  }
  return { campos: {}, topo: erro.message };
}
