import { BuildingStorefrontIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import {
  FornecedoresFiltros,
  FornecedoresTabela,
  filtrarFornecedores,
  useFiltrosFornecedores,
  useFornecedores,
  useListagemParcial,
} from '@/features/fornecedores';
import { paths, useDocumentTitle } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { AsyncContent, Button, ButtonLink, EmptyState, InfoNote, PageHeader, SearchInput, Skeleton, SkeletonTable, Stack } from '@/shared/ui';

const t = strings.pages.fornecedores;

export function FornecedoresPage() {
  useDocumentTitle(t.title);
  const query = useFornecedores();
  const { filtros, atualizar, limpar, ativo } = useFiltrosFornecedores();
  const listagem = useListagemParcial();
  return (
    <Stack>
      <PageHeader
        title={t.title}
        subtitle={query.data ? t.subtitle(query.data.porSituacao.todos) : undefined}
        actions={
          // Busca e botão sempre na mesma linha: a busca fica com o que sobrar; abaixo de sm o botão é só o "+".
          <div className="flex w-full min-w-0 items-center gap-2 lg:w-auto">
            <SearchInput
              label={t.searchLabel}
              placeholder={t.searchPlaceholder}
              value={filtros.busca}
              onChange={(e) => atualizar({ busca: e.target.value })}
              wrapperClassName="min-w-0 flex-1 lg:w-75 lg:flex-none"
            />
            <ButtonLink
              to={paths.novoFornecedor}
              variant="primary"
              icon={PlusIcon}
              aria-label={t.cadastrar}
              title={t.cadastrar}
              className="flex-none max-sm:w-tap max-sm:px-0"
            >
              <span className="max-sm:sr-only">{t.cadastrar}</span>
            </ButtonLink>
          </div>
        }
      />
      <AsyncContent
        query={query}
        skeleton={
          <Stack>
            <Skeleton className="h-8.5 w-96 max-w-full" />
            <SkeletonTable rows={10} columns={5} />
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
              {listagem.parcial && <InfoNote>{t.listaParcial(listagem.carregados, listagem.total)}</InfoNote>}
              <FornecedoresFiltros lista={lista} filtros={filtros} onChange={atualizar} />
              {linhas.length > 0 ? (
                <FornecedoresTabela linhas={linhas} />
              ) : (
                <EmptyState
                  icon={MagnifyingGlassIcon}
                  title={t.semResultadoTitle}
                  description={t.semResultadoDescription}
                  action={ativo && <Button onClick={limpar}>{t.limparFiltros}</Button>}
                />
              )}
            </Stack>
          );
        }}
      </AsyncContent>
    </Stack>
  );
}
