import { useCallback } from 'react';
import type { Contato } from '@/entities';
import { datasetStore } from '@/mocks';

/**
 * Ações de demonstração sobre fornecedores — o que a API ainda não tem (convite e contatos).
 * Alteram os dados em memória; todas as telas recalculam. Some no F5.
 * Cadastro, edição e bloqueio vão para a API: ver ./useMutacoesFornecedor.ts.
 */
export function useAcoesFornecedor() {
  const reenviarAcesso = useCallback((id: string, email: string) => {
    datasetStore.set((ds) => ({
      ...ds,
      fornecedores: ds.fornecedores.map((f) =>
        f.id === id ? { ...f, acessoPortal: { ...f.acessoPortal, convidadoEm: ds.agora, emailConvite: email } } : f,
      ),
    }));
  }, []);

  /** Cria ou substitui o contato do papel informado (principal ou segurança do trabalho). */
  const salvarContato = useCallback((id: string, contato: Contato) => {
    datasetStore.set((ds) => ({
      ...ds,
      fornecedores: ds.fornecedores.map((f) => {
        if (f.id !== id) return f;
        const existe = f.contatos.some((c) => c.papel === contato.papel);
        return { ...f, contatos: existe ? f.contatos.map((c) => (c.papel === contato.papel ? contato : c)) : [...f.contatos, contato] };
      }),
    }));
  }, []);

  return { reenviarAcesso, salvarContato };
}
