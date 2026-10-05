import { InboxIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { FilaFiltros, FilaTabela, filtrarFila, useFila, useFiltrosFila } from '@/features/analise';
import { paths, useDocumentTitle } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { AsyncContent, Button, ButtonLink, EmptyState, PageHeader, SearchInput, Skeleton, SkeletonTable, Stack } from '@/shared/ui';

const t = strings.pages.fila;

export function FilaPage() {
  useDocumentTitle(t.title);
  const query = useFila();
  const { filtros, atualizar, limpar, ativo } = useFiltrosFila();

  return (
    <Stack>
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        actions={
          <SearchInput
            label={t.searchLabel}
            placeholder={t.searchPlaceholder}
            value={filtros.busca}
            onChange={(e) => atualizar({ busca: e.target.value })}
            wrapperClassName="w-80 max-lg:w-full"
          />
        }
      />
      <AsyncContent
        query={query}
        skeleton={
          <Stack>
            <Skeleton className="h-8.5 w-96 max-w-full" />
            <SkeletonTable rows={9} columns={7} />
          </Stack>
        }
        isEmpty={(fila) => fila.entradas.length === 0}
        empty={
          <EmptyState
            icon={InboxIcon}
            title={t.vaziaTitle}
            description={t.vaziaDescription}
            action={<ButtonLink to={paths.visaoGeral}>{t.vaziaAction}</ButtonLink>}
          />
        }
      >
        {(fila) => {
          const entradas = filtrarFila(fila.entradas, filtros);
          return (
            <Stack>
              <FilaFiltros fila={fila} filtros={filtros} onChange={atualizar} />
              {entradas.length > 0 ? (
                <FilaTabela entradas={entradas} />
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
