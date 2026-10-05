import { DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useParams } from 'react-router';
import { AnaliseDocumento, CabecalhoAnalise, useDocumentoAnalise, useHoje, useOrigem, useSequencia } from '@/features/analise';
import { paths, useDocumentTitle } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { AsyncContent, Badge, ButtonLink, EmptyState, Stack } from '@/shared/ui';
import { AnaliseSkeleton } from './AnaliseSkeleton';

const t = strings.pages.analise;

/** Documento da empresa: decidir (em análise) ou ler (já decidido), lembrando de onde veio. */
export function AnalisePage() {
  const { id = '' } = useParams();
  const origem = useOrigem();
  const query = useDocumentoAnalise(id);
  const sequencia = useSequencia(origem, id);
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
          action={<ButtonLink to={paths.origem(origem)}>{t.naoEncontradoAction}</ButtonLink>}
        />
      }
    >
      {(detalhe) =>
        detalhe && (
          <Stack>
            <CabecalhoAnalise
              origem={origem}
              sequencia={sequencia}
              title={detalhe.exigido.nome}
              badges={<Badge status={detalhe.status} />}
              subtitle={detalhe.fornecedor.razaoSocial}
            />
            <AnaliseDocumento key={detalhe.documento.id} detalhe={detalhe} hoje={hoje} origem={origem} />
          </Stack>
        )
      }
    </AsyncContent>
  );
}
