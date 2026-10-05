import { DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useParams } from 'react-router';
import { AnaliseDocumento, useEnvio, useHoje } from '@/features/analise';
import { paths, useDocumentTitle } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { AsyncContent, Badge, ButtonLink, EmptyState, PageHeader, Stack } from '@/shared/ui';
import { AnaliseSkeleton } from './AnaliseSkeleton';

const t = strings.pages.analise;

export function AnalisePage() {
  const { id = '' } = useParams();
  const query = useEnvio(id);
  const hoje = useHoje();
  useDocumentTitle(query.data?.exigido.nome ?? strings.pages.fila.title);

  return (
    <AsyncContent
      query={query}
      skeleton={<AnaliseSkeleton />}
      isEmpty={(detalhe) => detalhe === null}
      empty={
        <EmptyState
          icon={DocumentMagnifyingGlassIcon}
          title={t.naoEncontradoTitle}
          description={t.naoEncontradoDescription}
          action={<ButtonLink to={paths.fila}>{t.naoEncontradoAction}</ButtonLink>}
        />
      }
    >
      {(detalhe) =>
        detalhe && (
          <Stack>
            <PageHeader
              level="subpage"
              back={{ to: paths.fila, label: t.voltar, style: 'icon' }}
              title={detalhe.exigido.nome}
              badges={<Badge status={detalhe.status} />}
              subtitle={detalhe.fornecedor.razaoSocial}
            />
            <AnaliseDocumento key={detalhe.documento.id} detalhe={detalhe} hoje={hoje} />
          </Stack>
        )
      }
    </AsyncContent>
  );
}
