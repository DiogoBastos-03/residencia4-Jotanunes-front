import { useEffect, useState } from 'react';
import { ClipboardDocumentListIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useSearchParams } from 'react-router';
import type { TipoFornecimento } from '@/entities';
import { useListasApi } from '@/entities/exigencias';
import { ListasTabela } from '@/features/exigencias';
import { paths, useDocumentTitle, useResultado } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { AsyncContent, Button, ButtonLink, EmptyState, FilterBar, PageHeader, SearchInput, SkeletonTable, Stack } from '@/shared/ui';

const t = strings.pages.exigencias;
type FiltroTipo = 'todos' | TipoFornecimento;
const ehFiltro = (v: string | null): v is FiltroTipo => v === 'todos' || v === 'servico' || v === 'material';

/** Listas de exigências com os filtros do back: tipo e nome (a busca espera 300 ms de pausa na digitação). */
export function ExigenciasPage() {
  useDocumentTitle(t.title);
  const [params, setParams] = useSearchParams();
  const tipoUrl = params.get('tipo');
  const tipo: FiltroTipo = ehFiltro(tipoUrl) ? tipoUrl : 'todos';
  const [busca, setBusca] = useState(params.get('busca') ?? '');
  const [nome, setNome] = useState(busca.trim());

  useEffect(() => {
    const timer = window.setTimeout(() => setNome(busca.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [busca]);

  const atualizar = (chave: string, valor: string) =>
    setParams(
      (atual) => {
        const p = new URLSearchParams(atual);
        if (valor && valor !== 'todos') p.set(chave, valor);
        else p.delete(chave);
        return p;
      },
      { replace: true },
    );

  const filtros = { ...(tipo !== 'todos' ? { tipo } : {}), ...(nome ? { nome } : {}) };
  const query = useResultado(useListasApi(filtros), { empty: { itens: [], total: 0, parcial: false } });
  const filtrando = tipo !== 'todos' || nome !== '';

  return (
    <Stack>
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        actions={
          <div className="flex w-full min-w-0 items-center gap-2 lg:w-auto">
            <SearchInput
              label={t.buscaLabel}
              placeholder={t.buscaPlaceholder}
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                atualizar('busca', e.target.value);
              }}
              wrapperClassName="min-w-0 flex-1 lg:w-75 lg:flex-none"
            />
            <ButtonLink to={paths.novaLista} variant="primary" icon={PlusIcon} aria-label={t.nova} title={t.nova} className="flex-none max-sm:w-tap max-sm:px-0">
              <span className="max-sm:sr-only">{t.nova}</span>
            </ButtonLink>
          </div>
        }
      />
      <FilterBar
        label={t.filtrosLabel}
        options={[
          { value: 'todos', label: t.filtros.todos },
          { value: 'servico', label: t.filtros.servico },
          { value: 'material', label: t.filtros.material },
        ]}
        value={tipo}
        onChange={(v) => atualizar('tipo', v)}
      />
      <AsyncContent
        query={query}
        skeleton={<SkeletonTable rows={4} columns={2} />}
        isEmpty={(r) => r.itens.length === 0}
        empty={
          filtrando ? (
            <EmptyState
              icon={MagnifyingGlassIcon}
              title={t.semResultadoTitle}
              description={t.semResultadoDescription}
              action={
                <Button
                  onClick={() => {
                    setBusca('');
                    setParams({}, { replace: true });
                  }}
                >
                  {t.limparFiltros}
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={ClipboardDocumentListIcon}
              title={t.vaziaTitle}
              description={t.vaziaDescription}
              action={
                <ButtonLink to={paths.novaLista} variant="primary" icon={PlusIcon}>
                  {t.nova}
                </ButtonLink>
              }
            />
          )
        }
      >
        {(r) => <ListasTabela listas={r.itens} />}
      </AsyncContent>
    </Stack>
  );
}
