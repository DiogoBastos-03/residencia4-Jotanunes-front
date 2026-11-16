import { useMutation, useQueryClient } from '@tanstack/react-query';
import { normalizarTipos, type FornecedorCadastro } from '@/entities';
import { fornecedorApi, type DadosEdicaoFornecedor } from '@/entities/fornecedor';
import { queryKeys } from '@/shared/api';
import type { EdicaoFornecedor, NovoFornecedor } from '../types';

const digitos = (texto: string) => texto.replace(/\D/g, '');
const mesmosTipos = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((t) => b.includes(t));

/** Depois de mudar um fornecedor: listagem, detalhe e vínculos buscam de novo. Nada é editado no cache à mão. */
function useInvalidarFornecedores() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.fornecedores.todos });
}

/** Cadastro: POST /enterprises com razão social, CNPJ, telefone, e-mail e tipos. */
export function useCadastrarFornecedor() {
  const invalidar = useInvalidarFornecedores();
  return useMutation({
    mutationFn: (novo: NovoFornecedor) =>
      fornecedorApi.cadastrar({
        razaoSocial: novo.razaoSocial,
        cnpj: digitos(novo.cnpj),
        telefone: digitos(novo.telefone),
        email: novo.email,
        tipos: normalizarTipos(novo.tipos),
      }),
    // Devolver a promessa mantém o botão em "Cadastrando…" até a lista atualizada chegar.
    onSuccess: () => invalidar(),
  });
}

/**
 * Edição: PATCH /enterprises/{id} só com os campos que mudaram e, se os tipos mudaram,
 * PUT /enterprises/{id}/types. Resolve false quando nada mudou (nenhuma chamada é feita).
 */
export function useEditarFornecedor() {
  const invalidar = useInvalidarFornecedores();
  return useMutation({
    mutationFn: async ({ atual, dados }: { atual: FornecedorCadastro; dados: EdicaoFornecedor }): Promise<boolean> => {
      const telefone = digitos(dados.telefone);
      const tipos = normalizarTipos(dados.tipos);
      const edicao: DadosEdicaoFornecedor = {
        ...(dados.razaoSocial.trim() !== atual.razaoSocial ? { razaoSocial: dados.razaoSocial } : {}),
        ...(telefone !== atual.telefone ? { telefone } : {}),
        ...(dados.email.trim() !== atual.email ? { email: dados.email } : {}),
      };
      const mudouDados = Object.keys(edicao).length > 0;
      const mudouTipos = !mesmosTipos(tipos, atual.tipos);
      if (mudouDados) await fornecedorApi.editar(atual.id, edicao);
      if (mudouTipos) await fornecedorApi.trocarTipos(atual.id, tipos);
      return mudouDados || mudouTipos;
    },
    // onSettled, e não só onSuccess: se o PATCH passou e o PUT falhou, a tela precisa mostrar o que mudou.
    onSettled: (mudou, erro) => (mudou || erro ? invalidar() : undefined),
  });
}

/** Bloqueio: PATCH /enterprises/{id}/status com { active: false } (bloquear) ou { active: true } (desbloquear). */
export function useDefinirBloqueio() {
  const invalidar = useInvalidarFornecedores();
  return useMutation({
    mutationFn: ({ id, bloqueado }: { id: string; bloqueado: boolean }) => fornecedorApi.definirBloqueio(id, bloqueado),
    onSuccess: () => invalidar(),
  });
}
