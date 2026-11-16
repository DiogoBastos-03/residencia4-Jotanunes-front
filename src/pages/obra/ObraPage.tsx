import { BuildingOffice2Icon } from '@heroicons/react/24/outline';
import { useParams } from 'react-router';
import { FornecedoresDaObra, useObra } from '@/features/obras';
import { paths, useDocumentTitle } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { AsyncContent, ButtonLink, EmptyState, PageHeader, Stack } from '@/shared/ui';
import { ObraSkeleton } from './ObraSkeleton';

const t = strings.pages.obra;

/** Ficha da obra: o nome e os fornecedores vinculados — tudo o que a API tem da obra. */
export function ObraPage() {
  const { id = '' } = useParams();
  const query = useObra(id);
  useDocumentTitle(query.data?.obra.nome ?? strings.pages.obras.title);

  return (
    <AsyncContent
      query={query}
      skeleton={<ObraSkeleton />}
      isEmpty={(ficha) => ficha === null}
      empty={
        <EmptyState
          icon={BuildingOffice2Icon}
          title={t.naoEncontradaTitle}
          description={t.naoEncontradaDescription}
          action={<ButtonLink to={paths.obras}>{t.naoEncontradaAction}</ButtonLink>}
        />
      }
    >
      {(ficha) =>
        ficha && (
          <Stack>
            <PageHeader level="subpage" back={{ to: paths.obras, label: t.voltar }} title={ficha.obra.nome} />
            <FornecedoresDaObra fornecedores={ficha.fornecedores} />
          </Stack>
        )
      }
    </AsyncContent>
  );
}
