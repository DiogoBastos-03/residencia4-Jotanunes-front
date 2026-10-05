import { useCallback } from 'react';
import { fornecedorApi, normalizarTipos, type Fornecedor } from '@/entities';
import { datasetStore, recarregarFornecedor } from '@/mocks';
import { USAR_API } from '@/shared/lib';
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

/**
 * Depois de mudar algo na API, a tela mostra o que o banco devolve — não o que a tela mandou.
 * Se só o recarregamento falhar, a mudança já está no banco: aparece no próximo carregamento.
 */
async function recarregarSemFalhar(id: string): Promise<void> {
  try {
    await recarregarFornecedor(id);
  } catch {
    // A mutação deu certo; não há o que desfazer.
  }
}

/**
 * Ações sobre fornecedores. Com a API (VITE_USE_API=true), chamam o back e recarregam o
 * fornecedor afetado; sem a API, alteram os dados em memória. Erros da API sobem como
 * ApiError para a tela decidir onde mostrar (ver errosDaApi em ../lib.ts).
 */
export function useAcoesFornecedor() {
  const definirBloqueio = useCallback(async (id: string, bloqueado: boolean) => {
    if (USAR_API) {
      await fornecedorApi.definirBloqueio(id, bloqueado);
      await recarregarSemFalhar(id);
      return;
    }
    datasetStore.set((ds) => ({ ...ds, fornecedores: ds.fornecedores.map((f) => (f.id === id ? { ...f, bloqueado } : f)) }));
  }, []);

  /** Só nos dados de demonstração: a API não tem endpoint de convite. */
  const reenviarAcesso = useCallback((id: string, email: string) => {
    datasetStore.set((ds) => ({
      ...ds,
      fornecedores: ds.fornecedores.map((f) =>
        f.id === id ? { ...f, acessoPortal: { acessouEm: f.acessoPortal?.acessouEm, convidadoEm: ds.agora, emailConvite: email } } : f,
      ),
    }));
  }, []);

  /** Cria o fornecedor (e, só na demonstração, o vínculo com a obra). Devolve o id criado. */
  const cadastrar = useCallback(async (novo: NovoFornecedor): Promise<string> => {
    if (USAR_API) {
      const id = await fornecedorApi.cadastrar(novo);
      await recarregarSemFalhar(id);
      return id;
    }
    const base = slug(novo.razaoSocial) || novo.cnpj;
    let id = base;
    datasetStore.set((ds) => {
      let n = 2;
      while (ds.fornecedores.some((f) => f.id === id)) id = `${base}-${n++}`;
      const hoje = ds.hoje;
      const fornecedor: Fornecedor = {
        id,
        razaoSocial: novo.razaoSocial.trim(),
        cnpj: novo.cnpj.replace(/\D/g, ''),
        tipos: normalizarTipos(novo.tipos),
        telefone: novo.telefone.replace(/\D/g, ''),
        email: novo.email.trim(),
        desde: hoje,
        bloqueado: false,
        acessoPortal: { convidadoEm: null, emailConvite: novo.email.trim() },
        contatos: [],
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

  /**
   * Edita dados e tipos. Na API são duas chamadas (PATCH dos dados, PUT dos tipos), feitas só
   * se aquela parte mudou. Devolve false quando nada mudou.
   */
  const editar = useCallback(async (atual: Fornecedor, dados: EdicaoFornecedor): Promise<boolean> => {
    const tipos = normalizarTipos(dados.tipos);
    const mudouDados =
      dados.razaoSocial.trim() !== atual.razaoSocial || dados.telefone.replace(/\D/g, '') !== atual.telefone || dados.email.trim() !== atual.email;
    const mudouTipos = !mesmosTipos(tipos, atual.tipos);
    if (!mudouDados && !mudouTipos) return false;
    if (USAR_API) {
      try {
        if (mudouDados) await fornecedorApi.editarDados(atual, dados);
        if (mudouTipos) await fornecedorApi.trocarTipos(atual.id, tipos);
      } finally {
        // Mesmo se a segunda chamada falhar, a primeira pode ter salvo: mostra o que está no banco.
        await recarregarSemFalhar(atual.id);
      }
      return true;
    }
    datasetStore.set((ds) => ({
      ...ds,
      fornecedores: ds.fornecedores.map((f) =>
        f.id === atual.id
          ? { ...f, razaoSocial: dados.razaoSocial.trim(), telefone: dados.telefone.replace(/\D/g, ''), email: dados.email.trim(), tipos }
          : f,
      ),
    }));
    return true;
  }, []);

  return {
    bloquear: (id: string) => definirBloqueio(id, true),
    desbloquear: (id: string) => definirBloqueio(id, false),
    reenviarAcesso,
    cadastrar,
    editar,
  };
}
