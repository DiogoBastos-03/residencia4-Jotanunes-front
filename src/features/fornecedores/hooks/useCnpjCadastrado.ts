import { useFornecedoresApi } from '@/entities/fornecedor';

/** Verifica, enquanto o usuário digita, se o CNPJ já está na listagem da API. */
export function useCnpjCadastrado(cnpj: string) {
  const { data } = useFornecedoresApi();
  const digitos = cnpj.replace(/\D/g, '');
  return digitos.length === 14 ? (data?.itens.find((f) => f.cnpj === digitos) ?? null) : null;
}
