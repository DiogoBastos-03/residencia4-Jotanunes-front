import { useState } from 'react';
import { DocumentTextIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useDefinicoesApi, useFormatosApi, type DefinicaoDocumento } from '@/entities/tipoDocumento';
import { DrawerTipoDocumento, TiposDocumentoTabela } from '@/features/tiposDocumento';
import { juntar, useDocumentTitle, useResultado } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { AsyncContent, Button, EmptyState, PageHeader, SearchInput, SkeletonTable, Stack } from '@/shared/ui';

const t = strings.pages.tiposDocumento;
const sem = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Tipos de documento e formatos aceitos. Criar e editar; o back não tem exclusão. */
export function TiposDocumentoPage() {
  useDocumentTitle(t.title);
  const definicoes = useDefinicoesApi();
  const formatos = useFormatosApi();
  const query = useResultado(
    juntar(definicoes, formatos, (d, f) => ({ tipos: d.itens, formatos: f })),
    { empty: { tipos: [], formatos: [] } },
  );
  const [busca, setBusca] = useState('');
  const [aberto, setAberto] = useState<{ tipo: DefinicaoDocumento | null } | null>(null);

  return (
    <Stack>
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        actions={
          <div className="flex w-full min-w-0 items-center gap-2 lg:w-auto">
            <SearchInput label={t.buscaLabel} placeholder={t.buscaPlaceholder} value={busca} onChange={(e) => setBusca(e.target.value)} wrapperClassName="min-w-0 flex-1 lg:w-75 lg:flex-none" />
            <Button variant="primary" icon={PlusIcon} aria-label={t.novo} title={t.novo} className="flex-none max-sm:w-tap max-sm:px-0" onClick={() => setAberto({ tipo: null })}>
              <span className="max-sm:sr-only">{t.novo}</span>
            </Button>
          </div>
        }
      />
      <AsyncContent
        query={query}
        skeleton={<SkeletonTable rows={5} columns={5} />}
        isEmpty={(r) => r.tipos.length === 0}
        empty={<EmptyState icon={DocumentTextIcon} title={t.vazioTitle} description={t.vazioDescription} />}
      >
        {(r) => {
          const termo = sem(busca.trim());
          const visiveis = r.tipos.filter((d) => sem(d.nome).includes(termo) || sem(d.descricao).includes(termo));
          return visiveis.length === 0 ? (
            <EmptyState icon={MagnifyingGlassIcon} title={t.semResultadoTitle} description={t.semResultadoDescription} />
          ) : (
            <TiposDocumentoTabela tipos={visiveis} formatos={r.formatos} onEditar={(tipo) => setAberto({ tipo })} />
          );
        }}
      </AsyncContent>
      <DrawerTipoDocumento tipo={aberto?.tipo ?? null} open={aberto !== null} onClose={() => setAberto(null)} />
    </Stack>
  );
}
