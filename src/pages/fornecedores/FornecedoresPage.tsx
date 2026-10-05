import { BuildingStorefrontIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useSearchParams } from 'react-router';
import {
  FornecedoresFiltros,
  FornecedoresTabela,
  ModalReenviarAcesso,
  filtrarFornecedores,
  useFiltrosFornecedores,
  useFornecedores,
} from '@/features/fornecedores';
import { paths, useDocumentTitle } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { AsyncContent, Button, ButtonLink, EmptyState, PageHeader, SearchInput, Skeleton, SkeletonTable, Stack, Text } from '@/shared/ui';

const t = strings.pages.fornecedores;

export function FornecedoresPage() {
  useDocumentTitle(t.title);
  const query = useFornecedores();
  const { filtros, atualizar, limpar, ativo } = useFiltrosFornecedores();
  // Fornecedor com o modal de reenviar aberto (?reenviar=<id>).
  const [params, setParams] = useSearchParams();
  const reenviarId = params.get('reenviar');
  const setReenviar = (id: string | null) =>
    setParams(
      (atual) => {
        const p = new URLSearchParams(atual);
        if (id) p.set('reenviar', id);
        else p.delete('reenviar');
        return p;
      },
      { replace: true },
    );

  return (
    <Stack>
      <PageHeader
        title={t.title}
        subtitle={query.data ? t.subtitle(query.data.porSituacao.todos) : undefined}
        actions={
          <>
            <SearchInput
              label={t.searchLabel}
              placeholder={t.searchPlaceholder}
              value={filtros.busca}
              onChange={(e) => atualizar({ busca: e.target.value })}
              wrapperClassName="w-75 max-lg:w-full"
            />
            <ButtonLink to={paths.novoFornecedor} variant="primary" icon={PlusIcon}>
              {t.cadastrar}
            </ButtonLink>
          </>
        }
      />
      <AsyncContent
        query={query}
        skeleton={
          <Stack>
            <Skeleton className="h-8.5 w-96 max-w-full" />
            <SkeletonTable rows={10} columns={7} />
          </Stack>
        }
        isEmpty={(lista) => lista.linhas.length === 0}
        empty={
          <EmptyState
            icon={BuildingStorefrontIcon}
            title={t.vazioTitle}
            description={t.vazioDescription}
            action={
              <ButtonLink to={paths.novoFornecedor} variant="primary" icon={PlusIcon}>
                {t.cadastrar}
              </ButtonLink>
            }
          />
        }
      >
        {(lista) => {
          const linhas = filtrarFornecedores(lista.linhas, filtros);
          return (
            <Stack>
              <FornecedoresFiltros lista={lista} filtros={filtros} onChange={atualizar} />
              {linhas.length > 0 ? (
                <>
                  <FornecedoresTabela linhas={linhas} onReenviar={setReenviar} />
                  <Text size="support" tone="faint">
                    {t.nota}
                  </Text>
                </>
              ) : (
                <EmptyState
                  icon={MagnifyingGlassIcon}
                  title={t.semResultadoTitle}
                  description={t.semResultadoDescription}
                  action={ativo && <Button onClick={limpar}>{t.limparFiltros}</Button>}
                />
              )}
              <ModalReenviarAcesso
                fornecedor={lista.linhas.find((l) => l.fornecedor.id === reenviarId)?.fornecedor ?? null}
                onClose={() => setReenviar(null)}
              />
            </Stack>
          );
        }}
      </AsyncContent>
    </Stack>
  );
}
