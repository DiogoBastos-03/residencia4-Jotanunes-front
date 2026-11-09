import { useCallback } from 'react';
import { normalizarTipos, type Contato, type Fornecedor } from '@/entities';
import { datasetStore } from '@/mocks';
import type { EdicaoFornecedor, NovoFornecedor } from '../types';

function slug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const mesmosTipos = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((t) => b.includes(t));

/** Ações sobre fornecedores. Alteram os dados em memória; todas as telas recalculam. Some no F5. */
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
      const fornecedor: Fornecedor = {
        id,
        razaoSocial: novo.razaoSocial.trim(),
        nomeFantasia: novo.nomeFantasia.trim() || undefined,
        cnpj: novo.cnpj.replace(/\D/g, ''),
        tipos: normalizarTipos(novo.tipos),
        telefone: novo.telefone.replace(/\D/g, ''),
        email: novo.email.trim(),
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
      };
      return {
        ...ds,
        fornecedores: [fornecedor, ...ds.fornecedores],
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

  /** Edita dados e tipos. Devolve false quando nada mudou. */
  const editar = useCallback((atual: Fornecedor, dados: EdicaoFornecedor): boolean => {
    const tipos = normalizarTipos(dados.tipos);
    const telefone = dados.telefone.replace(/\D/g, '');
    const mudou =
      dados.razaoSocial.trim() !== atual.razaoSocial || telefone !== atual.telefone || dados.email.trim() !== atual.email || !mesmosTipos(tipos, atual.tipos);
    if (!mudou) return false;
    datasetStore.set((ds) => ({
      ...ds,
      fornecedores: ds.fornecedores.map((f) =>
        f.id === atual.id ? { ...f, razaoSocial: dados.razaoSocial.trim(), telefone, email: dados.email.trim(), tipos } : f,
      ),
    }));
    return true;
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

  return {
    bloquear: (id: string) => definirBloqueio(id, true),
    desbloquear: (id: string) => definirBloqueio(id, false),
    reenviarAcesso,
    cadastrar,
    editar,
    salvarContato,
  };
}
