import { useCallback } from 'react';
import { datasetStore } from '@/mocks';
import type { NovoFornecedor } from '../types';

function slug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Ações sobre fornecedores. Alteram os dados em memória; todas as telas recalculam. */
export function useAcoesFornecedor() {
  const definirBloqueio = useCallback((id: string, bloqueado: boolean) => {
    datasetStore.set((ds) => ({ ...ds, fornecedores: ds.fornecedores.map((f) => (f.id === id ? { ...f, bloqueado } : f)) }));
  }, []);

  const reenviarAcesso = useCallback((id: string, email: string) => {
    datasetStore.set((ds) => ({
      ...ds,
      fornecedores: ds.fornecedores.map((f) =>
        f.id === id ? { ...f, acessoPortal: { ...f.acessoPortal, convidadoEm: ds.agora, emailConvite: email } } : f,
      ),
    }));
  }, []);

  /** Cria o fornecedor (e o vínculo com a obra, se houver). Devolve o id criado. */
  const cadastrar = useCallback((novo: NovoFornecedor): string => {
    const base = slug(novo.razaoSocial) || novo.cnpj;
    let id = base;
    datasetStore.set((ds) => {
      let n = 2;
      while (ds.fornecedores.some((f) => f.id === id)) id = `${base}-${n++}`;
      const hoje = ds.hoje;
      return {
        ...ds,
        fornecedores: [
          {
            id,
            razaoSocial: novo.razaoSocial.trim(),
            nomeFantasia: novo.nomeFantasia.trim() || undefined,
            cnpj: novo.cnpj.replace(/\D/g, ''),
            tipo: novo.tipo,
            email: novo.contato.email.trim(),
            desde: hoje,
            bloqueado: false,
            acessoPortal: { convidadoEm: novo.enviarConvite ? ds.agora : null, emailConvite: novo.contato.email.trim() },
            contatos: [
              {
                papel: 'principal',
                nome: novo.contato.nome.trim(),
                cargo: novo.contato.cargo.trim(),
                email: novo.contato.email.trim(),
                telefone: novo.contato.telefone,
              },
            ],
          },
          ...ds.fornecedores,
        ],
        vinculos: novo.obraId
          ? [
              ...ds.vinculos,
              {
                fornecedorId: id,
                obraId: novo.obraId,
                servicoContratado: novo.servicoContratado.trim(),
                inicio: `${hoje.slice(0, 7)}-01`,
                fim: `${String(Number(hoje.slice(0, 4)) + 1)}${hoje.slice(4, 7)}-01`,
                vinculadoEm: ds.agora,
              },
            ]
          : ds.vinculos,
      };
    });
    return id;
  }, []);

  return { bloquear: (id: string) => definirBloqueio(id, true), desbloquear: (id: string) => definirBloqueio(id, false), reenviarAcesso, cadastrar };
}
