import { cnpjValido, telefoneValido } from '@/shared/lib';
import { strings } from '@/shared/strings';
import type { EdicaoFornecedor, ErrosFormFornecedor } from './types';

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
