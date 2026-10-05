import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { useParams } from 'react-router';
import { ConfiguracaoLista, useLista } from '@/features/exigencias';
import { paths, useDocumentTitle } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { AsyncContent, ButtonLink, EmptyState, Skeleton, SkeletonTable, Stack } from '@/shared/ui';

const t = strings.pages.lista;

export function ListaPage() {
  const { id = '' } = useParams();
  const query = useLista(id);
  useDocumentTitle(query.data?.lista.nome ?? strings.pages.exigencias.title);
  return (
    <AsyncContent
      query={query}
      skeleton={
        <Stack>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-96 max-w-full" />
          <SkeletonTable rows={5} columns={5} />
        </Stack>
      }
      isEmpty={(d) => d === null}
      empty={
        <EmptyState
          icon={ClipboardDocumentListIcon}
          title={t.naoEncontradaTitle}
          description={t.naoEncontradaDescription}
          action={<ButtonLink to={paths.exigencias}>{t.naoEncontradaAction}</ButtonLink>}
        />
      }
    >
      {(detalhe) => detalhe && <ConfiguracaoLista detalhe={detalhe} />}
    </AsyncContent>
  );
}
