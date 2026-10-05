import { useMemo } from 'react';
import { datasetStore } from '@/mocks';
import { useStore } from '@/shared/lib';

/** Verifica, enquanto o usuário digita, se o CNPJ já pertence a um fornecedor. */
export function useCnpjCadastrado(cnpj: string) {
  const ds = useStore(datasetStore);
  const digitos = cnpj.replace(/\D/g, '');
  return useMemo(
    () => (digitos.length === 14 ? (ds.fornecedores.find((f) => f.cnpj === digitos) ?? null) : null),
    [digitos, ds],
  );
}
